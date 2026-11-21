import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Krm3Filter, { FilterField, lastPeriodField } from "./Krm3Filter";
import { describeFilter, filterUrl } from "./Krm3SavedFilters";
import { useSavedFilters, useSaveFilter } from "../../hooks/useSavedFilters";
import type { SavedFilter } from "../../restapi/savedFilters";

vi.mock("../../hooks/useSavedFilters", () => ({
  useSavedFilters: vi.fn(),
  useSaveFilter: vi.fn(),
}));

const fields: FilterField[] = [
  { name: "search", label: "Search", type: "text" },
  {
    name: "status",
    label: "Status",
    type: "multiselect",
    options: [
      { value: "DRAFT", label: "Draft" },
      { value: "SUBMITTED", label: "Submitted" },
    ],
  },
  { name: "dateFrom", label: "From", type: "date" },
];

const drafts: SavedFilter = {
  id: 7,
  page: "missions",
  name: "Drafts",
  values: { status: ["DRAFT"], unknown: "ignored" },
  summary: "Status: Draft",
  url: "/trasferte?status=DRAFT",
  isDefault: false,
};

const onSubmit = vi.fn();
const mutate = vi.fn();

function mockSaved(saved: SavedFilter[]) {
  vi.mocked(useSavedFilters).mockReturnValue({ data: saved } as unknown as ReturnType<
    typeof useSavedFilters
  >);
}

function renderFilter(savedFiltersPage: string | null = "missions") {
  render(
    <Krm3Filter
      fields={fields}
      values={{}}
      onSubmit={onSubmit}
      savedFiltersPage={savedFiltersPage ?? undefined}
    />
  );
  fireEvent.click(screen.getByTestId("filter-button"));
}

function saveAs(name: string) {
  fireEvent.click(screen.getByTestId("filter-save-as"));
  fireEvent.change(screen.getByLabelText("Filter name"), { target: { value: name } });
  fireEvent.click(screen.getByTestId("filter-save-confirm"));
}

describe("describeFilter", () => {
  it("lists the non-empty fields with their labels and the option labels", () => {
    expect(
      describeFilter(fields, { search: " rome ", status: ["DRAFT", "SUBMITTED"], dateFrom: "" })
    ).toBe("Search: rome; Status: Draft, Submitted");
  });

  it("keeps values that are not among the options", () => {
    expect(describeFilter(fields, { status: ["GONE"] })).toBe("Status: GONE");
  });
});

describe("describeFilter with a Last period", () => {
  it("writes the period in words", () => {
    const withLast: FilterField[] = [
      ...fields,
      {
        name: "last",
        label: "Last",
        type: "relativePeriod",
        fromField: "dateFrom",
        toField: "dateTo",
      },
    ];
    expect(describeFilter(withLast, { last: "3m" })).toBe("Last: 3 months");
  });
});

describe("filterUrl", () => {
  afterEach(() => window.history.replaceState(null, "", "/"));

  it("applies the filter to the current address, keeping the other parameters", () => {
    window.history.replaceState(null, "", "/trasferte?tab=spese&page=3&search=old");

    expect(filterUrl(fields, { status: ["DRAFT", "SUBMITTED"] })).toBe(
      "/trasferte?tab=spese&status=DRAFT%2CSUBMITTED"
    );
  });
});

describe("Krm3Filter saved filters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSaved([drafts]);
    vi.mocked(useSaveFilter).mockReturnValue({ mutate, isLoading: false } as unknown as ReturnType<
      typeof useSaveFilter
    >);
    window.history.replaceState(null, "", "/trasferte");
  });

  it("offers no saved filters without a page", () => {
    renderFilter(null);

    expect(screen.queryByTestId("filter-saved")).not.toBeInTheDocument();
    expect(screen.queryByTestId("filter-save-as")).not.toBeInTheDocument();
  });

  it("applies a saved filter picked from the list and closes", () => {
    renderFilter();

    fireEvent.change(screen.getByLabelText("Saved filters"), { target: { value: "7" } });

    expect(onSubmit).toHaveBeenCalledWith({ status: ["DRAFT"] });
    expect(screen.queryByTestId("filter-panel")).not.toBeInTheDocument();
  });

  it("hides the list when there are no saved filters", () => {
    mockSaved([]);
    renderFilter();

    expect(screen.queryByTestId("filter-saved")).not.toBeInTheDocument();
    expect(screen.getByTestId("filter-save-as")).toBeInTheDocument();
  });

  it("saves the edited values with a name, then applies them", () => {
    mutate.mockImplementation((_payload, { onSuccess }) => onSuccess());
    renderFilter();
    fireEvent.click(screen.getByLabelText("Submitted"));

    saveAs("  Submitted only ");

    expect(mutate).toHaveBeenCalledWith(
      {
        name: "Submitted only",
        values: { status: ["SUBMITTED"] },
        summary: "Status: Submitted",
        url: "/trasferte?status=SUBMITTED",
        isDefault: false,
      },
      expect.anything()
    );
    expect(onSubmit).toHaveBeenCalledWith({ status: ["SUBMITTED"] });
    expect(screen.queryByTestId("filter-panel")).not.toBeInTheDocument();
  });

  it("asks for a name", () => {
    renderFilter();

    saveAs("   ");

    expect(screen.getByRole("alert")).toHaveTextContent("Enter a name for the filter.");
    expect(mutate).not.toHaveBeenCalled();
  });

  it("asks before replacing a saved filter with the same name", () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    renderFilter();

    saveAs("Drafts");

    expect(confirm).toHaveBeenCalledWith('Replace the saved filter "Drafts"?');
    expect(mutate).not.toHaveBeenCalled();

    confirm.mockReturnValue(true);
    fireEvent.click(screen.getByTestId("filter-save-confirm"));
    expect(mutate).toHaveBeenCalledTimes(1);
    confirm.mockRestore();
  });

  it("shows an error when saving fails and keeps the panel open", () => {
    mutate.mockImplementation((_payload, { onError }) => onError());
    renderFilter();

    saveAs("Mine");

    expect(screen.getByRole("alert")).toHaveTextContent("The filter could not be saved.");
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByTestId("filter-panel")).toBeInTheDocument();
  });

  it("saves with Enter without submitting the filter form", () => {
    renderFilter();
    fireEvent.click(screen.getByTestId("filter-save-as"));
    fireEvent.change(screen.getByLabelText("Filter name"), { target: { value: "Mine" } });

    act(() => {
      fireEvent.keyDown(screen.getByLabelText("Filter name"), { key: "Enter" });
    });

    expect(mutate).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("cancels saving", () => {
    renderFilter();
    fireEvent.click(screen.getByTestId("filter-save-as"));

    fireEvent.click(screen.getByTestId("filter-save-cancel"));

    expect(screen.queryByLabelText("Filter name")).not.toBeInTheDocument();
    expect(screen.getByTestId("filter-save-as")).toBeInTheDocument();
  });

  it("saves the filter as default when asked", () => {
    renderFilter();
    fireEvent.click(screen.getByTestId("filter-save-as"));
    fireEvent.change(screen.getByLabelText("Filter name"), { target: { value: "Mine" } });
    fireEvent.click(screen.getByLabelText(/^Default/));
    fireEvent.click(screen.getByTestId("filter-save-confirm"));

    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Mine", isDefault: true }),
      expect.anything()
    );
  });

  it("does not save a filter with errors", () => {
    render(
      <Krm3Filter
        fields={[...fields, lastPeriodField()]}
        values={{}}
        onSubmit={onSubmit}
        savedFiltersPage="missions"
      />
    );
    fireEvent.click(screen.getByTestId("filter-button"));
    fireEvent.change(screen.getByLabelText("Last"), { target: { value: "soon" } });

    saveAs("Mine");

    expect(mutate).not.toHaveBeenCalled();
    expect(screen.getByText("Fix the filter before saving it.")).toBeInTheDocument();
    expect(screen.getByText(/Use a number followed by d/)).toBeInTheDocument();
  });

  it("marks the default filter in the list", () => {
    mockSaved([{ ...drafts, isDefault: true }]);
    renderFilter();

    expect(screen.getByRole("option", { name: "Drafts (default)" })).toBeInTheDocument();
  });
});

describe("default saved filter", () => {
  beforeEach(() => vi.clearAllMocks());

  const renderPage = (values = {}) =>
    render(
      <Krm3Filter fields={fields} values={values} onSubmit={onSubmit} savedFiltersPage="missions" />
    );

  it("is applied, replacing the history entry, when the page opens without filters", () => {
    mockSaved([{ ...drafts, isDefault: true }]);

    renderPage();

    expect(onSubmit).toHaveBeenCalledWith({ status: ["DRAFT"] }, { replace: true });
  });

  it("is not applied when the page opens with filters", () => {
    mockSaved([{ ...drafts, isDefault: true }]);

    renderPage({ search: "rome" });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("is not applied when there is none", () => {
    mockSaved([drafts]);

    renderPage();

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("is applied only once, when the saved filters are loaded", () => {
    vi.mocked(useSavedFilters).mockReturnValue({ data: undefined } as unknown as ReturnType<
      typeof useSavedFilters
    >);
    const { rerender } = renderPage();
    expect(onSubmit).not.toHaveBeenCalled();

    mockSaved([{ ...drafts, isDefault: true }]);
    rerender(
      <Krm3Filter fields={fields} values={{}} onSubmit={onSubmit} savedFiltersPage="missions" />
    );
    rerender(
      <Krm3Filter fields={fields} values={{}} onSubmit={onSubmit} savedFiltersPage="missions" />
    );

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
