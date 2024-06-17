import { OrderStatus } from "@/generated/enums";
import { Model_Order } from "@/generated/models";
import { OrderStatusBadge } from "../components/OrderCard";
import { format } from "date-fns";
import { useState } from "react";
import { currency } from "@/maindesk/src/utils/currency";
import { Button } from "@/shared/components/ui/button";

const SummaryOrder = ({ order }: { order: Model_Order }) => {
  return (
    <>
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

      <ItemsList items={order.items} />

      <div className="px-2 grid gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm">Subtotal</div>
          <div className="text-sm">{currency(order.sub_total)}</div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm">Payment Fee</div>
          <div className="text-sm">{currency(order.payment_fee)}</div>
        </div>
        <div className="flex items-center justify-between gap-2 font-bold">
          <div className="text-sm">Total Payment</div>
          <div className="text-sm">{currency(order.total)}</div>
        </div>
      </div>
    </>
  );
};

export default SummaryOrder;

const ItemsList = ({ items }: { items: Model_Order["items"] }) => {
  const count = items.length;
  const isTruncated = count > 3;
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="my-2">
      <div className="border border-muted rounded-xl text-sm overflow-clip">
        <div className="flex items-center justify-between px-3 py-2 bg-muted text-muted-foreground">
          <div>Item</div>
          <div>Amount</div>
        </div>
        <div className="overflow-hidden overflow-y-auto max-h-[200px]">
          {(expanded ? items : items.slice(0, 3)).map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between px-3 py-2 border-b border-muted gap-2"
            >
              <div className="overflow-hidden text-ellipsis line-clamp-1">
                <span className="ml-1 font-semibold">{item.quantity}</span>{" "}
                x&nbsp;
                {item.product?.name}
              </div>
              <div>{currency(item.total)}</div>
            </div>
          ))}
        </div>
      </div>
      {isTruncated && (
        <div
          className="flex justify-center border-muted mt-2"
          onClick={() => setExpanded(!expanded)}
        >
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-6"
            type="button"
          >
            {expanded ? "Less" : "More"}
          </Button>
        </div>
      )}
    </div>
  );
};
