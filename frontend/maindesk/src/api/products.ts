import { apiSingleton } from "./api-singleton";
import { type Product } from "@/generated/schema";
import { PaginationParams } from "./types";

export const getProducts = async (payload: PaginationParams) => {
  const { requestor } = apiSingleton;
  return await requestor.GET<Product[]>("/products", payload);
}
