import { useState, useRef } from "react";

interface DropdownItem {
  label: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  testId?: string;
  href?: string;
  active?: boolean;
}

interface DropdownSection {
  items: DropdownItem[];
  isFooter?: boolean;
  isClickable?: boolean;
}

interface DropdownProps {
  icon?: React.ReactNode;
  label?: React.ReactNode;
  sections: DropdownSection[];
  className?: string;
  testId?: string;
}

export default function DropDown({ icon, label, sections, className = "", testId }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        data-testid="toggle-menu-button"
        className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {icon && <span className="flex items-center">{icon}</span>}
        {label && <strong className="text-app cursor-pointer">{label}</strong>}
      </button>

      <div
        onMouseLeave={() => setIsOpen(false)}
        data-testid={testId || "dropdown-menu"}
        className={`absolute right-0 mt-2 w-56 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow focus:outline-none z-10 transition-all duration-200 ease-out transform ${
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        {sections.map((section, sectionIndex) => (
          <div
            key={sectionIndex}
            className={
              section.isClickable
                ? "py-2 px-4 text-xs text-gray-500 border-t border-gray-100"
                : "py-1"
            }
          >
            {section.items.map((item, itemIndex) =>
              item.href ? (
                <a
                  key={itemIndex}
                  href={item.href}
                  data-testid={item.testId}
                  className={`block w-full text-left ${
                    section.isClickable ? "" : "px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.label}
                </a>
              ) : (
                <button
                  key={itemIndex}
                  data-testid={item.testId}
                  onClick={() => {
                    if (!item.disabled) {
                      item.onClick?.();
                      setIsOpen(false);
                    }
                  }}
                  className={`block w-full text-left ${
                    section.isFooter
                      ? "className=py-2 px-4 text-xs text-gray-500"
                      : `px-4 py-2 text-sm ${
                          item.active
                            ? "bg-gray-100 text-gray-400 font-semibold cursor-default"
                            : "text-gray-700 hover:bg-gray-100"
                        }`
                  }`}
                  disabled={item.disabled}
                >
                  {item.label}
                </button>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
