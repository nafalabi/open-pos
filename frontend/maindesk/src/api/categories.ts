import { Category, CategoryFillable } from "@/generated/schema";
import { apiSingleton } from "./api-singleton";
import { PaginationParams } from "./types";

export const getCategories = async (params: PaginationParams & { q: string }) => {
  const { requestor } = apiSingleton;
  return requestor.GET<Category[]>("/categories", params);
};

export const postCategory = async (params: CategoryFillable) => {
  const {requestor} = apiSingleton;
  return requestor.POST<Category>("/categories", params);
}
