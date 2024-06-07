/* eslint-disable react-refresh/only-export-components */
import { ComponentProps, lazy } from "react";
import { Outlet, createBrowserRouter, redirect } from "react-router-dom";

import LoginPage from "./pages/login/LoginPage";
import LoadingPage from "./layout/LoadingPage.tsx";
import LazyLoader from "./layout/lazy-loader";
import { GuardedRoute } from "./guard/GuardedRoute";
import PageNotFound from "./pages/404-not-found/PageNotFound.tsx";

const BaseLayout = lazy(() => import("./layout/base.tsx"));
const DashboardPage = lazy(() => import("./pages/dashboard/DashboardPage.tsx"));
const NewOrderPanel = lazy(() => import("./pages/dashboard/NewOrderPanel.tsx"));
const ProductsPage = lazy(() => import("./pages/products/ProductsPage.tsx"));
const ProductCreatePage = lazy(
  () => import("./pages/products/ProductCreatePage.tsx")
);
const ProductEditPage = lazy(
  () => import("./pages/products/ProductEditPage.tsx")
);
const CategoriesPage = lazy(
  () => import("./pages/categories/CategoriesPage.tsx")
);
const OrdersPage = lazy(() => import("./pages/order/OrdersPage.tsx"));

const Layout = ({ children }: ComponentProps<typeof BaseLayout>) => (
  <GuardedRoute>
    <LazyLoader
      fallback={<LoadingPage />}
      component={<BaseLayout>{children}</BaseLayout>}
    />
  </GuardedRoute>
);

export const router = createBrowserRouter([
  {
    id: "Login",
    path: "/login",
    element: <LoginPage />,
  },
  {
    handle: { crumb: () => "Dashboard" },
    id: "Root",
    path: "/",
    errorElement: <Layout children={<PageNotFound />} />,
    element: <Layout children={<Outlet />} />,
    children: [
      { index: true, loader: () => redirect("/home") },
      {
        handle: { crumb: () => "Home" },
        path: "home",
        id: "Home",
        element: (
          <LazyLoader
            fallback={<LoadingPage />}
            component={<DashboardPage />}
          />
        ),
        children: [
          {
            path: "add-order",
            element: (
              <LazyLoader
                fallback={<LoadingPage />}
                component={<NewOrderPanel />}
              />
            ),
          },
        ],
      },
      {
        handle: { crumb: () => "Products" },
        path: "products",
        id: "Products",
        children: [
          {
            handle: { crumb: () => "All Products" },
            index: true,
            id: "All Products",
            element: (
              <LazyLoader
                fallback={<LoadingPage />}
                component={<ProductsPage />}
              />
            ),
          },
          {
            handle: { crumb: () => "Create Product" },
            path: "add",
            id: "Create Product",
            element: (
              <LazyLoader
                fallback={<LoadingPage />}
                component={<ProductCreatePage />}
              />
            ),
          },
          {
            handle: { crumb: () => "Edit Product" },
            path: "edit/:productId",
            id: "Edit Product",
            element: (
              <LazyLoader
                fallback={<LoadingPage />}
                component={<ProductEditPage />}
              />
            ),
          },
          {
            handle: { crumb: () => "Categories" },
            path: "categories",
            id: "Categories",
            element: (
              <LazyLoader
                fallback={<LoadingPage />}
                component={<CategoriesPage />}
              />
            ),
          },
        ],
      },
      {
        handle: { crumb: () => "Orders" },
        id: "Orders",
        path: "orders",
        element: (
          <LazyLoader fallback={<LoadingPage />} component={<OrdersPage />} />
        ),
      },
    ],
  },
]);
