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

const HomePage = () => {
  const outlet = useOutlet();
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap items-start md:flex-nowrap gap-6 w-full md:ml-2">
      <div className="min-w-[275px] w-auto">
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
            <Button
              size="icon"
              className="fixed bottom-0 right-0 rounded-full aspect-square h-12 w-12 mb-8 mr-8 shadow-md"
              onClick={() => navigate("/home/add-order")}
            >
              <ShoppingBasketIcon className="h-8 w-8" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add Order</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};

export default HomePage;
