import { Mission } from "./Mission.tsx";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import * as useMissons from "../../hooks/useMissions";
import * as useView from "../../hooks/useView";
import * as useAuth from "../../hooks/useAuth";

vi.mock("../expense/edit/ExpenseEdit", () => {
  return { ExpenseEdit: vi.fn(() => <div>Mocked ExpenseEdit</div>) };
});
import { ExpenseEdit } from "../expense/edit/ExpenseEdit.tsx";
import moment from "moment/moment";
import {
  City,
  Currency,
  ExpenseInterface,
  MissionInterface,
  Project,
  Resource,
} from "../../restapi/types.ts";
vi.mock("react-router-dom", async () => {
  const actual: any = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: () => ({ id: "1" }),
  };
});
describe("Mission", () => {
  beforeEach(() => {
    vi.spyOn(useMissons, "useGetMission").mockReturnValue({
      dataUpdatedAt: 0,
      error: null,
      errorUpdatedAt: 0,
      failureCount: 0,
      isError: false,
      isFetched: false,
      isFetchedAfterMount: false,
      isFetching: false,
      isIdle: false,
      isLoading: false,
      isLoadingError: false,
      isPlaceholderData: false,
      isPreviousData: false,
      isRefetchError: false,
      isRefetching: false,
      isStale: false,
      isSuccess: true,
      status: "success",
      refetch: vi.fn(),
      remove: vi.fn(),
      data: {
        city: {
          id: 1,
          name: "Warsaw",
          country: 1,
        } as City,
        defaultCurrency: {
          iso3: "PLN",
          title: "zloty",
          symbol: "zł",
          fractionalUnit: "grosz",
          base: 100,
          active: true,
        } as Currency,
        fromDate: "2025-01-01",
        id: 1,
        number: 1,
        status: "SUBMITTED" as const,
        title: "some mission",
        project: {
          id: 1,
          name: "example project",
          notes: "",
          client: 1,
        } as Project,
        resource: {
          id: 1,
          firstName: "Jan",
          lastName: "Kowal",
          profile: {
            id: 1,
            user: 1,
            picture: "some/path",
          },
        } as Resource,
        toDate: "2026-01-01",
        year: 2025,
        expenses: [
          {
            active: true,
            id: 123,
            currency: "PLN",
            title: "Example title",
            amountCurrency: "101",
            amountReimbursement: "102",
            day: "2025-01-05",
            amountBase: "103",
            detail: "some details",
            image: "some/image/path",
            createdTs: "2025-01-01",
            modifiedTs: "2025-01-02",
            mission: 1,
            documentType: {
              active: true,
              default: false,
              id: 1,
              title: "some document type",
            },
            category: {
              active: true,
              id: 1,
              str: "some category",
              title: "some category title",
            },
            paymentType: {
              active: true,
              id: 0,
              title: "some payment type",
              str: "some payment type",
            } as const,
            reimbursement: 0,
          } as ExpenseInterface,
        ],
      } as MissionInterface,
      errorUpdateCount: 0,
    });
    vi.spyOn(useView, "useMediaQuery").mockReturnValue(false);
    mockCurrentUser({ resourceId: 1 });
    submitMutate.mockReset();
    vi.spyOn(useMissons, "useSubmitMission").mockReturnValue({
      mutate: submitMutate,
      isLoading: false,
    } as unknown as ReturnType<typeof useMissons.useSubmitMission>);
  });

  const submitMutate = vi.fn();

  function mockCurrentUser({ resourceId, perms = [] }: { resourceId?: number; perms?: string[] }) {
    vi.spyOn(useAuth, "useGetCurrentUser").mockReturnValue({
      data: { resource: resourceId ? { id: resourceId } : null },
      userCan: (required: string[]) => required.every((p) => perms.includes(p)),
    } as unknown as ReturnType<typeof useAuth.useGetCurrentUser>);
  }

  function mockDraftMission() {
    const current = useMissons.useGetMission(1);
    vi.spyOn(useMissons, "useGetMission").mockReturnValue({
      ...current,
      data: { ...current.data, status: "DRAFT", number: null, title: "" },
    } as unknown as ReturnType<typeof useMissons.useGetMission>);
  }

  it("shows the status and hides submit for a submitted mission", () => {
    render(<Mission />);
    expect(screen.getByTestId("mission-status")).toHaveTextContent("Submitted");
    expect(screen.queryByTestId("submit-mission-button")).not.toBeInTheDocument();
  });
  it("owner can submit a draft mission", () => {
    mockDraftMission();
    render(<Mission />);
    expect(screen.getByTestId("mission-status")).toHaveTextContent("Draft");
    expect(screen.getByText("Number Mission: assigned on submission")).toBeInTheDocument();
    expect(screen.getByText("Warsaw 2025-01-01 - 2026-01-01")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("submit-mission-button"));
    expect(submitMutate).toBeCalledWith(1, { onError: expect.any(Function) });
  });
  it("hides submit for a draft of another resource without manage permission", () => {
    mockDraftMission();
    mockCurrentUser({ resourceId: 99, perms: ["core.view_any_mission"] });
    render(<Mission />);
    expect(screen.queryByTestId("submit-mission-button")).not.toBeInTheDocument();
  });
  it("mission manager can submit a draft of another resource", () => {
    mockDraftMission();
    mockCurrentUser({ resourceId: 99, perms: ["core.manage_any_mission"] });
    render(<Mission />);
    expect(screen.getByTestId("submit-mission-button")).toBeInTheDocument();
  });
  it("shows submit errors", async () => {
    mockDraftMission();
    submitMutate.mockImplementation((_id, options) =>
      options.onError({
        message: "Request failed with status code 400",
        response: { data: ["Cannot change status SUBMITTED to SUBMITTED"] },
      })
    );
    render(<Mission />);
    fireEvent.click(screen.getByTestId("submit-mission-button"));
    expect(await screen.findByTestId("submit-mission-errors")).toHaveTextContent(
      "Cannot change status"
    );
  });
  it("renders correctly", () => {
    render(<Mission />);
    expect(screen.getByText("Warsaw")).toBeInTheDocument();
    expect(screen.getByText("366 days")).toBeInTheDocument();
    expect(screen.getByText("example project")).toBeInTheDocument();
    expect(screen.getByText("Jan Kowal")).toBeInTheDocument();
    expect(screen.getByText("Number Mission: 1")).toBeInTheDocument();
    expect(screen.getByText("some mission")).toBeInTheDocument();
    expect(screen.queryByTestId("add-expense-button")).toBeInTheDocument();
  });
  it("does not render add expense button on small screen", () => {
    vi.spyOn(useView, "useMediaQuery").mockReturnValue(true);
    render(<Mission />);
    expect(screen.queryByTestId("add-expense-button")).not.toBeInTheDocument();
  });
  it("click on expense should render ExpenseEdit with correct params", () => {
    render(<Mission />);
    expect(screen.queryByText("Mocked ExpenseEdit")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("some payment type"));
    expect(screen.getByText("Mocked ExpenseEdit")).toBeInTheDocument();
    expect(ExpenseEdit).toBeCalledWith(
      {
        show: true,
        expense: expect.objectContaining({
          active: true,
          id: 123,
          currency: "PLN",
          title: "Example title",
          amountCurrency: "101",
          amountReimbursement: "102",
          day: "2025-01-05",
          amountBase: "103",
          detail: "some details",
          image: "some/image/path",
          createdTs: "2025-01-01",
          modifiedTs: "2025-01-02",
        }),
        onClose: expect.any(Function),
      },
      expect.any(Object)
    );
  });
  it("clicking on add expense button opens ExpenseEdit with default parameters", () => {
    render(<Mission />);
    expect(screen.queryByText("Mocked ExpenseEdit")).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId("add-expense-button"));
    expect(screen.getByText("Mocked ExpenseEdit")).toBeInTheDocument();
    const today = new Date();
    expect(ExpenseEdit).toBeCalledWith(
      {
        show: true,
        expense: {
          mission: 1,
          amountCurrency: "0",
          day: moment(today).format("YYYY-MM-DD"),
        },
        onClose: expect.any(Function),
      },
      expect.any(Object)
    );
  });
});
