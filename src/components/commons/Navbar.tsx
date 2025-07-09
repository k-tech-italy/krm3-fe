import { UserMenu } from "./UserMenu";
import { useMediaQuery } from "../../hooks/useView";

export function Navbar() {
  const isSmallScreen = useMediaQuery("(max-width: 768px)");
  const currentLocation = window.location.pathname;

  return (
    <nav className="bg-white text-gray-800 shadow py-2 px-8 border-b-1 border-gray-200">
      <div className="flex justify-between">
        <div className="flex flex-end space-x-4 items-baseline">
          <a className="text-xl font-bold " href="/">
            KRM³
          </a>
          {!isSmallScreen && (
            <div className="flex space-x-4">
              <a
                href="/trasferte"
                className={`text-base font-medium  hover:text-krm3-primary
                ${
                  currentLocation === "/trasferte" || currentLocation === "/"
                    ? "text-krm3-primary"
                    : "text-gray-700"
                }`}
              >
                Trasferte
              </a>
              <a
                href="/timesheet"
                className={`text-base font-medium  hover:text-krm3-primary
                ${
                  currentLocation === "/timesheet"
                    ? "text-krm3-primary"
                    : "text-gray-700"
                }`}
              >
                Timesheet
              </a>
            </div>
          )}
        </div>
        {window.location.pathname !== "/login" && <UserMenu />}
      </div>
    </nav>
  );
}
