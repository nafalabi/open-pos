import { Model_User } from "@/generated/models";
import { Requestor, apiSingleton } from "./api-singleton";

export type Tokens = {
  access_token: string;
  refresh_token: string;
};

export const getAuthToken = () => {
  const { authToken } = apiSingleton;
  return authToken;
};

export const getUserInfo = async () => {
  const { requestor } = apiSingleton;
  return await requestor.GET<Model_User>("/auth/userinfo");
};

export const doLogin = async (payload: { email: string; password: string }) => {
  const { requestor } = apiSingleton;
  return await requestor.POST<Tokens>("/auth/login", payload);
};

export const doRefreshToken = async (payload: { refresh_token: string }) => {
  const requestor = new Requestor((...args) => window.fetch(...args));
  return await requestor.POST<Tokens>("/auth/refresh", payload);
};
