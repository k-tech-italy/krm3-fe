import { useState } from "react";
import { useParams } from "react-router-dom";
import moment from "moment";
import { ExpenseInterface } from "../../restapi/types";
import { useMediaQuery } from "../../hooks/useView";
import { ExpenseEdit } from "../expense/edit/ExpenseEdit";
import { TotalsExpense } from "../expense/TotalExpense";
import LoadSpinner from "../commons/LoadSpinner";
import { useGetMission, useSubmitMission } from "../../hooks/useMissions";
import { useGetCurrentUser } from "../../hooks/useAuth";
import { parseApiErrors } from "../../utils/apiErrors";
import MissionSummary from "./Summary";
import BreadcrumbMission from "../commons/Breadcrumb";
import Krm3Table from "../commons/Krm3Table";

export function Mission() {
  const isSmallScreen = useMediaQuery("(max-width: 767.98px)");
  const [selectedExpense, setSelectedExpense] = useState<ExpenseInterface | null>();
  const id = Number(useParams().id);
  const { isLoading, data, isError } = useGetMission(id);
  const { data: currentUser, userCan } = useGetCurrentUser();
  const submitMission = useSubmitMission();
  const [submitErrors, setSubmitErrors] = useState<string[]>([]);
  const today = new Date();

  // same rule as the backend: the mission owner or a mission manager
  const canSubmit =
    !!data &&
    ((!!currentUser?.resource && currentUser.resource.id === data.resource.id) ||
      userCan(["core.manage_any_mission"]));

  function handleSubmit() {
    setSubmitErrors([]);
    submitMission.mutate(id, {
      onError: (err) => setSubmitErrors(parseApiErrors(err).general),
    });
  }

  const defaultExpense = {
    mission: id,
    amountCurrency: "0",
    day: moment(today).format("YYYY-MM-DD"),
  } as ExpenseInterface;

  return (
    <div className="container mx-auto px-4">
      {isLoading && <LoadSpinner />}
      {isError && (
        <div>
          <p>errore</p>
        </div>
      )}
      {!!data && (
        <div>
          <BreadcrumbMission
            page={[
              { title: "Home", url: "/trasferte" },
              { title: "Mission", url: "" },
            ]}
          />
          <MissionSummary
            data={data}
            canSubmit={canSubmit}
            isSubmitting={submitMission.isLoading}
            submitErrors={submitErrors}
            onSubmit={handleSubmit}
          />

          {!isSmallScreen && (
            <div className="d-grid gap-2 d-md-block mb-2 text-end">
              <button
                type="button"
                className="bg-krm3-primary text-white px-4 py-2 rounded shadow hover:bg-yellow-400"
                data-testid="add-expense-button"
                onClick={() => setSelectedExpense(defaultExpense)}
              >
                + Add Expense
              </button>
            </div>
          )}
          <Krm3Table
            columns={[
              { accessorKey: "id", header: "Id" },
              { accessorKey: "day", header: "Data" },
              { accessorKey: "category_title", header: "Categoria" },
              { accessorKey: "amountCurrency", header: "Importo in valuta" },
              { accessorKey: "amountBase", header: "Importo in EUR" },
              { accessorKey: "amountReimbursement", header: "Importo rimborso" },
              { accessorKey: "paymentType_title", header: "Tipo di pagamento" },
              { accessorKey: "documentType_title", header: "Tipo di documento" },
            ]}
            data={
              data
                ? data.expenses.slice(0).map((item) => {
                    return {
                      ...item,
                      category_title: item.category.title,
                      paymentType_title: item.paymentType.title,
                      documentType_title: item.documentType.title,
                    };
                  })
                : []
            }
            onClickRow={(item) => setSelectedExpense(item)}
          />
          {!isSmallScreen && <TotalsExpense mission={data} />}
          {selectedExpense && (
            <ExpenseEdit
              show={true}
              onClose={() => setSelectedExpense(null)}
              expense={selectedExpense}
            />
          )}
        </div>
      )}
    </div>
  );
}
