import { Model_Order } from "@/generated/models";
import { apiSingleton } from "./api-singleton";

export type OrderReportsMeta = {
  total_orders: number;
  unique_customers: number;
  total_revenue: number;
  top_product: string;
  orders: Model_Order[];
};

export const getOrderReportsMeta = async (payload: {
  datestart: string;
  dateend: string;
}) => {
  const { requestor } = apiSingleton;
  return await requestor.GET<OrderReportsMeta>("/reports", {
    ...payload,
    entity: "order",
    output: "meta",
  });
};
