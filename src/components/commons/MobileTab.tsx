import { useState } from "react";
import { CreateMission } from "../missions/create/CreateMission";
import { ExpenseEdit } from "../expense/edit/ExpenseEdit";
import { Home, FileText, Clock, Plus, Settings } from "lucide-react";
import { ExpenseInterface } from "../../restapi/types";

const BottomTabNavigation = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [openModal, setOpenModal] = useState(false);
  const [openExpenseModal, setOpenExpenseModal] = useState(false);
  const currentLocation = window.location.pathname;

  const handleTabClick = (tabName: string, link: string) => {
    setActiveTab(tabName);
    window.location.replace(link);
  };

  return (
    <div className="relative">
      <nav className="fixed bottom-0 w-full  flex justify-around shadow-lg z-50">
        <div className="flex items-center  bg-white justify-center w-full py-3 space-x-4 mt-5">
          <button
            className={`flex flex-col items-center w-full transition-colors ${
              currentLocation === "/trasferte" || currentLocation === "/"
                ? "text-krm3-primay"
                : "text-gray-500 hover:text-krm3-primay"
            }`}
            onClick={() => handleTabClick("home", "/")}
          >
            <Home size={24} />
            <span className="text-xs font-medium">Home</span>
          </button>
          <button
            className={`flex flex-col items-center w-full transition-colors ${
              activeTab === "rimborsi"
                ? "text-krm3-primay"
                : "text-gray-500 hover:text-krm3-primay"
            }`}
            onClick={() => handleTabClick("rimborsi", "/")}
          >
            <FileText size={24} />
            <span className="text-xs font-medium">Rimborsi</span>
          </button>
          {window.location.pathname !== "/timesheet" && (
            <div className="relative w-full flex justify-center">
              <div className="h-6"></div>
              <button
                className="absolute -top-6 w-14 h-14 bg-krm3-primay text-white rounded-full shadow-lg flex items-center justify-center hover:bg-yellow-700 transition-transform transform hover:scale-105"
                onClick={() => {
                  if (window.location.pathname === "/") {
                    setOpenModal(true);
                  } else {
                    setOpenExpenseModal(true);
                  }
                }}
              >
                <Plus size={28} />
              </button>
            </div>
          )}

          <button
            className={`flex flex-col items-center w-full transition-colors ${
              currentLocation === "/timesheet"
                ? "text-krm3-primay"
                : "text-gray-500 hover:text-krm3-primay"
            }`}
            onClick={() => handleTabClick("timesheet", "/timesheet")}
          >
            <Clock size={24} />
            <span className="text-xs font-medium">Foglio ore</span>
          </button>

          <button
            className={`flex flex-col items-center w-full transition-colors ${
              activeTab === "settings"
                ? "text-krm3-primay"
                : "text-gray-500 hover:text-krm3-primay"
            }`}
            onClick={() => handleTabClick("settings", "/")}
          >
            <Settings size={24} />
            <span className="text-xs font-medium">Settings</span>
          </button>
        </div>
      </nav>
      {openModal && (
        <CreateMission show={openModal} onClose={() => setOpenModal(false)} />
      )}
      {openExpenseModal && (
        <ExpenseEdit
          expense={{} as ExpenseInterface}
          onClose={() => setOpenExpenseModal(false)}
          show={openExpenseModal}
        />
      )}
    </div>
  );
};

export default BottomTabNavigation;
