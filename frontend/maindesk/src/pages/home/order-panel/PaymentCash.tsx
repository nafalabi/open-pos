import { Model_Order } from "@/generated/models";
import { currency } from "@/maindesk/src/utils/currency";
import { Button } from "@/shared/components/ui/button";
import { useEffect } from "react";
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
  const queryClient = useQueryClient();

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
      toast.success("Pay Order Success");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    (errors) => {
      console.log("trace errors", errors);
    },
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <div className="grid gap-2 text-xs border border-input rounded-md pt-3 px-3 pb-4">
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
