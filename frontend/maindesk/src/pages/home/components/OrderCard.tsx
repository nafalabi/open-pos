import { OrderStatus } from "@/generated/enums";
import { Model_Order } from "@/generated/models";
import { currency } from "@/maindesk/src/utils/currency";
import { Card } from "@/shared/components/ui/card";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import OrderStatusBadge from "./OrderStatusBadge";

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
          {format(new Date(orderData.updated_at), "dd/MM/yyyy HH:mm")}
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
