import { UserMenu } from "./UserMenu";
import { useMediaQuery } from "../../hooks/useView";
import { useGetCurrentUser } from "../../hooks/useAuth";
import React from "react";
import { ThemeToggle } from "./ThemeToggle";
import { useLocation } from "react-router-dom";

export function Navbar() {
  const isSmallScreen = useMediaQuery("(max-width: 768px)");
  const { data } = useGetCurrentUser();
  const location = useLocation();
  const currentLocation = location.pathname.replace('/', '');

  return (
    <nav className="bg-app text-app shadow py-2 px-8 border-b-1 border-app">
      <div className="flex justify-between">
        <div className="flex flex-end space-x-4 items-baseline">
          <a className="text-xl font-bold " href="/">
            KRM³
          </a>
          {!isSmallScreen && (
              <div className="flex space-x-4">
                {data?.config.modules.map((item, idx) => (
                    <React.Fragment key={idx}>
                      <a
                          key={idx}
                          href={item}
                          className={`text-base font-medium  hover:text-krm3-primary
                ${
                              currentLocation === item
                                  ? "text-krm3-primary"
                                  : "text-app"
                          }`}
                      >
                        {item}
                      </a>
                    </React.Fragment>
                ))}
              </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {location.pathname !== "/login" && <UserMenu/>}
          <ThemeToggle/>
        </div>
      </div>
    </nav>
  );
}
