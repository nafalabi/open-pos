import { Model_User } from "@/generated/models";
import { createContext, useContext, useCallback } from "react";
import { getUserInfo } from "../api/auth";
import { apiSingleton } from "../api/api-singleton";
import { useQuery } from "@tanstack/react-query";

export type AuthState = {
  userInfo?: Model_User | null;
  authToken?: string;
  isLogged: boolean;
  isLoading: boolean;
  handleUpdateAuthToken: (accessToken: string, refreshToken: string) => void;
  handleResetAuthToken: () => void;
};

export const AuthContext = createContext({} as AuthState);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { authToken } = apiSingleton;

  const { data: userInfo, isFetching: isLoading } = useQuery({
    queryKey: ["userInfo", authToken],
    queryFn: async () => {
      if (!authToken) {
        return null;
      }
      const [result, error] = await getUserInfo();
      if (error) {
        return null;
      }
      return result.data;
    },
  });

  const isLogged = !!(userInfo);

  const handleResetAuthToken = useCallback(() => {
    apiSingleton.setToken("", "");
    location.replace("/login");
  }, []);

  const handleUpdateAuthToken = useCallback(
    (accessToken: string, refreshToken: string) => {
      apiSingleton.setToken(accessToken, refreshToken);
      location.replace("/");
    },
    [],
  );

  return (
    <AuthContext.Provider
      value={{
        userInfo,
        authToken,
        isLoading,
        isLogged,
        handleResetAuthToken,
        handleUpdateAuthToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthState = () => {
  const authState = useContext(AuthContext);
  return authState;
};
