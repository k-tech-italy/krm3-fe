import { Home } from 'lucide-react';

interface Props {
  page: { title: string, url: string }[]
}

function BreadcrumbMission(props: Props) {


  return (
    <nav className="my-3 flex items-baseline" aria-label="breadcrumb">
      <ol className="flex space-x-2">
        {props.page.map((p, i) => (
          <li key={i} className={`flex items-center ${props.page.length - 1 === i ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
            {p.title === 'Home' ? (
              <Home size={20} className="mr-1" />
            ) : (
              <a href={p.url} className={`${props.page.length - 1 === i ? 'pointer-events-none' : 'hover:underline'}`}>
                {p.title}
              </a>
            )}
            {i < props.page.length - 1 && <span className="mx-2 text-gray-400">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default BreadcrumbMission;