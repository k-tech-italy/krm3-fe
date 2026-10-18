import * as useMissions from "../../../hooks/useMissions";
import { vi } from "vitest";
import * as useExpense from "../../../hooks/useExpense";
import * as useAuth from "../../../hooks/useAuth";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CreateMission } from "./CreateMission.tsx";
describe("CreateMission", () => {
  const createMissionMock = vi.fn((_variables, options?: { onSuccess?: () => void }) => {
    if (options && options.onSuccess) {
      options.onSuccess();
    }
  });
  const onCloseMock = vi.fn();
  beforeEach(() => {
    vi.spyOn(useAuth, "useGetCurrentUser").mockReturnValue({
      data: { resource: null },
      userCan: () => true,
    } as unknown as ReturnType<typeof useAuth.useGetCurrentUser>);
    vi.spyOn(useMissions, "useCreateMission").mockReturnValue({
      isError: false,
      mutate: createMissionMock,
      error: null,
      isLoading: false,
    } as any);

    vi.spyOn(useMissions, "useGetResources").mockReturnValue({
      count: 2,
      next: null,
      previous: null,
      results: [
        {
          id: 1,
          firstName: "Jan",
          lastName: "Kowal",
          profile: {
            id: 1,
            user: 1,
            picture: "some/path",
          },
        },
        {
          id: 2,
          firstName: "Anna",
          lastName: "Nowak",
          profile: {
            id: 2,
            user: 2,
            picture: "another/path",
          },
        },
      ],
    });
    vi.spyOn(useMissions, "useGetClients").mockReturnValue({
      count: 2,
      next: null,
      previous: null,
      results: [
        {
          id: 1,
          name: "client 1",
        },
        {
          id: 2,
          name: "client 2",
        },
      ],
    });
    vi.spyOn(useMissions, "useGetProjects").mockReturnValue({
      count: 2,
      next: null,
      previous: null,
      results: [
        {
          id: 1,
          name: "example project",
          notes: "",
          client: 1,
        },
        {
          id: 2,
          name: "another project",
          notes: "notes",
          client: 2,
        },
      ],
    });
    vi.spyOn(useMissions, "useGetCountries").mockReturnValue({
      count: 2,
      next: null,
      previous: null,
      results: [
        {
          id: 1,
          name: "Poland",
        },
        {
          id: 2,
          name: "Italy",
        },
      ],
    });
    vi.spyOn(useMissions, "useGetCitiess").mockReturnValue({
      count: 2,
      next: null,
      previous: null,
      results: [
        {
          id: 1,
          name: "Warsaw",
          country: 1,
        },
        {
          id: 2,
          name: "Rome",
          country: 2,
        },
        {
          id: 3,
          name: "Venice",
          country: 2,
        },
      ],
    });
    vi.spyOn(useExpense, "useGetCurrencies").mockReturnValue({
      count: 1,
      next: null,
      previous: null,
      results: [
        {
          iso3: "PLN",
          title: "zloty",
          symbol: "zł",
          fractionalUnit: "grosz",
          base: 100,
          active: true,
        },
        {
          iso3: "EUR",
          title: "euro",
          symbol: "€",
          fractionalUnit: "cent",
          base: 100,
          active: true,
        },
      ],
    });
  });
  const props = {
    onClose: onCloseMock,
    show: true,
  };
  it("renders correctly", () => {
    render(<CreateMission {...props} />);
    expect(screen.getByText("Create Mission")).toBeInTheDocument();
    expect(screen.getByText("Poland")).toBeInTheDocument();
    expect(screen.getByText("Italy")).toBeInTheDocument();
    expect(screen.getByText("PLN")).toBeInTheDocument();
  });
  it("does not render when show is false", () => {
    render(<CreateMission {...props} show={false} />);
    expect(screen.queryByText("Create Mission")).not.toBeInTheDocument();
  });
  it("changes data and saves", async () => {
    render(<CreateMission {...props} />);
    fireEvent.change(screen.getByTestId("title-input"), { target: { value: "changed title" } });
    fireEvent.change(screen.getByTestId("first-name-select"), { target: { value: "2" } });
    fireEvent.change(screen.getByTestId("project-select"), { target: { value: "2" } });
    fireEvent.change(screen.getByTestId("country-select"), { target: { value: "2" } });
    fireEvent.change(screen.getByTestId("city-select"), { target: { value: "3" } });
    fireEvent.change(screen.getByTestId("currency-select"), { target: { value: "EUR" } });
    fireEvent.change(
      document.getElementById("create-mission-form-from-date-picker") as HTMLElement,
      { target: { value: "2026-01-01" } }
    );
    fireEvent.change(document.getElementById("create-mission-form-to-date-picker") as HTMLElement, {
      target: { value: "2027-01-01" },
    });
    fireEvent.click(screen.getByTestId("save-button"));
    await waitFor(() => {
      expect(createMissionMock).toBeCalledWith(
        expect.objectContaining({
          city: expect.objectContaining({
            name: "Venice",
          }),
          defaultCurrency: expect.objectContaining({
            iso3: "EUR",
          }),
          fromDate: "2026-01-01",
          toDate: "2027-01-01",
          project: expect.objectContaining({
            name: "another project",
          }),
          resource: expect.objectContaining({
            firstName: "Anna",
            lastName: "Nowak",
            id: 2,
          }),
          title: "changed title",
        }),
        {
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        }
      );
    });
  });
  it("saves without a title", async () => {
    createMissionMock.mockClear();
    render(<CreateMission {...props} />);
    fireEvent.change(screen.getByTestId("title-input"), { target: { value: "" } });
    fireEvent.click(screen.getByTestId("save-button"));
    await waitFor(() => expect(createMissionMock).toBeCalled());
  });
  it("shows the server validation errors", async () => {
    const failingMutate = vi.fn((_variables, options?: { onError?: (err: unknown) => void }) => {
      options?.onError?.({
        message: "Request failed with status code 400",
        response: { data: { nonFieldErrors: ["to_date must be > from_date"] } },
      });
    });
    vi.spyOn(useMissions, "useCreateMission").mockReturnValue({
      isError: true,
      mutate: failingMutate,
      error: null,
      isLoading: false,
    } as unknown as ReturnType<typeof useMissions.useCreateMission>);
    onCloseMock.mockClear();
    render(<CreateMission {...props} />);
    fireEvent.click(screen.getByTestId("save-button"));
    await waitFor(() =>
      expect(screen.getByTestId("create-mission-errors")).toHaveTextContent(
        "to_date must be > from_date"
      )
    );
    expect(onCloseMock).not.toBeCalled();
  });
  it("should render loading info", () => {
    vi.spyOn(useMissions, "useCreateMission").mockReturnValue({
      isError: false,
      mutate: createMissionMock,
      error: null,
      isLoading: true,
    } as any);
    render(<CreateMission {...props} />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
