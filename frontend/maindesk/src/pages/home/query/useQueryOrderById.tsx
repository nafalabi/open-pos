import { viewOrder } from "@/maindesk/src/api/orders";
import { useQuery } from "@tanstack/react-query";

export const useQueryOrderById = (orderId?: string) => {
  return useQuery({
    queryKey: ["orders", orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const [result] = await viewOrder(orderId, {
        includeProducts: String(true),
      });
      if (!result) return null;
      return result.data;
    },
  });
};
