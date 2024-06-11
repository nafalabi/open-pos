import { OrderPayload } from "@/generated/schema";
import { Separator } from "@/shared/components/ui/separator";
import { Controller, UseFormReturn } from "react-hook-form";
import { useOrderStore } from "../state/order";
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

type PriceDetailProps = {
  form: UseFormReturn<OrderPayload>;
};

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
    value: 0.7/100,
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

const PriceDetail = ({ form }: PriceDetailProps) => {
  const paymentMethod = form.watch("payment_method");
  const { products } = useOrderStore((state) => ({
    products: state.products,
    removeProduct: state.removeProduct,
  }));
  const { subtotal, paymentFee, tax, total } = useMemo(() => {
    const subtotal = products.reduce((sum, product) => sum + product.price, 0);
    const paymentFee = getPaymentFee(paymentMethod, subtotal);
    const tax = 0.08 * subtotal;
    const total = subtotal + paymentFee - tax;
    return {
      subtotal,
      paymentFee,
      tax,
      total,
    };
  }, [products, paymentMethod]);

  return (
    <>
      <Separator className="my-4" />
      <div className="grid gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-gray-900 font-bold">Payment Method</span>
          <Controller
            name="payment_method"
            control={form.control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="w-[100px]">
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
        <div className="flex items-center justify-between">
          <span className="text-gray-900 font-bold">Tax</span>
          <span className="text-gray-900 font-bold">{currency(tax)}</span>
        </div>
        <Separator className="my-4" />
        <div className="flex items-center justify-between">
          <span className="text-gray-900 font-bold">Total</span>
          <span className="text-gray-900 font-bold">{currency(total)}</span>
        </div>
      </div>
    </>
  );
};

export default PriceDetail;
