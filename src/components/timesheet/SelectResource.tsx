import { useEffect } from "react";
import Select, { SingleValue } from "react-select";
import { useGetCurrentUser } from "../../hooks/useAuth";
import { useGetActiveResources } from "../../hooks/useMissions";
import { krm3SelectStyles } from "../commons/selectStyles";

const SelectResourceComponent = ({
  setSelectedResourceId,
  period,
}: {
  setSelectedResourceId: (id: number | null) => void;
  // the month shown in the timesheet: only resources with a contract in it are listed
  period?: { from: string; to: string };
}) => {
  const resources = useGetActiveResources(period);
  const { data, userCan } = useGetCurrentUser();
  const canViewOtherTimesheets =
    userCan(["core.view_any_timesheet"]) || userCan(["core.manage_any_timesheet"]);

  const getSelectOptions = () => {
    if (!resources) return [];
    return resources.map((resource) => ({
      value: resource.id,
      label: `${resource.lastName} ${resource.firstName}`,
    }));
  };

  useEffect(() => {
    // If no resource is selected, set the current user's resource as default
    // TODO Handle the case in which the current user does not have a resource
    if (data?.resource?.id) {
      setSelectedResourceId(data.resource.id);
    }
  }, [data]);

  if (!canViewOtherTimesheets) return null;

  const handleResourceChange = (selectedOption: SingleValue<{ value: number; label: string }>) => {
    setSelectedResourceId(selectedOption ? selectedOption.value : null);
  };

  return (
    <>
      {resources && resources.length > 0 ? (
        <div className="flex justify-start">
          <div className="mb-4">
            <p>Select Resource:</p>
            <br />
            <Select
              onChange={handleResourceChange}
              options={getSelectOptions()}
              formatOptionLabel={({ label }) => (
                <span className="notranslate" translate="no">
                  {label}
                </span>
              )}
              className="mt-2"
              styles={krm3SelectStyles<{ value: number; label: string }>()}
              isClearable
              placeholder="Select a resource"
              id="resource-select"
              isSearchable
              defaultValue={
                data?.resource
                  ? {
                      value: data.resource.id,
                      label: `${data.resource.lastName} ${data.resource.firstName}`,
                    }
                  : null
              }
            />
          </div>
        </div>
      ) : null}
    </>
  );
};

export default SelectResourceComponent;
