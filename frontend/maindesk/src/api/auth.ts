import { Model_User } from "@/generated/models";
import { apiSingleton } from "./api-singleton";

export const getAuthToken = () => {
  const { authToken } = apiSingleton;
  return authToken;
};

export const getUserInfo = async () => {
  const { requestor } = apiSingleton;
  const [, UserData] = await requestor.GET<Model_User>("/auth/userinfo");
  return UserData;
};

export const doLogin = async (payload: { email: string; password: string }) => {
  const { requestor } = apiSingleton;
  const [, result] = await requestor.POST("/auth/login", payload);
  return (result as { data: object }).data as {
    access_token: string;
    refresh_token: string;
  };
};
