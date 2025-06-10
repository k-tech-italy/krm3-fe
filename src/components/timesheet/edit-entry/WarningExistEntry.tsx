import { TriangleAlert } from "lucide-react";

interface Props {
  daysWithTimeEntries: string[];
  isCheckbox: boolean;
  keepEntries?: boolean;
  setKeepEntries?: React.Dispatch<React.SetStateAction<boolean>>;
  style?: string;
}

const WarningExistingEntry = ({
  daysWithTimeEntries,
  keepEntries,
  setKeepEntries,
  isCheckbox,
  style,
}: Props) => {
  return (
    <div className={style || ""}>
      {daysWithTimeEntries.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <TriangleAlert
                color="#f59e0b"
                className="h-5 w-5 text-amber-400"
                size={20}
              />
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-800" id="warning-message">
                <strong>Warning:</strong> Time entries already exist for days:{" "}
                <span className="font-medium">
                  {daysWithTimeEntries
                    .map((day) => day.split("-")[2])
                    .join(", ")}
                </span>
              </p>
              {isCheckbox && setKeepEntries && (
                <div className="mt-3 flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked={keepEntries}
                    id="save-for-update-checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    onChange={() => {
                      setKeepEntries(!keepEntries);
                    }}
                  />
                  <label className="ml-2 text-sm text-amber-800">
                    Overwrite existing time entries
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarningExistingEntry;
