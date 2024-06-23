import { getPaymentMethodDetail } from "@/maindesk/src/api/payment-method";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const useQueryPaymentMethodDetail = (
  paymentMethodCode: string | undefined,
) => {
  return useQuery({
    queryKey: ["payment-methods", paymentMethodCode ?? ""],
    queryFn: async () => {
      if (!paymentMethodCode) {
        return null;
      }
      const [result, error] = await getPaymentMethodDetail(paymentMethodCode);
      if (error) {
        toast.error("Failed to get payment fee");
        return null;
      }
      return result.data;
    },
    placeholderData: keepPreviousData,
  });
};
