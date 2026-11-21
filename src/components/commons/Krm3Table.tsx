import { MouseEvent, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { useMediaQuery } from "../../hooks/useView";

interface Column {
  accessorKey: string;
  header: string;
  /** Server-side sorting only: false makes the header not clickable. The accessorKey is the API ordering name. */
  sortable?: boolean;
}

interface Props<T extends object> {
  columns: Column[];
  data: T[];
  onClickRow: (item: T) => void;
  /**
   * Server-side sorting: the current API ordering ("fromDate", "-fromDate" or null) and its setter.
   * Without them the table sorts the rows it has.
   */
  ordering?: string | null;
  onOrderingChange?: (ordering: string | null) => void;
  /** Server-side pagination (1-based page). Without it the table paginates the rows it has. */
  pagination?: { page: number; pageCount: number; onPageChange: (page: number) => void };
}

/** Next API ordering when a header is clicked: ascending, descending, then the server default. */
export function nextOrdering(current: string | null | undefined, column: string): string | null {
  if (current === column) return `-${column}`;
  if (current === `-${column}`) return null;
  return column;
}

export default function Krm3Table<T extends object>(props: Props<T>) {
  const tableData = useMemo(() => props.data, [props.data]);
  const tableColumns = useMemo(() => props.columns, [props.columns]);
  const isSmallScreen = useMediaQuery("(max-width: 768px)");
  const serverSorting = props.onOrderingChange !== undefined;
  const serverPagination = props.pagination !== undefined;
  const sorting = useMemo(() => {
    if (!serverSorting || !props.ordering) return [];
    const desc = props.ordering.startsWith("-");
    return [{ id: desc ? props.ordering.slice(1) : props.ordering, desc }];
  }, [serverSorting, props.ordering]);

  const table = useReactTable({
    data: tableData,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualSorting: serverSorting,
    manualPagination: serverPagination,
    pageCount: props.pagination?.pageCount,
    ...(serverSorting ? { state: { sorting } } : {}),
  });

  function onHeaderClick(
    event: MouseEvent,
    column: Column | undefined,
    clientHandler: ((e: unknown) => void) | undefined
  ) {
    if (!serverSorting) {
      clientHandler?.(event);
      return;
    }
    if (column && column.sortable !== false) {
      props.onOrderingChange!(nextOrdering(props.ordering, column.accessorKey));
    }
  }

  const pager = serverPagination
    ? {
        page: props.pagination!.page,
        pageCount: Math.max(props.pagination!.pageCount, 1),
        canPrevious: props.pagination!.page > 1,
        canNext: props.pagination!.page < props.pagination!.pageCount,
        goTo: (page: number) => props.pagination!.onPageChange(page),
      }
    : {
        page: table.getState().pagination.pageIndex + 1,
        pageCount: table.getPageCount(),
        canPrevious: table.getCanPreviousPage(),
        canNext: table.getCanNextPage(),
        goTo: (page: number) => table.setPageIndex(page - 1),
      };

  const paginationControls = (
    <div className="flex items-center justify-between mt-4">
      <div className="flex items-center gap-2">
        <button
          className="px-3 py-1 border rounded bg-gray-50 text-gray-600 disabled:opacity-50"
          onClick={() => pager.goTo(1)}
          disabled={!pager.canPrevious}
          aria-label="First page"
        >
          {"<<"}
        </button>
        <button
          className="px-3 py-1 border rounded bg-gray-50 text-gray-600 disabled:opacity-50"
          onClick={() => pager.goTo(pager.page - 1)}
          disabled={!pager.canPrevious}
          aria-label="Previous page"
        >
          {"<"}
        </button>
        <button
          className="px-3 py-1 border rounded bg-gray-50 text-gray-600 disabled:opacity-50"
          onClick={() => pager.goTo(pager.page + 1)}
          disabled={!pager.canNext}
          aria-label="Next page"
        >
          {">"}
        </button>
        <button
          className="px-3 py-1 border rounded bg-gray-50 text-gray-600 disabled:opacity-50"
          onClick={() => pager.goTo(pager.pageCount)}
          disabled={!pager.canNext}
          aria-label="Last page"
        >
          {">>"}
        </button>
      </div>
      <div className="text-sm text-gray-600">
        Page{" "}
        <strong>
          {pager.page} of {pager.pageCount}
        </strong>
      </div>
    </div>
  );

  if (props.data.length === 0) {
    return (
      <div className="p-4 shadow rounded bg-white">
        <p className="text-center text-gray-500">No Data</p>
      </div>
    );
  }

  if (isSmallScreen) {
    return (
      <div className="space-y-4" data-testid={"small-screen-table"}>
        {table.getRowModel().rows.map((row) => (
          <div
            key={row.id}
            data-testid={`row-${row.id}`}
            className="shadow rounded bg-white p-4 cursor-pointer"
            onClick={() => props.onClickRow(row.original)}
          >
            {row.getVisibleCells().map((cell) => {
              const header =
                tableColumns.find((col) => col.accessorKey === cell.column.id)?.header ||
                cell.column.id;
              return (
                <div key={cell.id} className="mb-2">
                  <strong className="text-gray-700">{header}: </strong>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </div>
              );
            })}
          </div>
        ))}
        {serverPagination && paginationControls}
      </div>
    );
  }

  return (
    <div className="p-4 shadow rounded bg-white">
      <table className="w-full border-collapse">
        <thead className="bg-gray-100">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-2 text-left text-sm font-medium text-gray-600 uppercase cursor-pointer"
                  onClick={(event) =>
                    onHeaderClick(
                      event,
                      tableColumns.find((col) => col.accessorKey === header.column.id),
                      header.column.getToggleSortingHandler()
                    )
                  }
                  aria-sort={
                    header.column.getIsSorted() === "asc"
                      ? "ascending"
                      : header.column.getIsSorted() === "desc"
                        ? "descending"
                        : undefined
                  }
                  data-testid={`header-${header.id}`}
                >
                  <div className="flex items-center">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() ? (
                      header.column.getIsSorted() === "asc" ? (
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
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="cursor-pointer hover:bg-gray-50"
              data-testid={`row-${row.id}`}
              onClick={() => props.onClickRow(row.original)}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-2 text-sm text-gray-700">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {paginationControls}
    </div>
  );
}
