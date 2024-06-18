import { Model_Order } from "@/generated/models";
import { apiSingleton } from "./api-singleton";
import { PaginationParams, SortParams } from "./types";
import { OrderPayload, PayOrderCashPayload } from "@/generated/schema";

export const getOrders = async (
  payload: PaginationParams & SortParams & { q?: string }
) => {
  const { requestor } = apiSingleton;
  return await requestor.GET<Model_Order[]>("/orders", payload);
};

export const viewOrder = async (
  orderId: string,
  params?: { includeProducts?: string }
) => {
  const { requestor } = apiSingleton;
  return await requestor.GET<Model_Order>("/orders/" + orderId, params);
};

export const postOrder = async (payload: OrderPayload) => {
  const { requestor } = apiSingleton;
  return await requestor.POST<Model_Order>("/orders", payload);
};

export const paycashOrder = async (orderId: string, payload: PayOrderCashPayload) => {
  const { requestor } = apiSingleton;
  return await requestor.POST(`/orders/${orderId}/cashpay`, payload);
}

export const completeOrder = async (orderId: string) => {
  const { requestor } = apiSingleton;
  return await requestor.POST(`/orders/${orderId}/complete`, {});
}
