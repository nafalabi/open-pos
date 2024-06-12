import { type CategoryPayload } from "@/generated/schema";
import { apiSingleton } from "./api-singleton";
import { SortParams, type PaginationParams } from "./types";
import { type Model_Category } from "@/generated/models";

export const getCategories = async (
  params: PaginationParams & SortParams & Partial<{ q: string }>
) => {
  const { requestor } = apiSingleton;
  return requestor.GET<Model_Category[]>("/categories", params);
};

export const postCategory = async (params: CategoryPayload) => {
  const { requestor } = apiSingleton;
  return requestor.POST<Model_Category>("/categories", params);
};

export const deleteCategory = async (categoryId: string) => {
  const { requestor } = apiSingleton;
  return requestor.DELETE("/categories/" + categoryId);
};

export const patchCategory = async (
  categoryId: string,
  payload: CategoryPayload
) => {
  const { requestor } = apiSingleton;
  return requestor.PATCH("/categories/" + categoryId, payload);
};

export const viewCategory = async (categoryId: string) => {
  const { requestor } = apiSingleton;
  return requestor.GET<Model_Category>("/categories/" + categoryId);
};
