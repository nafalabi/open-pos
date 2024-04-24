import React from "react";
import { Navigate } from "react-router-dom";
import { getAuthToken } from "../api/auth";

type GuardedRouteProps = {
  children: React.ReactNode;
};

export const GuardedRoute = ({ children }: GuardedRouteProps) => {
  const authToken = getAuthToken();

  if (!authToken) {
    return <Navigate to="/login" replace={true} />;
  }

  return children;
};
