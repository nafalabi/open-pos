import { Model_Product } from "@/generated/models";
import { currency } from "@/maindesk/src/utils/currency";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/utils/shadcn";
import { PlusCircleIcon } from "lucide-react";
import { useOrderStore } from "../state/order";

type MenuItemProps = {
  size: MenuItemSize;
  product: Model_Product;
};

export type MenuItemSize = "sm" | "md" | "lg";

const MenuItem = ({ product, size }: MenuItemProps) => {
  const appendProduct = useOrderStore((state) => state.appendProduct);

  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-md",
        size === "lg" && "w-64",
        size === "md" && "w-48",
        size === "sm" && "w-40"
      )}
    >
      <img
        src={product.image}
        onError={(e) => {
          e.currentTarget.src = "/placeholder.svg";
        }}
        className="rounded-t-lg object-cover w-full aspect-square"
      />
      <div className="p-4">
        <h3 className="text-md font-bold">{product.name}</h3>
        <p className="text-sm text-gray-500 mb-3 overflow-hidden text-ellipsis line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-gray-900 font-bold">
            {currency(product.price)}
          </span>
          <Button
            size="sm"
            className="h-6 mt-auto"
            onClick={() => appendProduct(product)}
          >
            <PlusCircleIcon className="h-4 w-4" />
            &nbsp; Add
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MenuItem;
