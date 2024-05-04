import { Model_User } from "@/generated/models";
import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { getAuthToken, getUserInfo } from "../api/auth";
import { apiSingleton } from "../api/api-singleton";

export type AuthState = {
  userInfo?: Model_User;
  authToken?: string;
  isLogged: boolean;
  isLoading: boolean;
  handleUpdateAuthToken: (newToken: string) => void;
  handleResetAuthToken: () => void;
};

export const AuthContext = createContext({} as AuthState);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userInfo, setUserInfo] = useState<AuthState["userInfo"]>();
  const [authToken, setAuthToken] = useState<AuthState["authToken"]>();
  const [isLoading, setIsLoading] = useState<AuthState["isLoading"]>(true);
  const [isLogged, setIsLogged] = useState<AuthState["isLogged"]>(false);

  const handleResetAuthToken = useCallback(() => {
    setAuthToken("");
    apiSingleton.updateToken("");
    location.replace("/login");
  }, []);

  const handleUpdateAuthToken = useCallback((newToken: string) => {
    setAuthToken(newToken);
    apiSingleton.updateToken(newToken);
    location.replace("/");
  }, []);

  useEffect(() => {
    setIsLogged(!!authToken);
    setIsLoading(true);
    if (authToken) {
      getUserInfo().then(([respData, error]) => {
        if (error) {
          handleResetAuthToken();
          return;
        }
        if (respData) {
          setUserInfo(respData.data);
          setIsLoading(false);
        }
      });
    }
  }, [authToken, handleResetAuthToken]);

  useEffect(() => {
    const _authToken = getAuthToken();
    setAuthToken(_authToken);
  }, []);

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
