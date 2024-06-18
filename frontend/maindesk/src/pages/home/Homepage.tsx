import { Button } from "@/shared/components/ui/button";
import { ShoppingBasketIcon } from "lucide-react";
import { useNavigate, useOutlet } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import LatestOrders from "./components/LatestOrders";
import MenuList from "./components/MenuList";
import { CartStoreState, useCartStore } from "./state/cart";
import { Badge } from "@/shared/components/ui/badge";

const selectCartCount = (state: CartStoreState) => {
  return state.products.length;
};

const Homepage = () => {
  const outlet = useOutlet();
  const navigate = useNavigate();
  const cartCount = useCartStore(selectCartCount);

  return (
    <div className="flex flex-wrap items-start md:flex-nowrap gap-6 w-full md:ml-2">
      <div className="min-w-[275px] w-full">
        <LatestOrders />
        <MenuList />
      </div>
      {outlet && (
        <div className="min-w-[275px] lg:min-w-[350px] w-auto sticky bottom-0 md:sticky md:top-4">
          {outlet}
        </div>
      )}
      {!outlet && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="fixed bottom-0 right-0">
              <Button
                size="icon"
                className="relative rounded-full aspect-square h-12 w-12 mb-8 mr-8 shadow-md"
                onClick={() => navigate("/home/add-order")}
              >
                <ShoppingBasketIcon className="h-8 w-8" />
                {cartCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute top-[-5px] right-[-5px]"
                  >
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent>Add Order</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};

export default Homepage;
