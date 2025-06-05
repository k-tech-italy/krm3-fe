import { useEffect } from "react";
import Select, { SingleValue } from 'react-select';
import { useGetCurrentUser } from "../../hooks/useAuth";
import { useGetActiveResources } from "../../hooks/useMissions";


const SelectResourceComponent = ({ setSelectedResourceId }: { setSelectedResourceId: (id: number | null) => void }) => {

    const resources = useGetActiveResources();
    const { data } = useGetCurrentUser();

    const getSelectOptions = () => {
        if (!resources) return [];
        return resources.map(resource => ({
            value: resource.id,
            label: `${resource.firstName} ${resource.lastName}`
        }));
    };

    useEffect(() => {
        // If no resource is selected, set the current user's resource as default
        // TODO Handle the case in which the current user does not have a resource
        if (data?.resource?.id) {
            setSelectedResourceId(data.resource.id);
        }
    }, [data]);


    const handleResourceChange = (selectedOption: SingleValue<{ value: number; label: string }>) => {
        setSelectedResourceId(selectedOption ? selectedOption.value : null);
    };

    return (
        <>
            {resources && resources.length > 0 ? (
                <>
                <div className="mb-4">
                    <label htmlFor="resource-select">Select Resource:</label><br />
                    <Select
                        onChange={handleResourceChange}
                        options={getSelectOptions()}
                        isClearable
                        placeholder="Select a resource"
                        id="resource-select"
                        isSearchable
                        defaultValue={data?.resource ? { value: data.resource.id, label: `${data.resource.firstName} ${data.resource.lastName}` } : null}
                    />
                </div>
                </>
            ) : null}
        </>
    );
}

export default SelectResourceComponent;