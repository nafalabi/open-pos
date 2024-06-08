import { Model_Product } from "@/generated/models";
import { currency } from "@/maindesk/src/utils/currency";
import { Button } from "@/shared/components/ui/button";
import { PlusCircleIcon } from "lucide-react";

type MenuItemProps = {
  menuData: Model_Product;
};

const MenuItem = ({ menuData: product }: MenuItemProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md">
      <img
        src={product.image}
        onError={(e) => {
          e.currentTarget.src = "/placeholder.svg";
        }}
        width={300}
        height={200}
        className="rounded-t-lg object-cover w-full h-48"
      />
      <div className="p-4">
        <h3 className="text-lg font-bold">{product.name}</h3>
        <p className="text-gray-500 mb-4">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-gray-900 font-bold">
            {currency(product.price)}
          </span>
          <Button size="sm" className="h-6 mt-auto" onClick={() => {}}>
            <PlusCircleIcon className="h-4 w-4" />
            &nbsp; Add
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MenuItem;
