import { useState } from "react";
import { useGetCurrentUser, useLogout } from "../../hooks/commons";

export function UserMenu() {
  const { data: user } = useGetCurrentUser();
  const [isOpen, setIsOpen] = useState(false);
  const { mutate: logoutUser } = useLogout();

  function handleLogout() {
    logoutUser();
  }

  function toggleMenu() {
    setIsOpen((prev) => !prev);
  }

  const beUrl = document.location.protocol + '//' + document.location.host;

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={toggleMenu}
        className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
      >
        <img
          src="https://avatars.githubusercontent.com/u/6311869?s=40&v=4"
          alt=""
          width="32"
          height="32"
          className="rounded-full mr-2"
        />
        <strong className="hidden sm:block">{user?.email}</strong>
      </button>

      <div
        onMouseLeave={() => setIsOpen(false)}
        className={`absolute right-0 mt-2 w-56 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow focus:outline-none z-10 transition-all duration-200 ease-out transform ${
          isOpen
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="py-1">
          <a
            href="#"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Settings
          </a>
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
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
