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
  ln.connect();
}, 500);

export const GuardedRoute = ({ children }: GuardedRouteProps) => {
  const { isLogged, isLoading } = useAuthState();
  const authToken = getAuthToken();
  const { liveNotifier } = useContext(LiveNotifierContext);

  useEffect(() => {
    if (isLogged) throttleConnect(liveNotifier);
  }, [liveNotifier, isLogged]);

  if (!authToken) {
    return <Navigate to="/login" replace={true} />;
  }

  if (isLoading) {
    return <SpinnerBox />;
  }

  if (!isLogged) {
    return <Navigate to="/login" replace={true} />;
  }

  return children;
};
