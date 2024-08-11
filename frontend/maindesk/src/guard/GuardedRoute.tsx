import React, { useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { getAuthToken } from "../api/auth";
import { LiveNotifierContext } from "../hooks/useLiveNotifier";
import { throttle } from "../utils/function-utils";
import LiveNotifier from "../websocket/live-notifier";
import { useAuthState } from "./AuthProvider";
import SpinnerBox from "../layout/spinner-box";

type GuardedRouteProps = {
  children: React.ReactNode;
};

const throttleConnect = throttle((ln: LiveNotifier) => {
  const { disconnect } = ln.connect();
  return throttle(disconnect, 2000);
}, 2000);

export const GuardedRoute = ({ children }: GuardedRouteProps) => {
  const { isLogged, isLoading } = useAuthState();
  const authToken = getAuthToken();
  const { liveNotifier } = useContext(LiveNotifierContext);

  useEffect(() => {
    let clearFunc = () => { };
    if (isLogged) {
      clearFunc = throttleConnect(liveNotifier) ?? clearFunc;
    }
    return clearFunc;
  }, [liveNotifier, isLogged]);

  if (!authToken) {
    return <Navigate to="/login" replace={true} />;
  }

  if (isLoading && !isLogged) {
    return <SpinnerBox />;
  }

  if (!isLogged) {
    return <Navigate to="/login" replace={true} />;
  }

  return children;
};
