import { viewOrder } from "@/maindesk/src/api/orders";
import { useQuery } from "@tanstack/react-query";

export const useQueryOrderById = (orderId?: string) => {
  return useQuery({
    initialData: false,
    queryKey: ["order", orderId],
    queryFn: async () => {
      if (!orderId) return false;
      const [result] = await viewOrder(orderId, {
        includeProducts: String(true),
      });
      if (!result) return false;
      return result.data;
    },
  });
};
