import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Skeleton } from "@/shared/components/ui/skeleton";

type DataTableProps<TData> = {
  data: TData[];
  columns: ColumnDef<TData>[];
  isLoading?: boolean;
  rowCount?: number;
  paginationState?: {
    pageSize: number;
    pageIndex: number;
  };
};

export const DataTable = <TData = object,>({
  data,
  columns,
  isLoading,
  rowCount,
  paginationState,
}: DataTableProps<TData>) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    rowCount,
    manualPagination: true,
    state: {
      pagination: paginationState,
    },
    defaultColumn: {
      size: 0,
    },
  });

  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{
                        width:
                          header.column.columnDef.size !== 0
                            ? header.column.columnDef.size
                            : "",
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(paginationState?.pageSize ?? 10).keys()].map(
                (rowIndex) => (
                  <TableRow key={rowIndex}>
                    {[...Array(columns.length).keys()].map((colIndex) => (
                      <TableCell
                        key={colIndex}
                        colSpan={1}
                        className="text-center"
                      >
                        <Skeleton className="w-full h-4 rounded-md my-2" />
                      </TableCell>
                    ))}
                  </TableRow>
                ),
              )
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
