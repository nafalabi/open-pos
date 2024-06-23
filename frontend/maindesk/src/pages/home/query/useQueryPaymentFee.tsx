import { getPaymentFee } from "@/maindesk/src/api/payment-method";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const useQueryPaymentFee = (
  paymentMethodCode: string,
  subtotal: number,
) => {
  return useQuery({
    queryKey: ["payment-methods", paymentMethodCode, "fee", subtotal],
    queryFn: async () => {
      const [result, error] = await getPaymentFee(paymentMethodCode, {
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
};
