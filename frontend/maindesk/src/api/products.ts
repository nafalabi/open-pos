import { apiSingleton } from "./api-singleton";
import { type ProductPayload } from "@/generated/schema";
import { type Model_Product } from "@/generated/models";
import { PaginationParams } from "./types";

export const getProducts = async (
  payload: PaginationParams & { q?: string }
) => {
  const { requestor } = apiSingleton;
  return await requestor.GET<Model_Product[]>("/products", payload);
};

export const postProduct = async (payload: ProductPayload) => {
  const { requestor } = apiSingleton;
  return await requestor.POST("/products", payload);
};

export const deleteProduct = async (productId: string) => {
  const { requestor } = apiSingleton;
  return await requestor.DELETE("/products/" + productId);
};

export const viewProduct = async (productId: string) => {
  const { requestor } = apiSingleton;
  return await requestor.GET<Model_Product>("/products/" + productId);
};

export const patchProduct = async (
  productId: string,
  payload: ProductPayload
) => {
  const { requestor } = apiSingleton;
  return await requestor.PATCH("/products/" + productId, payload);
};
