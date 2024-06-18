import { OrderStatus } from "@/generated/enums";
import { Badge } from "@/shared/components/ui/badge";

const orderStatusText = {
  [OrderStatus.StatusPaid]: "Paid",
  [OrderStatus.StatusCanceled]: "Canceled",
  [OrderStatus.StatusPending]: "Pending",
  [OrderStatus.StatusCompleted]: "Completed",
} as const;
const orderStatusClassNames = {
  [OrderStatus.StatusPaid]:
    "bg-green-500 text-white hover:bg-green-500/80 hover:text-white",
  [OrderStatus.StatusCanceled]:
    "bg-red-500 text-white hover:bg-red-500/80 hover:text-white",
  [OrderStatus.StatusPending]:
    "bg-yellow-500 text-white hover:bg-yellow-500/80 hover:text-white",
  [OrderStatus.StatusCompleted]:
    "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:text-secondary-foreground",
} as const;

export const OrderStatusBadge = ({ status }: { status: OrderStatus }) => {
  const text = orderStatusText[status] ?? "Pending";
  const className = orderStatusClassNames[status] ?? "";
  return <Badge className={className}>{text}</Badge>;
};

export default OrderStatusBadge;
