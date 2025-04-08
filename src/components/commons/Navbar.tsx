import { UserMenu } from "./UserMenu";
import { useMediaQuery } from '../../hooks/commons';
import { AlignJustify} from 'lucide-react';
import { Sidebar } from "./Sidebar";
import { SetStateAction, useState } from "react";


export function Navbar() {
    const isSmallScreen = useMediaQuery('(max-width: 768px)');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <nav className="bg-white text-gray-800 shadow py-2">
            <div className="container mx-auto px-4 flex items-center justify-between">
            {isSmallScreen ? (
                <a className="text-lg font-bold" href="/">KRM³</a>
            ) : (
                <div className="flex items-center">
                <button className="p-2 rounded-md bg-yellow-500 text-white hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400" type="button"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                    <AlignJustify className="w-5 h-5" />
                </button>
                <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}  />
                </div>

            )}

            {window.location.pathname !== '/login' && (
                <UserMenu />
            )}
            </div>
        </nav>
    );
}
