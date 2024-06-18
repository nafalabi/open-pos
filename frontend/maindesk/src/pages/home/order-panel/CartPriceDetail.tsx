import { OrderPayload } from "@/generated/schema";
import { Separator } from "@/shared/components/ui/separator";
import { Controller, UseFormReturn } from "react-hook-form";
import { useCartStore } from "../state/cart";
import { useMemo } from "react";
import { currency } from "@/maindesk/src/utils/currency";
import { PaymentMethod } from "@/generated/enums";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Input } from "@/shared/components/ui/input";

type PaymentFeeMapping = {
  type: "percentage" | "fixed";
  value: number;
};

const paymentFeeMapping: Record<string, PaymentFeeMapping | undefined> = {
  [PaymentMethod.PaymentMethodCash]: {
    type: "fixed",
    value: 0,
  },
  [PaymentMethod.PaymentMethodTransfer]: {
    type: "fixed",
    value: 4000,
  },
  [PaymentMethod.PaymentMethodQris]: {
    type: "percentage",
    value: 0.7 / 100,
  },
};

const getPaymentFee = (paymentMethod: string, subtotal: number) => {
  const mapping = paymentFeeMapping[paymentMethod];
  if (!mapping) return 0;
  const { type, value } = mapping;
  if (type === "percentage") {
    return subtotal * value;
  }
  return value;
};

const CartPriceDetail = ({ form }: { form: UseFormReturn<OrderPayload> }) => {
  const paymentMethod = form.watch("payment_method");
  const { products } = useCartStore((state) => ({
    products: state.products,
    removeProduct: state.removeProduct,
  }));
  const { subtotal, paymentFee, total } = useMemo(() => {
    const subtotal = products.reduce((sum, product) => sum + product.price, 0);
    const paymentFee = getPaymentFee(paymentMethod, subtotal);
    const total = subtotal + paymentFee;
    return {
      subtotal,
      paymentFee,
      total,
    };
  }, [products, paymentMethod]);

  return (
    <div className="text-sm">
      <Separator className="my-4" />
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-900 font-bold">Recipient</span>
          <span className="text-gray-900 font-bold">
            <Input
              {...form.register("recipient")}
              className="min-w-[130px] w-[150px] h-[25px]"
            />
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-900 font-bold">Remarks</span>
          <span className="text-gray-900 font-bold">
            <Input
              {...form.register("remarks")}
              className="min-w-[130px] w-[150px] h-[25px]"
            />
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-gray-900 font-bold">Payment Method</span>
          <Controller
            name="payment_method"
            control={form.control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="min-w-[130px] w-[150px] h-[25px]">
                  <SelectValue placeholder="Theme" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value={PaymentMethod.PaymentMethodCash}>
                    Cash
                  </SelectItem>
                  <SelectItem value={PaymentMethod.PaymentMethodTransfer}>
                    Transfer
                  </SelectItem>
                  <SelectItem value={PaymentMethod.PaymentMethodQris}>
                    QRIS
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-900 font-bold">Subtotal</span>
          <span className="text-gray-900 font-bold">{currency(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-900 font-bold">Payment Fee</span>
          <span className="text-gray-900 font-bold">
            {currency(paymentFee)}
          </span>
        </div>
        <Separator className="my-4" />
        <div className="flex items-center justify-between">
          <span className="text-gray-900 font-bold">Total</span>
          <span className="text-gray-900 font-bold">{currency(total)}</span>
        </div>
      </div>
    </div>
  );
};

export default CartPriceDetail;
