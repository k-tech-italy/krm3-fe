import { TriangleAlert } from "lucide-react";
import { Tooltip } from "react-tooltip";

interface Props {
  daysWithTimeEntries: string[];
  isCheckbox: boolean;
  overrideEntries?: boolean;
  setOverrideEntries?: React.Dispatch<React.SetStateAction<boolean>>;
  style?: string;
  message?: string;
  disabled?: boolean;
  disabledTooltipMessage?: string;
}

const WarningExistingEntry = ({
  daysWithTimeEntries,
  overrideEntries,
  setOverrideEntries,
  isCheckbox,
  style,
  message,
  disabled,
  disabledTooltipMessage,
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
              <p
                className="text-sm text-amber-800"
                id="warning-optional-message"
              >
                {message ? message : ""}
              </p>
              {isCheckbox && setOverrideEntries && (
                <div className="mt-3 flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked={overrideEntries}
                    id="save-for-update-checkbox"
                    data-tooltip-id="save-for-update-checkbox-tooltip"
                    className="h-4 w-4 text-app focus:ring-blue-500 border-app rounded"
                    onChange={() => {
                      setOverrideEntries(!overrideEntries);
                    }}
                    disabled={disabled}
                  />
                  <label className="ml-2 text-sm text-amber-800">
                    Overwrite existing time entries
                  </label>
                  {disabled && (
                    <Tooltip
                      id="save-for-update-checkbox-tooltip"
                      content={disabledTooltipMessage}
                    />
                  )}
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
