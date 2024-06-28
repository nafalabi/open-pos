import { OrderStatus } from "@/generated/enums";
import { Badge } from "@/shared/components/ui/badge";

const orderStatusText = {
  [OrderStatus.StatusPaid]: "Paid",
  [OrderStatus.StatusExpired]: "Expired",
  [OrderStatus.StatusCanceled]: "Canceled",
  [OrderStatus.StatusPending]: "Pending",
  [OrderStatus.StatusCompleted]: "Completed",
} as const;
const orderStatusClassNames = {
  [OrderStatus.StatusPaid]:
    "bg-green-500 text-white hover:bg-green-500/80 hover:text-white",
  [OrderStatus.StatusExpired]:
    "bg-red-300 text-white hover:bg-red-300/80 hover:text-white",
  [OrderStatus.StatusCanceled]:
    "bg-red-500 text-white hover:bg-red-500/80 hover:text-white",
  [OrderStatus.StatusPending]:
    "bg-yellow-500 text-white hover:bg-yellow-500/80 hover:text-white",
  [OrderStatus.StatusCompleted]:
    "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:text-secondary-foreground",
} as const;

export const OrderStatusBadge = ({ status }: { status: OrderStatus }) => {
  const text = orderStatusText[status] ?? "Unknown";
  const className =
    orderStatusClassNames[status] ??
    "bg-gray-600 text-gray-200 hover:bg-gray-600 hover:text-gray-200";
  return <Badge className={className}>{text}</Badge>;
};

export default OrderStatusBadge;
