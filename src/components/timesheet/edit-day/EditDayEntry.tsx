import React, { useState } from 'react';
import { formatDate } from '../Krm3Calendar';

interface Props {
    selectedDays: Date[];
    skippedDays?: Date[];
    onClose: () => void;
}

export default function EditDayEntry({ selectedDays: days, skippedDays, onClose }: Props) {
    const [entryType, setEntryType] = useState<string | null>(null);
    const [leaveHours, setLeaveHours] = useState<number | null>(null);

    const handleEntryTypeChange = (type: string) => {
        setEntryType(type);
        if (type !== 'leave') {
            setLeaveHours(null); // Clear leave hours if not leave
        }
    };

    const handleLeaveHoursChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLeaveHours(Number(event.target.value));
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        console.log(event)
        if (entryType) {
            const entryData = days.map((day) => ({
                day,
                type: entryType,
                hours: entryType === 'leave' ? leaveHours : null,
            }));
            console.log('Submitted Entries:', entryData);
            // TODO - POST FOR ALL DAYS
        }
    };

    return (
        <div>
            {days && days.length > 0 && (
                <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Selected Days:</h3>
                    <div className="flex flex-wrap gap-2">
                        {days.map((day, index) => (
                            <span key={index} className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-1 rounded">
                                {formatDate(day)}
                            </span>
                        ))}
                    </div>
                </div>
            )}
            {skippedDays && skippedDays.length > 0 && (
                <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Skipped Days:</h3>
                    <div className="flex flex-wrap gap-2">
                        {skippedDays.map((day, index) => (
                            <span key={index} className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-1 rounded">
                                {formatDate(day)}
                            </span>
                        ))}
                    </div>
                </div>
            )}


            <form onSubmit={handleSubmit} className="pb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Entry Type</label>
                    <div className="grid grid-cols-3 gap-3">
                        <div
                            className={`flex items-center justify-center px-4 py-2 border rounded-md cursor-pointer transition-colors ${entryType === 'holiday'
                                    ? 'bg-yellow-100 border-yellow-500 text-yellow-700'
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                            onClick={() => handleEntryTypeChange('holiday')}
                        >
                            <input
                                type="radio"
                                name="entryType"
                                value="holiday"
                                checked={entryType === 'holiday'}
                                onChange={() => handleEntryTypeChange('holiday')}
                                className="sr-only"
                            />
                            <span className="text-sm font-medium">Holiday</span>
                        </div>

                        <div
                            className={`flex items-center justify-center px-4 py-2 border rounded-md cursor-pointer transition-colors ${entryType === 'sick'
                                    ? 'bg-yellow-100 border-yellow-500 text-yellow-700'
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                            onClick={() => handleEntryTypeChange('sick')}
                        >
                            <input
                                type="radio"
                                name="entryType"
                                value="sick"
                                checked={entryType === 'sick'}
                                onChange={() => handleEntryTypeChange('sick')}
                                className="sr-only"
                            />
                            <span className="text-sm font-medium">Sick Day</span>
                        </div>

                        <div
                            className={`flex items-center justify-center px-4 py-2 border rounded-md cursor-pointer transition-colors ${entryType === 'leave'
                                    ? 'bg-yellow-100 border-yellow-500 text-yellow-700'
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                            onClick={() => handleEntryTypeChange('leave')}
                        >
                            <input
                                type="radio"
                                name="entryType"
                                value="leave"
                                checked={entryType === 'leave'}
                                onChange={() => handleEntryTypeChange('leave')}
                                className="sr-only"
                            />
                            <span className="text-sm font-medium">Leave</span>
                        </div>
                    </div>
                </div>

                {entryType === 'leave' && (
                    <div className="transition-all duration-300 ease-in-out">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Leave Hours
                        </label>
                        <div className="relative mt-1 rounded-md shadow-sm">
                            <input
                                type="number"
                                value={leaveHours || ''}
                                onChange={handleLeaveHoursChange}
                                min="1"
                                max="24"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm p-2 border"
                                placeholder="Enter hours"
                            />
                        </div>
                    </div>
                )}

                <div className="pt-4 flex justify-around">
                    <button
                        type="button"
                        onClick={onClose}
                        className={`w-full flex justify-center py-2 px-4 mr-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                            }`}
                    >
                        cancel
                    </button>
                    <button
                        type="submit"
                        disabled={!entryType}
                        className={`w-full flex justify-center py-2 px-4 ml-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${entryType
                                ? 'bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500'
                                : 'bg-gray-300 cursor-not-allowed'
                            }`}
                    >
                        Submit
                    </button>
                </div>
            </form>
        </div>
    );
};

