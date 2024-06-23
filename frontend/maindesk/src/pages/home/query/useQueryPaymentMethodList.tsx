import { getPaymentMethodList } from "@/maindesk/src/api/payment-method";
import { useQuery } from "@tanstack/react-query";

export const useQueryPaymentMethodList = () => {
  return useQuery({
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
};
