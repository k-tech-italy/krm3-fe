
interface TabDef {
  label: string;
  value: string;
}

interface Props {
  tabs: TabDef[];
  activeTab: string;
  setActiveTab: (e: string) => void;
}

export default function Tabs(props: Props) {
  return (
    <div className={`transition-colors duration-300 sticky top-0 bg-white`}>
      <ul className={`mx-auto px-8 flex items-center justify-start pt-3 mb-5`}>
        {props.tabs.map((tab) => (
          <li key={tab.value}>
            <button
              className={`py-2 px-4 ${
                props.activeTab === tab.value
                  ? "border-b-2 border-krm3-primary font-medium"
                  : "text-gray-500"
              }`}
              onClick={() => props.setActiveTab(tab.value)}
              type="button"
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
