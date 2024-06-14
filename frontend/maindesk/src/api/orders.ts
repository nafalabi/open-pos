import { Model_Order } from "@/generated/models";
import { apiSingleton } from "./api-singleton";
import { PaginationParams, SortParams } from "./types";
import { OrderPayload } from "@/generated/schema";

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
  return await requestor.POST<Model_Order, typeof payload>("/orders", payload);
};

export const patchOrder = async (orderId: string, payload: OrderPayload) => {
  const { requestor } = apiSingleton;
  return await requestor.PATCH("/orders/" + orderId, payload);
};

export const deleteOrder = async (orderId: string) => {
  const { requestor } = apiSingleton;
  return await requestor.DELETE("/orders/" + orderId);
};
