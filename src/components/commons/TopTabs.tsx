import { useEffect, useState } from "react";

interface Props {
    activeTab: string
    setActiveTab: (e: string) => void
}
export default function Tabs(props: Props){
    const [activeTab, setActiveTab] = useState(props.activeTab);

    function onClickTab(tabName: string){
        setActiveTab(tabName)
        props.setActiveTab(tabName)

    }
    return (
        <div className={`transition-colors duration-300 sticky top-0 bg-white`}>
        <ul className={` mx-auto  px-8 flex items-center justify-start pt-3 mb-5` }>
            <li>
            <button
                className={`py-2 px-4 ${activeTab === 'trasferte' ? 'border-b-2 border-krm3-primary font-medium' : 'text-gray-500'}`}
                onClick={() => onClickTab('trasferte')}
            >
                Trasferte
            </button>
            </li>
            <li>
            <button
                className={`py-2 px-4 ${activeTab === 'spese' ? 'border-b-2 border-krm3-primary font-medium' : 'text-gray-500'}`}
                onClick={() => onClickTab('spese')}
            >
                Ultime Spese
            </button>
            </li>
        </ul>
        </div>

    )
}
