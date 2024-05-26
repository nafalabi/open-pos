import { apiSingleton } from "./api-singleton";
import { type ProductFillable, type Product } from "@/generated/schema";
import { PaginationParams } from "./types";

export const getProducts = async (
  payload: PaginationParams & { q?: string },
) => {
  const { requestor } = apiSingleton;
  return await requestor.GET<Product[]>("/products", payload);
};

export const postProduct = async (payload: ProductFillable) => {
  const { requestor } = apiSingleton;
  return await requestor.POST("/products", payload);
};

export const deleteProduct = async (productId: string) => {
  const { requestor } = apiSingleton;
  return await requestor.DELETE("/products/" + productId);
};
