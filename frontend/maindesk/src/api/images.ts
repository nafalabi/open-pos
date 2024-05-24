import { apiSingleton } from "./api-singleton";

export const uploadImage = (image: File) => {
  const { requestor } = apiSingleton;
  const formData = new FormData()
  formData.append('file', image)
  return requestor.POST_formdata<string>('/images', formData);
}

