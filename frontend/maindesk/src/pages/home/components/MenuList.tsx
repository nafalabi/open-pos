import { Fragment } from "react/jsx-runtime";
import CategorySelector from "./CategorySelector";
import MenuItem, { MenuItemSize } from "./MenuItem";
import { getProducts } from "@/maindesk/src/api/products";
import { useQuery } from "@tanstack/react-query";
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

const defaultFetchParams: Parameters<typeof getProducts>[0] = {
  page: String(1),
  pagesize: String(10),
  sortkey: "name",
  sortdir: "asc",
};

const MenuList = () => {
  const unmountedRef = useRef(false);
  const [itemSize, setItemSize] = useState<MenuItemSize>("md");
  const [fetchParams, setFetchParams] = useState(defaultFetchParams);
  const { data } = useQuery({
    initialData: [],
    queryKey: ["products", fetchParams],
    queryFn: async () => {
      const [result, error] = await getProducts(fetchParams);
      if (error) return [];
      return result.data ?? [];
    },
  });

  useEffect(() => {
    unmountedRef.current = false;
    return () => {
      unmountedRef.current = true;
    };
  }, []);

  const handleSearch = useMemo(
    () =>
      debounce((event: React.ChangeEvent<HTMLInputElement>) => {
        if (unmountedRef.current) return;
        const q = event.target.value;
        setFetchParams((old) => ({ ...old, q }));
      }, 500),
    []
  );

  return (
    <Fragment>
      <h3 className="my-2 text-2xl font-semibold tracking-tight">Menu</h3>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <CategorySelector
          selectedId={fetchParams.category}
          onChangeSelection={(id) =>
            setFetchParams((old) => ({ ...old, category: id }))
          }
        />
        <div className="relative ml-auto flex-1 flex gap-1 md:grow-0">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            onChange={handleSearch}
            className="w-full rounded-lg bg-background pl-8 min-w-[200px]"
          />
          <MenuSizeOption onChange={setItemSize} />
        </div>
      </div>

      <div className="flex flex-wrap gap-4 justify-start">
        {data.map((product) => (
          <MenuItem key={product.id} product={product} size={itemSize} />
        ))}
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
