import { Model_Order } from "@/generated/models";
import { OrderStatusBadge } from "../components/OrderCard";
import { OrderStatus } from "@/generated/enums";
import { format } from "date-fns";
import { CircleCheckBigIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

type PaymentPaidProps = {
  order: Model_Order;
};

const PaymentPaid = ({ order }: PaymentPaidProps) => {
  const handleComplete = () => { }
  return (
    <div className="grid gap-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col">
          <div className="text-sm text-muted-foreground">Recipient</div>
          <div className="text-sm font-bold">{order.recipient || "-"}</div>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-sm text-muted-foreground">
            {format(new Date(order.updated_at), "dd/MM/yyyy HH:mm")}
          </div>
          <div>
            <OrderStatusBadge status={order.status as OrderStatus} />
          </div>
        </div>
      </div>
      <div className="flex flex-col min-h-[200px] items-center justify-center bg-green-50 border-green-800 text-green-800 border rounded-lg p-2 mt-2">
        <div className="text-lg">Order is paid</div>
        <div className="mt-4 mb-4">
          <CircleCheckBigIcon className="h-10 w-10" />
        </div>
        <div className="text-md text-center">
          if the customer already received the order you can mark it as complete
        </div>
      </div>
      <Button className="mt-2" onClick={handleComplete}>Complete</Button>
    </div>
  );
};

export default PaymentPaid;
