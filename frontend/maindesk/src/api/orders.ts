import { Model_Order } from "@/generated/models";
import { apiSingleton } from "./api-singleton";
import { PaginationParams } from "./types";
import { OrderPayload } from "@/generated/schema";

export const getOrders = async (payload: PaginationParams & { q?: string }) => {
  const { requestor } = apiSingleton;
  return await requestor.GET<Model_Order[]>("/orders", payload);
};

export const getOrder = async (orderId: string) => {
  const { requestor } = apiSingleton;
  return await requestor.GET<Model_Order>("/orders/" + orderId);
};

export const postOrder = async (payload: OrderPayload) => {
  const { requestor } = apiSingleton;
  return await requestor.POST("/orders", payload);
};

export const patchOrder = async (orderId: string, payload: OrderPayload) => {
  const { requestor } = apiSingleton;
  return await requestor.PATCH("/orders/" + orderId, payload);
};

export const deleteOrder = async (orderId: string) => {
  const { requestor } = apiSingleton;
  return await requestor.DELETE("/orders/" + orderId);
};
