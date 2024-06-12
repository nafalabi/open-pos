import { Fragment } from "react/jsx-runtime";
import CategorySelector from "./CategorySelector";
import MenuItem, { MenuItemSize, MenuItemSkeleton } from "./MenuItem";
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
import { LayoutGridIcon, SearchIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { debounce } from "@/maindesk/src/utils/function-utils";
import { useObserveIntersection } from "@/maindesk/src/hooks/useObserveIntersection";
import { useRefUnmountedStatus } from "@/maindesk/src/hooks/useRefUnmountedStatus";

const defaultFetchParams: Parameters<typeof getProducts>[0] = {
  page: String(1),
  pagesize: String(10),
  sortkey: "name",
  sortdir: "asc",
};

const MenuList = () => {
  const infiniteScrollRef = useRef<HTMLDivElement>(null);
  const unmountedRef = useRefUnmountedStatus();
  const queryClient = useQueryClient();
  const [gridSize, setGridSize] = useState<MenuItemSize>("md");

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
    queryClient.invalidateQueries({ queryKey: ["products"] });
  }, [fetchParams, queryClient]);

  useObserveIntersection(infiniteScrollRef, ([entry]) => {
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
    [unmountedRef]
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
          <MenuSizeOption onChange={setGridSize} />
        </div>
      </div>

      <div className="flex flex-wrap gap-4 justify-start">
        {data &&
          data.pages.map((page) =>
            page.data.map((product) => (
              <MenuItem key={product.id} product={product} size={gridSize} />
            ))
          )}
        {hasNextPage && (
          <>
            <MenuItemSkeleton size={gridSize} ref={infiniteScrollRef} />
            <MenuItemSkeleton size={gridSize} />
            <MenuItemSkeleton size={gridSize} />
            <MenuItemSkeleton size={gridSize} />
            <MenuItemSkeleton size={gridSize} />
          </>
        )}
      </div>
    </Fragment>
  );
};

export default MenuList;

const MenuSizeOption = ({
  onChange,
}: {
  onChange: (size: MenuItemSize) => void;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost">
          <LayoutGridIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Menu Size</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onChange("sm")}>
          Small
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChange("md")}>
          Medium
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChange("lg")}>
          Large
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
