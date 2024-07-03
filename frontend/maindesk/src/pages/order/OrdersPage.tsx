import {
  QueryClient,
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { DataTable } from "../../layout/data-table";
import { getOrders } from "../../api/orders";
import { useMemo } from "react";
import { Model_Order } from "@/generated/models";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import OrderStatusBadge from "../home/components/OrderStatusBadge";
import { OrderStatus } from "@/generated/enums";
import { currency } from "../../utils/currency";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  FileIcon,
  PlusCircleIcon,
  SearchIcon,
  SquarePenIcon,
} from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { useNavigate, useOutlet } from "react-router-dom";
import Pagination from "../../layout/pagination";
import useQueryParams from "../../hooks/useQueryParams";
import { defaultPagination } from "../../api/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";

const generateColumns = (
  navigate: ReturnType<typeof useNavigate>,
): ColumnDef<Model_Order>[] => {
  return [
    {
      header: "No.",
      accessorKey: "order_number",
      cell: (info) => info.getValue(),
    },
    {
      header: "Recipient",
      accessorKey: "recipient",
      cell: (info) => info.getValue() || "-",
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (info) => (
        <OrderStatusBadge status={info.getValue() as OrderStatus} />
      ),
    },
    {
      header: "Date",
      accessorKey: "created_at",
      cell: (info) =>
        format(new Date(info.getValue() as string), "dd MMM yy, HH:mm"),
    },
    {
      header: "Total",
      accessorFn: (row) => ({
        totalAmount: row.total,
        itemsCount: row.items.length,
      }),
      cell: (info) => {
        const data = info.getValue() as {
          totalAmount: number;
          itemsCount: number;
        };
        const totalAmount = data.totalAmount;
        const itemsCount = data.itemsCount;
        return (
          <div>
            <span>{currency(totalAmount)}</span>
            &nbsp;&middot;&nbsp;
            <span className="text-xs text-muted-foreground">
              {itemsCount} item(s)
            </span>
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

        const handleView = () => {
          navigate("/orders/detail/" + id + (location.search || ""));
        };

        return (
          <Button
            size="sm"
            className="h-6"
            variant="outline"
            onClick={handleView}
          >
            <SearchIcon className="mr-1 h-4 w-4" />
            View
          </Button>
        );
      },
    },
  ];
};

const OrdersPage = () => {
  const outlet = useOutlet();
  const navigate = useNavigate();
  const { queryParams, setPage, setPageSize, setQueryParams } = useQueryParams({
    paramkeys: ["q"],
    defaults: {
      pagesize: "15",
    },
  });

  const {
    data: { data, paginationData },
    isFetching,
  } = useQuery({
    queryKey: ["orders", queryParams],
    queryFn: async () => {
      const [result, error] = await getOrders({
        page: queryParams.page,
        pagesize: queryParams.pagesize,
        sortdir: queryParams.sortdirection ?? "desc",
        sortkey: queryParams.sortkey ?? "created_at",
        q: queryParams.q ?? "",
      });
      if (error) {
        return { data: [], paginationData: defaultPagination };
      }
      return {
        data: result.data,
        paginationData: result.pagination ?? defaultPagination,
      };
    },
    initialData: {
      data: [],
      paginationData: defaultPagination,
    },
    placeholderData: keepPreviousData,
  });

  const columns = useMemo(() => generateColumns(navigate), [navigate]);

  const handleSearch = (keyword: string) => {
    setQueryParams({
      q: keyword,
    });
  };

  console.log("outlet", outlet);

  return (
    <div className="flex flex-wrap items-start md:flex-nowrap gap-6 w-full p-0 sm:px-0 sm:py-0">
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center">
            <div>
              <CardTitle>Orders</CardTitle>
              <CardDescription>
                See all the orders and manage them here.
              </CardDescription>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="relative ml-auto flex-1 md:grow-0">
                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  defaultValue={queryParams.q ?? ""}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full rounded-lg bg-background pl-8 md:w-[150px] lg:w-[200px]"
                />
              </div>
              <Button size="sm" variant="outline" className="h-7 gap-1">
                <FileIcon className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Export
                </span>
              </Button>
              <Button
                size="sm"
                className="h-7 gap-1"
                onClick={() => navigate("/products/add")}
              >
                <PlusCircleIcon className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add Product
                </span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={data}
            isLoading={isFetching && data.length === 0}
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
      {outlet && (
        <div className="min-w-[275px] lg:min-w-[350px] max-w-[350px] w-full md:w-auto sticky bottom-0 md:sticky md:top-4">
          {outlet}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
