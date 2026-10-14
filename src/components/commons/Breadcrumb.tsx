import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

interface Props {
  page: { title: string; url: string; icon?: ReactNode }[];
}

function BreadcrumbMission(props: Props) {
  return (
    <nav className="my-3 flex items-baseline" aria-label="breadcrumb">
      <ol className="flex space-x-2">
        {props.page.map((p, i) => (
          <li
            key={`${p.url}-${p.title}`}
            className={`flex items-center ${props.page.length - 1 === i ? "font-semibold text-gray-900" : "text-gray-500"}`}
            data-testid={`breadcrumb-item-${i}`}
          >
            {props.page.length - 1 === i ? (
              <span className="flex items-center" aria-current="page">
                {p.icon && <span className="mr-1">{p.icon}</span>}
                {p.title}
              </span>
            ) : (
              <NavLink to={p.url} className="flex items-center hover:underline">
                {p.icon && <span className="mr-1">{p.icon}</span>}
                {p.title}
              </NavLink>
            )}
            {i < props.page.length - 1 && <span className="mx-2 text-gray-400">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default BreadcrumbMission;
