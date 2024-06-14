import { Model_Product } from "@/generated/models";
import { currency } from "@/maindesk/src/utils/currency";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/utils/shadcn";
import { PlusCircleIcon } from "lucide-react";
import { useCartStore } from "../state/cart";
import { useNavigate, useMatch } from "react-router-dom";
import GenericImage from "@/maindesk/src/layout/generic-image";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { ForwardedRef, forwardRef } from "react";

type MenuItemProps = {
  size: MenuItemSize;
  product: Model_Product;
};

export type MenuItemSize = "sm" | "md" | "lg";

const MenuItem = ({ product, size }: MenuItemProps) => {
  const isAddOrderPanelOpen = useMatch("/home/add-order");
  const navigate = useNavigate();
  const appendProduct = useCartStore((state) => state.appendProduct);

  const handleAddProduct = () => {
    appendProduct(product);
    if (!isAddOrderPanelOpen) navigate(`/home/add-order`);
  };

  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-md",
        size === "lg" && "w-64",
        size === "md" && "w-48",
        size === "sm" && "w-40",
      )}
    >
      <GenericImage
        src={product.image}
        fallbackSrc="/placeholder.svg"
        containerProps={{
          className: "w-full aspect-square rounded-t-lg object-cover",
        }}
      />
      <div className="p-4">
        <h3 className="text-md font-bold">{product.name}</h3>
        <p className="text-sm text-gray-500 mb-3 overflow-hidden text-ellipsis line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-gray-900 font-medium">
            {currency(product.price)}
          </span>
          <Button size="sm" className="h-6 mt-auto" onClick={handleAddProduct}>
            <PlusCircleIcon className="h-4 w-4" />
            &nbsp; Add
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MenuItem;

export const MenuItemSkeleton = forwardRef(
  ({ size }: { size: MenuItemSize }, ref: ForwardedRef<HTMLDivElement>) => {
    return (
      <div
        ref={ref}
        className={cn(
          "",
          size === "lg" && "w-64",
          size === "md" && "w-48",
          size === "sm" && "w-40",
        )}
      >
        <Skeleton className="w-full aspect-square rounded-t-lg object-cover" />
        <div className="mt-4">
          <Skeleton className="w-full h-4 mb-3" />
          <Skeleton className="w-full h-4 mb-3" />
          <Skeleton className="w-full h-4 mb-3" />
        </div>
      </div>
    );
  },
);
