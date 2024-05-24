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
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { File, ImageOff, ListFilter, PlusCircle } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Product } from "@/generated/schema";
import { DataTable } from "../../layout/data-table";
import { useEffect, useState } from "react";
import { getProducts } from "../../api/products";
import { toast } from "sonner";
import useQueryParams from "../../hooks/useQueryParams";
import Pagination from "../../layout/pagination";
import { PaginationData } from "../../api/types";
import { useNavigate } from "react-router-dom";

const columns: ColumnDef<Product>[] = [
  {
    id: "image",
    header: "",
    accessorKey: "image",
    cell: (info) => {
      const src = info.getValue() as string;
      return (
        <div className="max-w-[80px] max-h-[80px] aspect-square rounded-md relative">
          <img
            src={src ?? ""}
            loading="lazy"
            className="w-full h-auto aspect-square rounded-md object-cover z-20"
            onError={(e) => {
              e.currentTarget.hidden = true;
              const parentEl = e.currentTarget.parentNode;
              const imgOffEl = parentEl?.querySelector("svg");
              imgOffEl?.classList.remove("hidden");
            }}
          />
          <ImageOff className="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] z-10 hidden" />
        </div>
      );
    },
    size: 80,
  },
  {
    id: "name",
    header: "Name",
    accessorFn: (row) => row,
    cell: (info) => {
      const value = info.getValue() as Product;
      return (
        <div>
          <p className="font-bold">{value.name}</p>
          <p className="text-muted-foreground">{value.description}</p>
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
];

const ProductsPage = () => {
  const navigate = useNavigate();
  const { queryParams, setPage, setPageSize } = useQueryParams({
    paramkeys: [],
  });
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState<Product[]>([]);
  const [paginationData, setPaginationData] = useState<PaginationData>({
    page_size: 10,
    total_page: 0,
    total_items: 0,
    current_page: 1,
  });

  useEffect(() => {
    setLoading(true);
    getProducts({
      page: queryParams.page,
      pagesize: queryParams.pagesize,
    })
      .then(([result, error]) => {
        if (error) {
          toast.error("Error occured", {
            description: error.message,
            dismissible: true,
          });
          return;
        }
        if (result?.data) {
          setData(result.data);
        }
        if (result?.pagination) {
          setPaginationData(result.pagination);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [queryParams]);

  return (
    <div className="grid flex-1 items-start gap-2 p-4 sm:px-6 sm:py-0 md:gap-2">
      <Card x-chunk="dashboard-06-chunk-0">
        <CardHeader>
          <div className="flex items-center">
            <div>
              <CardTitle>Products</CardTitle>
              <CardDescription>Manage all your products here.</CardDescription>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 gap-1">
                    <ListFilter className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Filter
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem checked>
                    Active
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>Draft</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>Archived</DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={data}
            columns={columns}
            isLoading={isLoading}
            paginationState={{
              pageIndex: Number(queryParams.page),
              pageSize: Number(queryParams.pagesize),
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
