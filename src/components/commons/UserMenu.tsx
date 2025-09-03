import { useState, useEffect, useRef } from "react";
import { useGetCurrentUser } from "../../hooks/useAuth";
import { useLogout } from "../../hooks/useAuth";
import { CircleUserRound } from "lucide-react";
import { isValidUrl } from "../timesheet/utils/utils.ts";

export function UserMenu() {
  const { data: user } = useGetCurrentUser();
  const [isOpen, setIsOpen] = useState(false);
  const { mutate: logoutUser } = useLogout();
  const [release, setRelease] = useState<any>(null);
  const fetched = useRef(false);

  useEffect(() => {
    if (!fetched.current) {
      fetch("/static/release.json")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => setRelease(data))
        .catch(() => setRelease(null));
      fetched.current = true;
    }
  }, []);

  function handleLogout() {
    logoutUser();
  }

  function toggleMenu() {
    setIsOpen((prev) => !prev);
  }

  const beUrl = document.location.protocol + "//" + document.location.host;

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={toggleMenu}
        data-testid="toggle-menu-button"
        className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
      >
        {user?.profile.picture && isValidUrl(user?.profile.picture) ? (
          <img
            data-testid={"user-profile-picture"}
            src={user?.profile.picture}
            alt="user profile picture"
            width="32"
            height="32"
            className="rounded-full mr-2"
          />
        ) : (
          <CircleUserRound
            data-testid={"user-default-picture"}
            color="#5e5e5e"
            strokeWidth={1.5}
            size={30}
            className="mr-2"
          />
        )}

        <strong className="hidden sm:block text-app cursor-pointer">{user?.email}</strong>
      </button>

      <div
        onMouseLeave={() => setIsOpen(false)}
        data-testid={"user-menu"}
        className={`absolute right-0 mt-2 w-56 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow focus:outline-none z-10 transition-all duration-200 ease-out transform ${
          isOpen
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="py-1">
          <a
            href={`user/`}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Profile
          </a>
          {user?.isStaff && (
            <a
              href={`${beUrl}/admin/`}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Django Admin
            </a>
          )}
        </div>
        <div className="py-1">
          <button
            data-testid={"logout-button"}
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Sign out
          </button>
        </div>
        <div className="py-2 px-4 text-xs text-gray-500 border-t border-gray-100">
          {release ? (
            <>
              <div data-testid={"be-version"}>
                <b>BE</b>: v{release.be.version}
              </div>
              <div data-testid={"fe-version"}>
                <b>FE</b>: v{release.fe.version}
              </div>
            </>
          ) : (
            <span>Version info unavailable</span>
          )}
        </div>
      </div>
    </div>
  );
}
