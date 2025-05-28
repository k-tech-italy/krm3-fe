import { useMemo } from "react";
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    getSortedRowModel,
    getPaginationRowModel,
} from '@tanstack/react-table';
import { useMediaQuery } from "../../hooks/useView";

interface Props {
    columns: { accessorKey: string, header: string }[]
    data: any[] //TODO : define a proper type for API data
    onClickRow: (item: any) => void
}

export default function Krm3Table(props: Props) {
    const tableData = useMemo(() => props.data, [props.data]);
    const tableColumns = useMemo(() => props.columns, [props.columns]);
    const isSmallScreen = useMediaQuery('(max-width: 768px)');

    const table = useReactTable({
        data: tableData,
        columns: tableColumns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    if (props.data.length === 0) {
        return (
            <div className="p-4 shadow rounded bg-white">
                <p className="text-center text-gray-500">No Data</p>
            </div>
        );
    }

    if (isSmallScreen) {
        return (
            <div className="space-y-4">
                {table.getRowModel().rows.map(row => (
                    <div
                        key={row.id}
                        className="shadow rounded bg-white p-4 cursor-pointer"
                        onClick={() => props.onClickRow(row.original)}
                    >
                        {row.getVisibleCells().map(cell => {
                            const header = tableColumns.find(
                                col => col.accessorKey === cell.column.id
                            )?.header || cell.column.id;
                            return (
                                <div key={cell.id} className="mb-2">
                                    <strong className="text-gray-700">{header}: </strong>
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="p-4 shadow rounded bg-white">
            <table className="w-full border-collapse">
                <thead className="bg-gray-100">
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th
                                    key={header.id}
                                    className="px-4 py-2 text-left text-sm font-medium text-gray-600 uppercase cursor-pointer"
                                    onClick={header.column.getToggleSortingHandler()}
                                >
                                    <div className="flex items-center">
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                        {header.column.getIsSorted() ? (
                                            header.column.getIsSorted() === 'asc' ? (
                                                <span className="ml-1">↑</span>
                                            ) : (
                                                <span className="ml-1">↓</span>
                                            )
                                        ) : null}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {table.getRowModel().rows.map(row => (
                        <tr
                            key={row.id}
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => props.onClickRow(row.original)}
                        >
                            {row.getVisibleCells().map(cell => (
                                <td key={cell.id} className="px-4 py-2 text-sm text-gray-700">
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                    <button
                        className="px-3 py-1 border rounded bg-gray-50 text-gray-600 disabled:opacity-50"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        {'<<'}
                    </button>
                    <button
                        className="px-3 py-1 border rounded bg-gray-50 text-gray-600 disabled:opacity-50"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        {'<'}
                    </button>
                    <button
                        className="px-3 py-1 border rounded bg-gray-50 text-gray-600 disabled:opacity-50"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        {'>'}
                    </button>
                    <button
                        className="px-3 py-1 border rounded bg-gray-50 text-gray-600 disabled:opacity-50"
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                    >
                        {'>>'}
                    </button>
                </div>
                <div className="text-sm text-gray-600">
                    Page{' '}
                    <strong>
                        {table.getState().pagination.pageIndex + 1} of{' '}
                        {table.getPageCount()}
                    </strong>
                </div>
            </div>
        </div>
    );
}
