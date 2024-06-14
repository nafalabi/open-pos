import { Button } from "@/shared/components/ui/button";
import { ScrollArea, ScrollBar } from "@/shared/components/ui/scroll-area";
import { Fragment } from "react";
import OrderCard from "./OrderCard";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PaginationParams, SortParams } from "@/maindesk/src/api/types";
import { getOrders } from "@/maindesk/src/api/orders";

const fetchParams: PaginationParams & SortParams = {
  page: "1",
  pagesize: "11",
  sortkey: "created_at",
  sortdir: "desc",
};

const LatestOrders = () => {
  const { data } = useQuery({
    queryKey: ["orders", fetchParams],
    queryFn: async () => {
      const [result, error] = await getOrders(fetchParams);
      if (error) return [];
      return result.data;
    },
    initialData: [],
  });

  if (data.length === 0) return null;

  return (
    <Fragment>
      <div className="mb-2 flex">
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          Order List
        </h3>
        {data.length > 10 && (
          <Button className="ml-auto h-6" variant="default" size="sm" asChild>
            <Link to={"/orders"}>View more</Link>
          </Button>
        )}
      </div>
      <ScrollArea className="whitespace-nowrap">
        <div className="flex gap-2 mb-3">
          {data?.map((order) => <OrderCard key={order.id} orderData={order} />)}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </Fragment>
  );
};

export default LatestOrders;
