import React from "react";
import { useMediaQuery } from "../../hooks/commons";

interface Props {
  isMonth: boolean;
  setIsMonth: React.Dispatch<React.SetStateAction<boolean>>;
  isColumnView: boolean;
  setColumnView: (value: boolean) => void;
}
function VisualizationActions({
  isMonth,
  setIsMonth,
  isColumnView,
  setColumnView,
}: Props) {
  const isSmallScreen = useMediaQuery("(max-width: 768px)");

  return (
    <div className="flex justify-between items-center my-4">
      <div className="">
        <div className="inline-flex items-end gap-2">
          <label
            htmlFor="switch-month-on"
            className="text-slate-600 text-sm cursor-pointer"
          >
            Week
          </label>
          <div className="relative inline-block w-11 h-5">
            <input
              id="switch-month-on"
              type="checkbox"
              className="peer appearance-none w-11 h-5 bg-slate-100 rounded-full checked:bg-slate-800 cursor-pointer transition-colors duration-300"
              checked={isMonth}
              onChange={() => {
                setIsMonth(!isMonth);
              }}
            />
            <label
              htmlFor="switch-month-on"
              className="absolute top-0 left-0 w-5 h-5 bg-white rounded-full border border-slate-300 shadow-sm transition-transform duration-300 peer-checked:translate-x-6 peer-checked:border-slate-800 cursor-pointer"
            ></label>
          </div>
          <label
            htmlFor="switch-month-on"
            className="text-slate-600 text-sm cursor-pointer"
          >
            Month
          </label>
        </div>
      </div>
      {!isSmallScreen && (
          <div className="inline-flex items-center gap-2">
            <label
              htmlFor="switch-component-on"
              className="text-slate-600 text-sm cursor-pointer"
            >
              Row
            </label>
            <div className="relative inline-block w-11 h-5">
              <input
                id="switch-component-on"
                type="checkbox"
                className="peer appearance-none w-11 h-5 bg-slate-100 rounded-full checked:bg-slate-800 cursor-pointer transition-colors duration-300"
                checked={isColumnView}
                onChange={() => setColumnView(!isColumnView)}
              />
              <label
                htmlFor="switch-component-on"
                className="absolute top-0 left-0 w-5 h-5 bg-white rounded-full border border-slate-300 shadow-sm transition-transform duration-300 peer-checked:translate-x-6 peer-checked:border-slate-800 cursor-pointer"
              ></label>
            </div>
            <label
              htmlFor="switch-component-on"
              className="text-slate-600 text-sm cursor-pointer"
            >
              Column
            </label>
          </div>
      )}
    </div>
  );
}

export default VisualizationActions;
