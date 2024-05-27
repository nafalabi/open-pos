/* eslint-disable react-refresh/only-export-components */
import { ComponentProps, lazy } from "react";
import { Outlet, createBrowserRouter } from "react-router-dom";

import LoginPage from "./pages/login/LoginPage";
import LoadingPage from "./layout/LoadingPage.tsx";
import LazyLoader from "./layout/lazy-loader";
import { GuardedRoute } from "./guard/GuardedRoute";
import PageNotFound from "./pages/404-not-found/PageNotFound.tsx";

const DashboardPage = lazy(() => import("./pages/dashboard/DashboardPage.tsx"));
const BaseLayout = lazy(() => import("./layout/base.tsx"));
const CategoriesPage = lazy(
  () => import("./pages/categories/CategoriesPage.tsx")
);
const ProductsPage = lazy(() => import("./pages/products/ProductsPage.tsx"));
const ProductCreatePage = lazy(
  () => import("./pages/products/ProductCreatePage.tsx")
);
const ProductEditPage = lazy(
  () => import("./pages/products/ProductEditPage.tsx")
);

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
    id: "Home",
    path: "/",
    errorElement: (
      <Layout>
        <PageNotFound />
      </Layout>
    ),
    element: (
      <Layout>
        <Outlet />
      </Layout>
    ),
    children: [
      {
        index: true,
        id: "Dashboard",
        element: (
          <LazyLoader
            fallback={<LoadingPage />}
            component={<DashboardPage />}
          />
        ),
      },
      {
        path: "products",
        id: "Products",
        children: [
          {
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
    ],
  },
]);
