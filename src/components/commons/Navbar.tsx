import { UserMenu } from "./UserMenu";
import { useMediaQuery } from "../../hooks/useView";
import { useGetCurrentUser } from "../../hooks/useAuth";
import React from "react";
import { useLocation } from "react-router-dom";

export function Navbar() {
  const isSmallScreen = useMediaQuery("(max-width: 768px)");
  const { data } = useGetCurrentUser();
  const location = useLocation();
  const currentLocation = location.pathname.replace('/', '');

  return (
    <nav className="bg-white text-gray-800 shadow py-2 px-8 border-b-1 border-gray-200">
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
                    : "text-gray-700"
                }`}
                  >
                    {item}
                  </a>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
        {location.pathname !== "/login" && <UserMenu />}
      </div>
    </nav>
  );
}
