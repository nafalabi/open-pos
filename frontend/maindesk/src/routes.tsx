import { createBrowserRouter } from "react-router-dom";
import LoginPage from "./pages/login/LoginPage";
import { GuardedRoute } from "./guard/GuardedRoute";
import DashboardPage from "./pages/dashboard/DashboardPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <GuardedRoute>
        <DashboardPage />
      </GuardedRoute>
    ),
  },
]);
