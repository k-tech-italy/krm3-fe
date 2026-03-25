import { useMediaQuery } from "../../hooks/useView";
import React, { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { useLocation } from "react-router-dom";
import { FileText, Clock, CalendarRange, Plane } from "lucide-react";
import UserMenu from "./UserMenu.tsx";
import LanguageSwitcher from "./LanguageSwitcher.tsx";
import { useAuthContext } from "./AuthContext.tsx";

export function Navbar() {
  const isSmallScreen = useMediaQuery("(max-width: 768px)");
  const { user } = useAuthContext();
  const location = useLocation();
  const currentLocation = location.pathname.replace("/", "");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const mobileMenuIconMap: Record<string, JSX.Element> = {
    trasferte: <Plane size={24} data-testid={"trasferte-icon"} />,
    timesheet: <Clock size={24} data-testid={"timesheet-icon"} />,
    "be/": <CalendarRange size={24} data-testid={"report-icon"} />,
    default: <FileText size={24} data-testid={"default-icon"} />,
  };

  return (
    <nav className="bg-app text-app shadow py-2 px-8 border-b-1 border-app">
      <div className="flex justify-between">
        <div className="flex flex-end space-x-4 items-baseline">
          <a className="text-xl font-bold " href="/">
            KRM³
          </a>
          {!isSmallScreen && (
            <div className="flex space-x-4">
              {user?.config.modules.map((item, idx) => (
                <React.Fragment key={idx}>
                  <a
                    key={idx}
                    href={item.url}
                    className={`text-base font-medium  hover:text-krm3-primary
                ${currentLocation === item.url ? "text-krm3-primary" : "text-app"}`}
                  >
                    {item.label}
                  </a>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {isSmallScreen && (
            <button
              onClick={toggleMobileMenu}
              className="text-app hover:text-krm3-primary focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          )}
          {!isSmallScreen && location.pathname !== "/login" && <UserMenu />}
          {!isSmallScreen && <LanguageSwitcher />}
          {!isSmallScreen && <ThemeToggle />}
        </div>
      </div>

      {/* Mobile Menu */}
      {isSmallScreen && isMobileMenuOpen && (
        <div className="mt-4 pb-4 border-t border-app pt-4">
          <div className="flex flex-col space-y-3">
            {user?.config.modules.map((item, idx) => {
              const icon = mobileMenuIconMap[item.url] || mobileMenuIconMap.default;

              return (
                <a
                  key={idx}
                  href={item.url}
                  className={`text-base font-medium hover:text-krm3-primary px-2 py-1 rounded flex items-center space-x-3
                    ${
                      currentLocation === item.url
                        ? "text-krm3-primary bg-krm3-primary/10"
                        : "text-app"
                    }`}
                >
                  {icon}
                  <span>{item.label}</span>
                </a>
              );
            })}

            {/* Mobile Menu Actions */}
            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-app mt-4">
              {location.pathname !== "/login" && <UserMenu />}
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
