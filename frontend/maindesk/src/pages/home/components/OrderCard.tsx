import { OrderStatus } from "@/generated/enums";
import { Model_Order } from "@/generated/models";
import { currency } from "@/maindesk/src/utils/currency";
import { Badge } from "@/shared/components/ui/badge";
import { Card } from "@/shared/components/ui/card";
import { format } from "date-fns";

type OrderCardProps = {
  orderData: Model_Order;
};

const OrderCard = ({ orderData }: OrderCardProps) => {
  return (
    <Card className="w-[280px] px-4 py-4">
      <div className="flex mb-2">
        <div className="mr-auto">
          {format(new Date(orderData.updated_at), "dd/MM/yyyy HH:mm")}
        </div>
        <OrderStatusBadge status={orderData.status as OrderStatus} />
      </div>
      <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
        {orderData.recipient}
      </h4>
      <div className="flex mt-2">
        <p className="text-sm text-muted-foreground">
          {orderData.items.length} items
        </p>
        <p className="ml-auto text-sm">{currency(orderData.total)}</p>
      </div>
    </Card>
  );
};
export default OrderCard;

const orderStatusVariant = {
  [OrderStatus.StatusPaid]: "default",
  [OrderStatus.StatusCanceled]: "destructive",
  [OrderStatus.StatusPending]: "secondary",
} as const;
const orderStatusText = {
  [OrderStatus.StatusPaid]: "Paid",
  [OrderStatus.StatusCanceled]: "Canceled",
  [OrderStatus.StatusPending]: "Pending",
} as const;

export const OrderStatusBadge = ({ status }: { status: OrderStatus }) => {
  const variant = orderStatusVariant[status] ?? "secondary";
  const text = orderStatusText[status] ?? "Pending";
  return <Badge variant={variant}>{text}</Badge>;
};
