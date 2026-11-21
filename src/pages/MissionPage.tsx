import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGetResources, useMissionList } from "../hooks/useMissions";
import LoadSpinner from "../components/commons/LoadSpinner";
import { ExpenseInterface } from "../restapi/types";
import { CreateMission } from "../components/missions/create/CreateMission";
import { useMediaQuery } from "../hooks/useView";
import { useGetCurrentUser } from "../hooks/useAuth";
import { useExpenseList } from "../hooks/useExpense";
import Tabs from "../components/commons/TopTabs";
import Krm3Table from "../components/commons/Krm3Table";
import Krm3Filter, {
  FilterField,
  FilterOption,
  lastPeriodField,
} from "../components/commons/Krm3Filter";
import { missionDisplayTitle } from "../utils/mission";
import { ExpenseEdit } from "../components/expense/edit/ExpenseEdit";
import { toApiParams, useListParams } from "../hooks/useListParams";
import Krm3ColumnChooser from "../components/commons/Krm3ColumnChooser";
import { useColumnVisibility } from "../hooks/useColumnVisibility";

const PAGE_SIZE = 25;
// the resource autocomplete suggests nothing until this many characters are typed, and follows the
// typing only after a pause
const RESOURCE_MIN_QUERY_LENGTH = 3;
const RESOURCE_DEBOUNCE_MS = 400;

/** Shown when the status filter is empty: cancelled missions are hidden unless asked for. */
export const DEFAULT_MISSION_STATUSES = ["DRAFT", "SUBMITTED"];

const STATUS_OPTIONS: FilterOption[] = [
  { value: "DRAFT", label: "Draft" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "CANCELLED", label: "Cancelled" },
];

// the accessorKeys are also the API ordering names
const MISSION_COLUMNS = [
  { accessorKey: "id", header: "Id" },
  { accessorKey: "number", header: "Number" },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "fromDate", header: "From" },
  { accessorKey: "toDate", header: "To" },
  { accessorKey: "title", header: "Title" },
  { accessorKey: "resource", header: "Resource" },
];

const EXPENSE_COLUMNS = [
  { accessorKey: "id", header: "Id" },
  { accessorKey: "day", header: "Data" },
  { accessorKey: "mission", header: "id Missione" },
  { accessorKey: "missionTitle", header: "Titolo Missione" },
  { accessorKey: "resource", header: "Risorsa" },
  { accessorKey: "amountCurrency", header: "Importo in EUR" },
];

function pageCount(count: number | undefined): number {
  return Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));
}

function useResourceOptions(enabled: boolean): FilterOption[] {
  const resources = useGetResources(enabled);
  return useMemo(
    () =>
      (resources?.results ?? []).map((r) => ({
        value: String(r.id),
        label: `${r.firstName} ${r.lastName}`,
      })),
    [resources]
  );
}

function MissionList() {
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery("(max-width: 767.98px)");
  const { userCan } = useGetCurrentUser();
  const canAddMission = userCan(["core.add_mission"]);
  const canSeeOthers = userCan(["core.view_any_mission"]) || userCan(["core.manage_any_mission"]);
  const [openModal, setOpenModal] = useState(false);
  const resourceOptions = useResourceOptions(canSeeOthers);

  const fields: FilterField[] = useMemo(
    () => [
      { name: "search", label: "Search", type: "text", placeholder: "Title, place, project, ..." },
      {
        name: "status",
        label: "Status (none: all but Cancelled)",
        type: "multiselect",
        options: STATUS_OPTIONS,
      },
      ...(canSeeOthers
        ? [
            {
              name: "resource",
              label: "Resource",
              type: "autocomplete",
              options: resourceOptions,
              placeholder: "Type at least 3 characters",
              minQueryLength: RESOURCE_MIN_QUERY_LENGTH,
              debounceMs: RESOURCE_DEBOUNCE_MS,
            } as FilterField,
          ]
        : []),
      { name: "dateFrom", label: "From", type: "date" },
      { name: "dateTo", label: "To", type: "date" },
      lastPeriodField(),
      { name: "year", label: "Year", type: "number", placeholder: "e.g. 2025" },
      { name: "number", label: "Number", type: "number" },
    ],
    [canSeeOthers, resourceOptions]
  );
  const list = useListParams(fields);
  const apiParams = toApiParams(list, PAGE_SIZE, fields);
  if (!apiParams.status) apiParams.status = DEFAULT_MISSION_STATUSES.join(",");
  const { isLoading, data, isError } = useMissionList(apiParams);
  const columns = useColumnVisibility("missions", MISSION_COLUMNS, ["id"]);

  return (
    <>
      <div className="flex justify-end items-center gap-2 mb-4">
        {canAddMission && !isSmallScreen && (
          <button
            type="button"
            data-testid="add-mission-button"
            className="bg-krm3-primary text-white px-4 py-2 rounded shadow hover:bg-yellow-400"
            onClick={() => setOpenModal(true)}
          >
            + Add mission
          </button>
        )}
        <Krm3Filter
          testId="mission-filter"
          title="Filter missions"
          savedFiltersPage="missions"
          fields={fields}
          values={list.filters}
          onSubmit={list.setFilters}
        />
        <Krm3ColumnChooser
          testId="mission-columns"
          columns={MISSION_COLUMNS}
          visible={columns.visible}
          onChange={columns.setVisible}
          onReset={columns.reset}
        />
      </div>
      {isLoading && <LoadSpinner />}
      {isError && (
        <div className="text-red-500 text-center">
          <p>Errore</p>
        </div>
      )}
      {!!data && (
        <Krm3Table
          onClickRow={(item) => navigate(`/trasferte/${item.id}`)}
          ordering={list.ordering}
          onOrderingChange={list.setOrdering}
          pagination={{
            page: list.page,
            pageCount: pageCount(data.count),
            onPageChange: list.setPage,
          }}
          columns={columns.visibleColumns(MISSION_COLUMNS)}
          data={data.results.map((item) => ({
            id: item.id,
            number: item.number ?? "-",
            status: item.status,
            fromDate: item.fromDate,
            toDate: item.toDate,
            title: missionDisplayTitle(item),
            resource: `${item.resource.firstName} ${item.resource.lastName}`,
          }))}
        />
      )}
      {openModal && <CreateMission show={openModal} onClose={() => setOpenModal(false)} />}
    </>
  );
}

function ExpenseList() {
  const { userCan } = useGetCurrentUser();
  const canSeeOthers = userCan(["core.view_any_expense"]) || userCan(["core.manage_any_expense"]);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseInterface | null>();
  const resourceOptions = useResourceOptions(canSeeOthers);

  const fields: FilterField[] = useMemo(
    () => [
      {
        name: "search",
        label: "Search",
        type: "text",
        placeholder: "Detail, mission, category, ...",
      },
      ...(canSeeOthers
        ? [
            {
              name: "resource",
              label: "Resource",
              type: "autocomplete",
              options: resourceOptions,
              placeholder: "Type at least 3 characters",
              minQueryLength: RESOURCE_MIN_QUERY_LENGTH,
              debounceMs: RESOURCE_DEBOUNCE_MS,
            } as FilterField,
          ]
        : []),
      { name: "mission", label: "Mission id", type: "number" },
      { name: "dateFrom", label: "From", type: "date" },
      { name: "dateTo", label: "To", type: "date" },
      lastPeriodField(),
    ],
    [canSeeOthers, resourceOptions]
  );
  const list = useListParams(fields);
  const { data, isError } = useExpenseList(toApiParams(list, PAGE_SIZE, fields));
  const columns = useColumnVisibility("expenses", EXPENSE_COLUMNS, ["id"]);

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p className="text-2xl font-semibold">Ultime Spese Aggiunte</p>
        <div className="flex items-center gap-2">
          <Krm3Filter
            testId="expense-filter"
            title="Filter expenses"
            savedFiltersPage="expenses"
            fields={fields}
            values={list.filters}
            onSubmit={list.setFilters}
          />
          <Krm3ColumnChooser
            testId="expense-columns"
            columns={EXPENSE_COLUMNS}
            visible={columns.visible}
            onChange={columns.setVisible}
            onReset={columns.reset}
          />
        </div>
      </div>
      {isError && (
        <div className="text-red-500 text-center">
          <p>Errore</p>
        </div>
      )}
      {!!data && (
        <Krm3Table
          onClickRow={(item) => setSelectedExpense(item)}
          ordering={list.ordering}
          onOrderingChange={list.setOrdering}
          pagination={{
            page: list.page,
            pageCount: pageCount(data.count),
            onPageChange: list.setPage,
          }}
          columns={columns.visibleColumns(EXPENSE_COLUMNS)}
          data={data.results.map((item: ExpenseInterface) => ({
            ...item,
            missionTitle: item.missionTitle ?? "",
            resource: item.resourceName ?? "",
          }))}
        />
      )}
      {!!selectedExpense && (
        <ExpenseEdit
          expense={selectedExpense}
          onClose={() => setSelectedExpense(null)}
          show={!!selectedExpense}
        />
      )}
    </>
  );
}

export function MissionPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") === "spese" ? "spese" : "trasferte";

  // each tab has its own filters: switching tab starts from a clean query string
  function setActiveTab(tab: string) {
    setSearchParams(tab === "spese" ? { tab } : {});
  }

  return (
    <>
      <Tabs key={activeTab} activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className=" mx-auto px-8">
        {activeTab === "trasferte" ? <MissionList /> : <ExpenseList />}
      </div>
    </>
  );
}
