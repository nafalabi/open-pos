import { Model_Order } from "@/generated/models";
import { apiSingleton } from "./api-singleton";
import { PaginationParams, SortParams } from "./types";
import { CompleteOrderPayload, OrderPayload } from "@/generated/schema";

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

export const completeOrder = async (orderId: string, payload: CompleteOrderPayload) => {
  const { requestor } = apiSingleton;
  return await requestor.POST(`/orders/${orderId}/complete`, payload);
}
