import { Model_Product } from "@/generated/models";
import { currency } from "@/maindesk/src/utils/currency";
import { Button } from "@/shared/components/ui/button";
import { PlusCircleIcon } from "lucide-react";
import { useCartStore } from "../state/cart";
import { useNavigate, useMatch } from "react-router-dom";
import GenericImage from "@/maindesk/src/layout/generic-image";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { ForwardedRef, forwardRef } from "react";
import { TableCell, TableRow } from "@/shared/components/ui/table";
import { useMediaQuery } from "@/maindesk/src/hooks/useMediaQuery";

type MenuItemProps = {
  product: Model_Product;
};

const useMenuItemActions = (product: Model_Product) => {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const isAddOrderPanelOpen = useMatch("/home/add-order");
  const navigate = useNavigate();
  const appendProduct = useCartStore((state) => state.appendProduct);

  const handleAddProduct = () => {
    appendProduct(product);
    if (isMobile) return;
    if (isAddOrderPanelOpen) return;
    navigate(`/home/add-order`);
  };

  return { handleAddProduct };
};

export const MenuItemCard = ({ product }: MenuItemProps) => {
  const { handleAddProduct } = useMenuItemActions(product);

  return (
    <div className="bg-white rounded-lg shadow-md">
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

export const MenuItemCardSkeleton = forwardRef(
  (_, ref: ForwardedRef<HTMLDivElement>) => {
    return (
      <div ref={ref}>
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

export const MenuItemList = ({ product }: MenuItemProps) => {
  const { handleAddProduct } = useMenuItemActions(product);
  return (
    <TableRow>
      <TableCell className="w-12">
        <GenericImage
          src={product.image}
          fallbackSrc="/placeholder.svg"
          containerProps={{
            className: "w-full aspect-square rounded-t-lg object-cover",
          }}
        />
      </TableCell>
      <TableCell>{product.name}</TableCell>
      <TableCell>{currency(product.price)}</TableCell>
      <TableCell className="w-[50px] sticky right-0">
        <Button size="sm" className="h-6 mt-auto" onClick={handleAddProduct}>
          <PlusCircleIcon className="h-4 w-4" />
          &nbsp; Add
        </Button>
      </TableCell>
    </TableRow>
  );
};

export const MenuItemListSkeleton = forwardRef(
  (_, ref: ForwardedRef<HTMLTableRowElement>) => {
    return (
      <TableRow ref={ref}>
        <TableCell className="h-12 w-12">
          <Skeleton className="h-12 w-12" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-auto" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-auto" />
        </TableCell>
        <TableCell className="w-[50px]">
          <Skeleton className="h-4 w-auto" />
        </TableCell>
      </TableRow>
    );
  },
);
