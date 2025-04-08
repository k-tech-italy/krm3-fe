import React from 'react';

import "../../index.css"
import { X } from 'lucide-react';

interface Props {
	isSidebarOpen: boolean;
	setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
export function Sidebar({ isSidebarOpen, setIsSidebarOpen }: Props) {
	// Function to handle outside click
	const handleOverlayClick = () => {
		setIsSidebarOpen(false);
	};

	return (
		<>
			{/* Overlay */}
			{isSidebarOpen && (
				<div
					className="fixed inset-0 bg-gray-700 opacity-50 z-40"
					onClick={handleOverlayClick}
				></div>
			)}

			{/* Sidebar */}
			<div
				className={`fixed top-0 left-0 h-full bg-gray-800 text-white transform ${
					isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
				} transition-transform duration-300 w-72 z-50`}
			>
				<div className="sticky top-0 p-4">
					<button
						onClick={() => setIsSidebarOpen(!isSidebarOpen)}
						className="absolute top-1 right-1 text-white-600 w-8 h-8 rounded-full flex items-center justify-center active:bg-gray-300 focus:outline-none ml-6 hover:bg-gray-200 hover:text-gray-800"
					>
						<X />
					</button>

					<a
						href="/"
						className="flex items-center mb-4 text-white text-xl font-bold"
					>
						KRM³
					</a>
					<hr className="border-gray-700 mb-4" />
					<ul className="space-y-2">
						<li>
							<a
								href="/"
								className="flex items-center p-2 rounded hover:bg-gray-700"
							>
								<i className="icon kt-icon-mission mr-2" /> Trasferte
							</a>
						</li>
						<li>
							<a
								href="#"
								className="flex items-center p-2 rounded hover:bg-gray-700"
							>
								<i className="icon kt-icon-refund mr-2" /> Rimborsi
							</a>
						</li>
						<li>
							<a
								href="https://krm.k-tech.it/"
								className="flex items-center p-2 rounded hover:bg-gray-700"
							>
								<i className="icon kt-icon-timesheet mr-2" /> Foglio ore
							</a>
						</li>
					</ul>
					<hr className="border-gray-700 mt-4" />
					<p className="text-right text-sm mt-4">
						v
					</p>
				</div>
			</div>
		</>
	);
}
