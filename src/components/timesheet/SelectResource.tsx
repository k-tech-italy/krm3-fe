import { useEffect } from "react";
import Select, { SingleValue } from "react-select";
import { useGetCurrentUser } from "../../hooks/useAuth";
import { useGetActiveResources } from "../../hooks/useMissions";

const SelectResourceComponent = ({
  setSelectedResourceId,
}: {
  setSelectedResourceId: (id: number | null) => void;
}) => {
  const resources = useGetActiveResources();
  const { data } = useGetCurrentUser();

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

  const handleResourceChange = (
    selectedOption: SingleValue<{ value: number; label: string }>
  ) => {
    setSelectedResourceId(selectedOption ? selectedOption.value : null);
  };

  return (
    <>
      {resources && resources.length > 0 ? (
        <div className="flex justify-start">
          <div className="mb-4">
            <label htmlFor="resource-select" >Select Resource:</label>
            <br />
            <Select
              onChange={handleResourceChange}
              options={getSelectOptions()}
              className="mt-2"
              styles={{
                menu: (base) => ({
                  ...base,
                  backgroundColor: 'var(--color-selector-menu)',
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isSelected ? 'var(--color-selector-selected)'
                      : state.isFocused ? 'var(--color-selector-focused)'
                          : '',
                }),
                control: (base) =>({
                  ...base,
                  color: 'var(--color-body-text)',
                  backgroundColor: 'var(--color-selector-controller)',
                }),
                singleValue: (base) => ({
                  ...base,
                  color: 'var(--color-body-text)',
                }),
                placeholder: (base) => ({
                  ...base,
                  color: 'var(--color-body-text)',
                }),
              }}
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
