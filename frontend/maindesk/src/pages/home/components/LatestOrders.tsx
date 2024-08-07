import { Button } from "@/shared/components/ui/button";
import { ScrollArea, ScrollBar } from "@/shared/components/ui/scroll-area";
import { Fragment, useEffect, useRef, useState } from "react";
import OrderCard, { SkeletonOrderCard } from "./OrderCard";
import { Link } from "react-router-dom";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { PaginationParams, SortParams } from "@/maindesk/src/api/types";
import { getOrders } from "@/maindesk/src/api/orders";
import { useObserveIntersection } from "@/maindesk/src/hooks/useObserveIntersection";
import { format } from "date-fns";

const defaultFetchParams: PaginationParams & SortParams = {
  page: "1",
  pagesize: "10",
  sortkey: "created_at",
  sortdir: "desc",
};

const LatestOrders = () => {
  const intersectionScrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const [fetchParams] = useState(defaultFetchParams);
  const { data, isFetching, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ["orders", fetchParams],
    queryFn: async ({ pageParam }) => {
      const [result] = await getOrders({
        ...fetchParams,
        page: pageParam.toString(),
        startdate: format(Date.now(), "yyyy-MM-dd"),
        enddate: format(Date.now(), "yyyy-MM-dd"),
      });
      return {
        data: result?.data ?? [],
        pagination: result?.pagination,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.data.length < 10
        ? undefined
        : (lastPage.pagination?.current_page ?? 0) + 1;
    },
  });

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
  }, [fetchParams, queryClient]);

  useObserveIntersection(intersectionScrollRef, ([entry]) => {
    if (isFetching || !hasNextPage) return;
    if (!entry.isIntersecting) return;
    fetchNextPage();
  });

  return (
    <Fragment>
      <div className="mb-2 flex">
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          Today's Orders
        </h3>
        <Button className="ml-auto h-6" variant="default" size="sm" asChild>
          <Link to={"/orders"}>View more</Link>
        </Button>
      </div>
      <ScrollArea className="whitespace-nowrap">
        <div className="flex gap-2 mb-3 min-h-[122px]">
          {!isFetching && (data?.pages?.[0]?.data?.length ?? 0) < 1 && (
            <div className="h-[122px] content-center">
              There's no item to show
            </div>
          )}
          {data?.pages.map((page) =>
            page?.data.map((order) => (
              <OrderCard key={order.id} orderData={order} />
            )),
          )}
          {hasNextPage && (
            <>
              <SkeletonOrderCard />
              <SkeletonOrderCard ref={intersectionScrollRef} />
              <SkeletonOrderCard />
            </>
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </Fragment>
  );
};

export default LatestOrders;
