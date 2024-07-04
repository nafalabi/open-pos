import React, { useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { getAuthToken } from "../api/auth";
import { LiveNotifierContext } from "../hooks/useLiveNotifier";
import { throttle } from "../utils/function-utils";
import LiveNotifier from "../websocket/live-notifier";

type GuardedRouteProps = {
  children: React.ReactNode;
};

const throttleConnect = throttle((ln: LiveNotifier) => {
  ln.connect();
}, 500);

export const GuardedRoute = ({ children }: GuardedRouteProps) => {
  const authToken = getAuthToken();
  const { liveNotifier } = useContext(LiveNotifierContext);

  useEffect(() => {
    throttleConnect(liveNotifier);
  }, [liveNotifier]);

  if (!authToken) {
    return <Navigate to="/login" replace={true} />;
  }

  return children;
};
