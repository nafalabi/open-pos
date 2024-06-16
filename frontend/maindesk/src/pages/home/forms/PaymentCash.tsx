import { Model_Order } from "@/generated/models";
import { format } from "date-fns";
import { OrderStatusBadge } from "../components/OrderCard";
import { OrderStatus } from "@/generated/enums";
import { currency } from "@/maindesk/src/utils/currency";
import { Button } from "@/shared/components/ui/button";
import { useEffect, useState } from "react";
import { Input } from "@/shared/components/ui/input";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { paycashOrder } from "@/maindesk/src/api/orders";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

type PaymentCashProps = {
  order: Model_Order;
};

const defaultValues = {
  expectedAmount: 0,
  inputAmount: 0,
  tip: 0,
  notes: "",
};

const validatorSchema = z
  .object({
    expectedAmount: z.number().nonnegative("Payment amount can't be negative"),
    inputAmount: z.number().nonnegative("Input amount can't be negative"),
    tip: z.number().nonnegative("Tip can't be negative"),
    notes: z.string(),
  })
  .refine(
    (schema) => {
      return schema.inputAmount - schema.tip >= schema.expectedAmount;
    },
    { message: "Payment amount was not met", path: ["inputAmount"] },
  );

const PaymentCash = ({ order }: PaymentCashProps) => {
  const queryClient = useQueryClient()

  const form = useForm({
    defaultValues,
    resolver: zodResolver(validatorSchema),
    mode: "onChange",
    delayError: 500,
  });

  useEffect(() => {
    form.setValue("expectedAmount", order.total, {
      shouldTouch: false,
      shouldValidate: false,
    });
  }, [order.total, form]);

  const handleSubmit = form.handleSubmit(
    async (values) => {
      const [, error] = await paycashOrder(order.id, {
        tip_amount: values.tip,
        input_amount: values.inputAmount,
        notes: "",
      });
      if (error) {
        toast.error("Error paying order", { description: error.message });
        return;
      }
      toast("success, todo: remove this line");
      queryClient.invalidateQueries({queryKey: ['orders']})
    },
    (errors) => {
      console.log("trace errors", errors);
    },
  );

  return (
    <form onSubmit={handleSubmit}>
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

        <div className="grid gap-2 text-xs border border-input rounded-md pt-3 px-3 pb-4 mt-4">
          {form.formState.errors.inputAmount && (
            <div className="text-red-500 text-center">
              {form.formState.errors.inputAmount.message}
            </div>
          )}
          <div className="flex gap-2 items-center">
            <div className="mr-auto font-normal">Input Amount</div>
            <div className="">
              <Input
                type="number"
                className="max-w-[150px] h-[25px]"
                {...form.register("inputAmount", { valueAsNumber: true })}
                isError={!form.formState.isValid}
                autoFocus
              />
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <div className="mr-auto font-normal">Tip</div>
            <div className="">
              <Input
                type="number"
                className="max-w-[150px] h-[25px]"
                {...form.register("tip", { valueAsNumber: true })}
                isError={!form.formState.isValid}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-1">
            <div className="mr-auto">Change</div>
            <div className="font-bold text-sm">
              <Controller
                control={form.control}
                name="expectedAmount"
                render={({ field }) => {
                  const expectedAmount = Number(field.value) || 0;
                  const inputAmount = Number(form.watch("inputAmount")) || 0;
                  const tip = Number(form.watch("tip")) || 0;
                  const change = inputAmount - tip - expectedAmount;
                  return <>{currency(change)}</>;
                }}
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Button
            size="sm"
            className="w-full"
            disabled={
              form.formState.isSubmitting ||
              (!form.formState.isValid &&
                form.formState.touchedFields.inputAmount)
            }
          >
            {form.formState.isSubmitting && (
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            )}
            Process
          </Button>
        </div>
      </div>
    </form>
  );
};

export default PaymentCash;

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
