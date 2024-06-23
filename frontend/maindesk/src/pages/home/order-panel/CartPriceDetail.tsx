import { OrderPayload } from "@/generated/schema";
import { Separator } from "@/shared/components/ui/separator";
import { Controller, UseFormReturn } from "react-hook-form";
import { useCartStore } from "../state/cart";
import { useMemo } from "react";
import { currency } from "@/maindesk/src/utils/currency";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Input } from "@/shared/components/ui/input";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getPaymentFee,
  getPaymentMethodList,
} from "@/maindesk/src/api/payment-method";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

const CartPriceDetail = ({ form }: { form: UseFormReturn<OrderPayload> }) => {
  const paymentMethod = form.watch("payment_method");
  const { products } = useCartStore((state) => ({
    products: state.products,
    removeProduct: state.removeProduct,
  }));

  const { data: paymentMethodList } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: async () => {
      const [result, error] = await getPaymentMethodList();
      if (error) {
        return [];
      }
      return result.data;
    },
    initialData: [],
  });

  const subtotal = useMemo(() => {
    return products.reduce((sum, product) => sum + product.price, 0);
  }, [products]);

  const { data: paymentFee, isFetching: isFetchingPaymentFee } = useQuery({
    queryKey: ["payment-methods", paymentMethod, "fee", subtotal],
    queryFn: async () => {
      const [result, error] = await getPaymentFee(paymentMethod, {
        totalamount: String(subtotal),
      });
      if (error) {
        toast.error("Failed to get payment fee");
        return 0;
      }
      return result.data.payment_fee;
    },
    placeholderData: keepPreviousData,
  });
  const total = subtotal + (paymentFee ?? 0);

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
                  {paymentMethodList.map((item) => (
                    <SelectItem key={item.code} value={item.code}>
                      {item.name}
                    </SelectItem>
                  ))}
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
            {isFetchingPaymentFee && (
              <Loader2Icon className="inline h-4 w-4 animate-spin border-foreground" />
            )}
            &nbsp;{currency(paymentFee ?? 0)}
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
