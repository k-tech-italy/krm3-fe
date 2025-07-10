import { UserMenu } from "./UserMenu";
import { useMediaQuery } from "../../hooks/useView";
import { useGetCurrentUser } from "../../hooks/useAuth";
import React from "react";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  const isSmallScreen = useMediaQuery("(max-width: 768px)");
  const currentLocation = window.location.pathname;
  const { data } = useGetCurrentUser();

  const menuItem = [
    {
      label: "Trasferte",
      href: "/home",
      enabled: data?.flags.trasferteEnabled,
    },
    {
      label: "Timesheet",
      href: "/timesheet",
      enabled: data?.flags.timesheetEnabled,
    },
  ];

  return (
    <nav className="bg-app text-app shadow py-2 px-8 border-b-1 border-app">
      <div className="flex justify-between">
        <div className="flex flex-end space-x-4 items-baseline">
          <a className="text-xl font-bold " href="/">
            KRM³
          </a>
          {!isSmallScreen && (
            <div className="flex space-x-4">
              {menuItem.map((item, idx) => (
                <React.Fragment key={idx}>
                  {item.enabled && (
                    <a
                      key={idx}
                      href={item.href}
                      className={`text-base font-medium  hover:text-krm3-primary
                ${
                  currentLocation === item.href
                    ? "text-krm3-primary"
                    : "text-app"
                }`}
                    >
                      {item.label}
                    </a>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {window.location.pathname !== "/login" && <UserMenu />}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
