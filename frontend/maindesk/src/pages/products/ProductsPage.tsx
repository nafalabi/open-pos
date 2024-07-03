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
import { type Model_Product } from "@/generated/models";
import { DataTable } from "../../layout/data-table";
import { useCallback, useMemo, useState } from "react";
import { deleteProduct, getProducts } from "../../api/products";
import { toast } from "sonner";
import useQueryParams from "../../hooks/useQueryParams";
import Pagination from "../../layout/pagination";
import { defaultPagination } from "../../api/types";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/shared/components/ui/badge";
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
import {
  QueryClient,
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import GenericImage from "../../layout/generic-image";

const generateColumns = (
  queryClient: QueryClient,
  navigate: ReturnType<typeof useNavigate>
): ColumnDef<Model_Product>[] => [
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
    id: "image",
    header: "",
    accessorKey: "image",
    cell: (info) => {
      const src = info.getValue() as string;
      return (
        <GenericImage
          src={src}
          containerProps={{
            className:
              "max-w-[50px] max-h-[50px] aspect-square rounded-md relative",
          }}
        />
      );
    },
    size: 80,
  },
  {
    id: "name",
    header: "Name",
    accessorFn: (row) => row,
    cell: (info) => {
      const value = info.getValue() as Model_Product;
      return (
        <div>
          <p className="font-bold">{value.name}</p>
          <p className="text-muted-foreground">{value.description}</p>
        </div>
      );
    },
  },
  {
    id: "categories",
    header: "Categories",
    accessorFn: (row) => (row.categories ?? []).map((cat) => cat.name),
    cell: (info) => {
      const categories = info.getValue() as string[];
      return (
        <div className="flex flex-wrap gap-1">
          {categories.map((cat: string) => (
            <Badge key={cat} className="max-w-fit truncate">
              {cat}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    id: "price",
    header: "Price",
    accessorKey: "price",
    cell: (info) => info.getValue(),
  },
  {
    id: "stock",
    header: "Stock",
    accessorKey: "stock",
    cell: (info) => info.getValue(),
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
          message: `Are you sure to delete the product?`,
          async onConfirm() {
            toast.promise(
              async () => {
                const [, err] = await deleteProduct(id);
                if (err) throw new Error(err.message);
                queryClient.invalidateQueries({ queryKey: ["products"] });
              },
              {
                loading: "Deleting row...",
                success: "Success deleting product",
                error: "Failed to delete product",
              }
            );
          },
        });
      };

      const handleEdit = () => {
        navigate("/products/edit/" + id);
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
            <DropdownMenuItem onClick={handleEdit}>
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

const ProductsPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { queryParams, setPage, setPageSize, setQueryParams } = useQueryParams({
    paramkeys: ["q"],
  });
  const [rowSelection, setRowSelection] = useState<Record<number, boolean>>({});
  const isAnyRowSelected = Object.keys(rowSelection).length > 0;

  const fetchData = async (params: typeof queryParams) => {
    const [result, error] = await getProducts({
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
    queryKey: ["products", queryParams],
    queryFn: () => fetchData(queryParams),
    initialData: {
      data: [],
      paginationData: defaultPagination,
    },
    placeholderData: keepPreviousData,
  });

  const columns = useMemo(
    () => generateColumns(queryClient, navigate),
    [queryClient, navigate]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      message: `Are you sure to delete these (${selectedRows.length}) products?`,
      async onConfirm() {
        const ids = selectedRows.map((index) => data[index].id);
        const errors = [];
        toast.promise(
          Promise.all(
            ids.map(async (id) => {
              const [, err] = await deleteProduct(id);
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
                queryClient.invalidateQueries({ queryKey: ["products"] });
              }
              setRowSelection({});
            },
          }
        );
      },
    });
  };

  return (
    <div className="grid flex-1 items-start gap-2 p-0 sm:px-0 sm:py-0 md:gap-2">
      <Card className="w-full min-w-[275px]">
        <CardHeader>
          <div className="flex flex-wrap gap-2 items-center">
            <div>
              <CardTitle>Products</CardTitle>
              <CardDescription>Manage all your products here.</CardDescription>
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
                onClick={() => navigate("/products/add")}
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add Product
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
    </div>
  );
};

export default ProductsPage;
