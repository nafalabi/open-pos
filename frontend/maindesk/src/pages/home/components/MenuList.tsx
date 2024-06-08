import { Fragment } from "react/jsx-runtime";
import CategorySelector from "./CategorySelector";
import MenuItem from "./MenuItem";
import { getProducts } from "@/maindesk/src/api/products";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const defaultFetchParams: Parameters<typeof getProducts>[0] = {
  page: String(1),
  pagesize: String(10),
};

const MenuList = () => {
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

  return (
    <Fragment>
      <h3 className="my-2 text-2xl font-semibold tracking-tight">Menu</h3>
      <CategorySelector
        selectedId={fetchParams.category}
        onChangeSelection={(id) =>
          setFetchParams((old) => ({ ...old, category: id }))
        }
      />

      <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data.map((product) => (
          <MenuItem key={product.id} menuData={product} />
        ))}
      </div>
    </Fragment>
  );
};

export default MenuList;
