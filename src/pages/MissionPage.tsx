import { useState } from "react";
import { useGetMissions } from "../hooks/useMissions";
import LoadSpinner from "../components/commons/LoadSpinner";
import FilterResource from "../components/missions/filter";
import { ExpenseInterface, MissionInterface } from "../restapi/types";
import { CreateMission } from "../components/missions/create/CreateMission";
import { useMediaQuery } from "../hooks/useView";
import { useGetCurrentUser } from "../hooks/useAuth";
import { useGetExpense } from "../hooks/useExpense";
import ExpenseFilter from "../components/expense/ExpenseFilter";
import Tabs from "../components/commons/TopTabs";
import Krm3Table from "../components/commons/Krm3Table";
import { ExpenseEdit } from "../components/expense/edit/ExpenseEdit";

export function MissionPage() {
  const { isLoading, data, isError } = useGetMissions();
  const isSmallScreen = useMediaQuery("(max-width: 767.98px)");
  const { data: exepenses } = useGetExpense();
  const [dataFiltered, setDataFiltered] = useState<
    MissionInterface[] | undefined
  >();
  const [expenseFiltered, setExpenseFiltered] = useState<
    ExpenseInterface[] | undefined
  >();
  const [selectedExpense, setSelectedExpense] =
    useState<ExpenseInterface | null>();
  const [openModal, setOpenModal] = useState(false);
  const { data: user } = useGetCurrentUser();
  const [activeTab, setActiveTab] = useState<string>("trasferte");

  function handleFilter(e: any) {
    setDataFiltered(e);
  }

  function handleFilterExpense(e: any): void {
    setExpenseFiltered(e);
  }

  return (
    <>
      <Tabs activeTab={activeTab} setActiveTab={(e) => setActiveTab(e)} tabs={[
        {label: 'Trasferte', value: 'trasferte'},
        {label: 'Spese', value: 'spese'}
      ]} />
      <div className=" mx-auto px-8">
        {isLoading && <LoadSpinner />}
        {isError && (
          <div className="text-red-500 text-center">
            <p>Errore</p>
          </div>
        )}
        {!!data && (
          <div>
            {activeTab === "trasferte" && (
              <>
                {user?.isStaff && !isSmallScreen && (
                  <div className="flex justify-end mb-4">
                    <button
                      type="button"
                      className="bg-krm3-primary text-white px-4 py-2 rounded shadow hover:bg-yellow-400"
                      onClick={() => setOpenModal(true)}
                    >
                      + Add mission
                    </button>
                  </div>
                )}
                <FilterResource
                  handleFilter={handleFilter}
                  data={data}
                  isAdmin={user?.isStaff}
                />
                <Krm3Table
                  onClickRow={(item) =>
                    window.location.replace(`/trasferte/${item.id}`)
                  }
                  columns={[
                    { accessorKey: "id", header: "Id" },
                    { accessorKey: "fromDate", header: "From" },
                    { accessorKey: "toDate", header: "To" },
                    { accessorKey: "title", header: "Title" },
                    { accessorKey: "resource", header: "Resource" },
                  ]}
                  data={(!!dataFiltered ? dataFiltered : data.results).map(
                    (item) => ({
                      id: item.id,
                      fromDate: item.fromDate,
                      toDate: item.toDate,
                      title: item.title,
                      resource: `${item.resource.firstName} ${item.resource.lastName}`,
                    })
                  )}
                />
              </>
            )}
          </div>
        )}
        {!!exepenses && activeTab === "spese" && (
          <>
            <div className="bg-white p-4 shadow rounded mb-4">
              <p className="text-2xl font-semibold mb-4">
                Ultime Spese Aggiunte
              </p>
              <ExpenseFilter
                handleFilter={handleFilterExpense}
                data={exepenses.results}
              />
            </div>
            <Krm3Table
              onClickRow={(item) => {
                setSelectedExpense(item);
              }}
              columns={[
                { accessorKey: "id", header: "Id" },
                { accessorKey: "day", header: "Data" },
                { accessorKey: "mission", header: "id Missione" },
                { accessorKey: "mission_title", header: "Titolo Missione" },
                { accessorKey: "resource", header: "Risorsa" },
                { accessorKey: "amountCurrency", header: "Importo in EUR" },
              ]}
              data={(!!expenseFiltered
                ? expenseFiltered
                : exepenses.results
              ).map((item: ExpenseInterface) => ({
                ...item,
                mission_title:
                  data?.results.filter((m) => m.id === item.mission).at(0)
                    ?.title || "",
                resource:
                  data?.results.filter((m) => m.id === item.mission).at(0)
                    ?.resource.firstName || "",
              }))}
            />
          </>
        )}
        {openModal && (
          <CreateMission show={openModal} onClose={() => setOpenModal(false)} />
        )}
        {!!selectedExpense && (
          <ExpenseEdit
            expense={selectedExpense}
            onClose={() => setSelectedExpense(null)}
            show={!!selectedExpense}
          />
        )}
      </div>
    </>
  );
}
