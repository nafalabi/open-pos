import { Fragment } from "react/jsx-runtime";
import CategorySelector from "./CategorySelector";
import {
  MenuItemCard,
  MenuItemCardSkeleton,
  MenuItemList,
  MenuItemListSkeleton,
} from "./MenuItem";
import { getProducts } from "@/maindesk/src/api/products";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { LayoutGridIcon, LayoutListIcon, SearchIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { debounce } from "@/maindesk/src/utils/function-utils";
import { useObserveIntersection } from "@/maindesk/src/hooks/useObserveIntersection";
import { useRefUnmountedStatus } from "@/maindesk/src/hooks/useRefUnmountedStatus";
import { cn } from "@/shared/utils/shadcn";
import { useMatch } from "react-router-dom";
import { Table, TableBody } from "@/shared/components/ui/table";
import { LOCALSTORAGE_PREFIX } from "@/maindesk/src/constant/common";

type ViewType = "grid" | "list";

const defaultFetchParams: Parameters<typeof getProducts>[0] = {
  page: String(1),
  pagesize: String(10),
  sortkey: "name",
  sortdir: "asc",
};

const MENU_VIEW_STORAGE_KEY = LOCALSTORAGE_PREFIX + "home::menu-view";

const useViewType = () => {
  const defaultView = useMemo(() => {
    return (localStorage.getItem(MENU_VIEW_STORAGE_KEY) || "grid") as ViewType;
  }, []);
  const [viewType, setViewType] = useState<ViewType>(defaultView);

  const handleSetViewType = (view: ViewType) => {
    setViewType(view);
    localStorage.setItem(MENU_VIEW_STORAGE_KEY, view);
  };

  return [viewType, handleSetViewType] as const;
};

const MenuList = () => {
  const intersectionScrollRef = useRef<HTMLDivElement & HTMLTableRowElement>(
    null,
  );
  const unmountedRef = useRefUnmountedStatus();
  const queryClient = useQueryClient();
  const [viewType, setViewType] = useViewType();
  const matchPath = useMatch("/home/*");
  const isPanelOpened = matchPath?.params["*"] !== "";

  const [fetchParams, setFetchParams] = useState(defaultFetchParams);
  const { data, isFetching, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ["products"],
    queryFn: async ({ pageParam = 1 }) => {
      const [result] = await getProducts({
        ...fetchParams,
        page: pageParam.toString(),
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
    if (!queryClient.isFetching) {
      queryClient.removeQueries({ queryKey: ["products"] });
    }
    queryClient.invalidateQueries({ queryKey: ["products"] });
  }, [fetchParams, queryClient]);

  useObserveIntersection(intersectionScrollRef, ([entry]) => {
    if (isFetching || !hasNextPage) return;
    if (!entry.isIntersecting) return;
    fetchNextPage();
  });

  const handleSearch = useMemo(
    () =>
      debounce((event: React.ChangeEvent<HTMLInputElement>) => {
        if (unmountedRef.current) return;
        const q = event.target.value;
        setFetchParams((old) => ({ ...old, q }));
      }, 500),
    [unmountedRef],
  );

  return (
    <Fragment>
      <h3 className="my-2 text-2xl font-semibold tracking-tight">Menu</h3>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <CategorySelector
          selectedId={fetchParams.category}
          onChangeSelection={(id) => {
            setFetchParams((old) => ({ ...old, category: id }));
          }}
        />
        <div className="relative ml-auto flex-1 flex gap-1 md:grow-0">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            onChange={handleSearch}
            className="w-full rounded-lg bg-background pl-8 min-w-[200px]"
          />
          <MenuSizeOption value={viewType} onChange={setViewType} />
        </div>
      </div>

      {viewType === "grid" && (
        <div
          className={cn(
            "grid gap-4 justify-start",
            isPanelOpened
              ? "grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
              : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6",
          )}
        >
          {data &&
            data.pages.map((page) =>
              page.data.map((product) => (
                <MenuItemCard key={product.id} product={product} />
              )),
            )}
          {(hasNextPage || isFetching) && (
            <>
              <MenuItemCardSkeleton ref={intersectionScrollRef} />
              <MenuItemCardSkeleton />
              <MenuItemCardSkeleton />
              <MenuItemCardSkeleton />
              <MenuItemCardSkeleton />
              <MenuItemCardSkeleton />
              <MenuItemCardSkeleton />
            </>
          )}
        </div>
      )}

      {viewType === "list" && (
        <Table className="min-w-[300px] mb-16">
          <TableBody>
            {data &&
              data.pages.map((page) =>
                page.data.map((product) => (
                  <MenuItemList key={product.id} product={product} />
                )),
              )}
            {(hasNextPage || isFetching) && (
              <>
                <MenuItemListSkeleton ref={intersectionScrollRef} />
                <MenuItemListSkeleton />
                <MenuItemListSkeleton />
                <MenuItemListSkeleton />
                <MenuItemListSkeleton />
              </>
            )}
          </TableBody>
        </Table>
      )}
    </Fragment>
  );
};

export default MenuList;

const MenuSizeOption = ({
  value,
  onChange,
}: {
  value: ViewType;
  onChange: (val: ViewType) => void;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost">
          {value === "grid" && <LayoutGridIcon />}
          {value === "list" && <LayoutListIcon />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Menu view</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onChange("grid")}>
          Grid view
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChange("list")}>
          List view
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
