import { OrderStatus } from "@/generated/enums";
import { Model_Order } from "@/generated/models";
import { currency } from "@/maindesk/src/utils/currency";
import { Card } from "@/shared/components/ui/card";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import OrderStatusBadge from "./OrderStatusBadge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { ForwardedRef, forwardRef } from "react";

type OrderCardProps = {
  orderData: Model_Order;
};

const OrderCard = ({ orderData }: OrderCardProps) => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate("/home/detail/" + orderData.id);
  };
  return (
    <Card className="w-[280px] px-4 py-4 cursor-pointer" onClick={handleClick}>
      <div className="flex mb-2">
        <div className="mr-auto">
          {format(new Date(orderData.created_at), "dd/MM/yyyy HH:mm")}
        </div>
        <OrderStatusBadge status={orderData.status as OrderStatus} />
      </div>
      <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
        {orderData.recipient || "-"}
      </h4>
      <div className="flex mt-2">
        <p className="text-sm text-muted-foreground">
          {orderData.items.length} item(s)
        </p>
        <p className="ml-auto text-sm">{currency(orderData.total)}</p>
      </div>
    </Card>
  );
};
export default OrderCard;

export const SkeletonOrderCard = forwardRef(
  (_, ref: ForwardedRef<HTMLDivElement>) => {
    return (
      <Card className="w-[280px] px-4 py-4 cursor-pointer" ref={ref}>
        <div className="flex mb-5">
          <div className="mr-auto">
            <Skeleton className="h-4 w-[120px]" />
          </div>
          <Skeleton className="h-4 w-[50px]" />
        </div>
        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
          <Skeleton className="h-4 w-[80px]" />
        </h4>
        <div className="flex mt-5">
          <Skeleton className="h-4 w-full" />
        </div>
      </Card>
    );
  },
);
