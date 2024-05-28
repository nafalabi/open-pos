import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  File,
  PlusCircle,
  Search,
  SquarePenIcon,
  Trash2Icon,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../../layout/data-table";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import useQueryParams from "../../hooks/useQueryParams";
import Pagination from "../../layout/pagination";
import { defaultPagination } from "../../api/types";
import { Input } from "@/shared/components/ui/input";
import { debounce } from "../../utils/function-utils";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { showAlert } from "../../layout/global-alert";
import {
  DropdownMenu,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryClient } from "../../App";
import { Category } from "@/generated/schema";
import { deleteCategory, getCategories } from "../../api/categories";
import CategoryAddDialog, { CategoryAddDialogRef } from "./CategoryAddDialog";
import CategoryEditDialog, {
  CategoryEditDialogRef,
} from "./CategoryEditDialog";

const generateColumn = (
  handleEdit: (id: string) => void
): ColumnDef<Category>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <div className="ml-2 mr-2">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="ml-2">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    size: 15,
  },
  {
    id: "name",
    header: "Name",
    accessorFn: (row) => row,
    cell: (info) => {
      const value = info.getValue() as Category;
      return (
        <div>
          <p className="font-bold">{value.name}</p>
        </div>
      );
    },
  },
  {
    id: "action",
    header: "",
    accessorKey: "id",
    size: 20,
    cell: (info) => {
      const id = info.getValue() as string;

      const handleDelete = () => {
        showAlert({
          title: "Delete Confirmation",
          message: `Are you sure to delete the category?`,
          async onConfirm() {
            toast.promise(
              async () => {
                const [, err] = await deleteCategory(id);
                if (err) throw new Error(err.message);
                queryClient.invalidateQueries({ queryKey: ["categories"] });
              },
              {
                loading: "Deleting row...",
                success: "Success deleting category",
                error: "Failed to delete category",
              }
            );
          },
        });
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <DotsHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleEdit(id)}>
              <SquarePenIcon className="h-3.5 w-3.5 mr-1" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete}>
              <Trash2Icon className="h-3.5 w-3.5 mr-1" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

const CategoriesPage = () => {
  const addCategoryDialogRef = useRef<CategoryAddDialogRef | null>(null);
  const editCategoryDialogRef = useRef<CategoryEditDialogRef | null>(null);
  const { queryParams, setPage, setPageSize, setQueryParams } = useQueryParams({
    paramkeys: ["q"],
  });
  const [rowSelection, setRowSelection] = useState<Record<number, boolean>>({});
  const isAnyRowSelected = Object.keys(rowSelection).length > 0;

  const fetchData = async (params: typeof queryParams) => {
    const [result, error] = await getCategories({
      page: params.page,
      pagesize: params.pagesize,
      q: params.q ?? "",
    });

    if (error) {
      toast.error("Error occured", {
        description: error.message,
        dismissible: true,
      });
      return { data: [], paginationData: defaultPagination };
    }
    return {
      data: result.data,
      paginationData: result.pagination ?? defaultPagination,
    };
  };

  const {
    data: { data, paginationData },
    isFetching,
  } = useQuery({
    queryKey: ["categories", queryParams],
    queryFn: () => fetchData(queryParams),
    initialData: {
      data: [],
      paginationData: defaultPagination,
    },
    placeholderData: keepPreviousData,
  });

  const handleSearch = useCallback(
    debounce((keyword: string) => {
      setQueryParams({ q: keyword });
    }, 500),
    [setQueryParams]
  );

  const handleDeleteSelected = () => {
    const selectedRows = Object.keys(rowSelection) as unknown[] as number[];
    showAlert({
      title: "Delete Confirmation",
      message: `Are you sure to delete these (${selectedRows.length}) categories?`,
      async onConfirm() {
        const ids = selectedRows.map((index) => data[index].id);
        const errors = [];
        toast.promise(
          Promise.all(
            ids.map(async (id) => {
              const [, err] = await deleteCategory(id);
              if (err) errors.push(err);
            })
          ),
          {
            loading: "Deleting rows...",
            finally: () => {
              const errorCount = errors.length;
              const successCount = selectedRows.length - errors.length;
              if (errorCount > 0) {
                toast.error(`Failed to delete ${errorCount} rows`);
              }
              if (successCount > 0) {
                toast(`Success deleting ${successCount} rows`);
                queryClient.invalidateQueries({ queryKey: ["categories"] });
              }
              setRowSelection({});
            },
          }
        );
      },
    });
  };

  const columns = useMemo(() => {
    return generateColumn((id) =>
      editCategoryDialogRef.current?.openDialog(id)
    );
  }, []);

  return (
    <div className="grid flex-1 items-start gap-2 p-4 sm:px-6 sm:py-0 md:gap-2">
      <Card x-chunk="dashboard-06-chunk-0">
        <CardHeader>
          <div className="flex items-center">
            <div>
              <CardTitle>Categories</CardTitle>
              <CardDescription>
                Organize categories for your products.
              </CardDescription>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="relative ml-auto flex-1 md:grow-0">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  defaultValue={queryParams.q ?? ""}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full rounded-lg bg-background pl-8 md:w-[150px] lg:w-[200px]"
                />
              </div>
              <Button size="sm" variant="outline" className="h-7 gap-1">
                <File className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Export
                </span>
              </Button>
              <Button
                size="sm"
                className="h-7 gap-1"
                onClick={() => {
                  addCategoryDialogRef.current?.openDialog();
                }}
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add Category
                </span>
              </Button>
              {isAnyRowSelected && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-7 gap-1"
                  onClick={handleDeleteSelected}
                >
                  <Trash2Icon className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Delete All
                  </span>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={data}
            columns={columns}
            isLoading={isFetching && data.length === 0}
            paginationState={{
              pageIndex: Number(queryParams.page),
              pageSize: Number(queryParams.pagesize),
            }}
            tableOptions={{
              onRowSelectionChange: setRowSelection,
              state: {
                rowSelection,
              },
            }}
          />
        </CardContent>
        <CardFooter>
          <Pagination
            page={Number(queryParams.page)}
            pagesize={Number(queryParams.pagesize)}
            totalpage={paginationData.total_page}
            totalrecords={paginationData.total_items}
            onChangePage={(page) => setPage(page)}
            onChangePageSize={(pagesize) => setPageSize(pagesize)}
          />
        </CardFooter>
      </Card>
      <CategoryAddDialog ref={addCategoryDialogRef} />
      <CategoryEditDialog ref={editCategoryDialogRef} />
    </div>
  );
};

export default CategoriesPage;
