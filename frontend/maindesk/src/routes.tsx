/* eslint-disable react-refresh/only-export-components */
import { ComponentProps, lazy } from "react";
import { Outlet, createBrowserRouter, redirect } from "react-router-dom";

import LoginPage from "./pages/login/LoginPage";
import SpinnerBox from "./layout/spinner-box.tsx";
import LazyLoader from "./layout/lazy-loader";
import { GuardedRoute } from "./guard/GuardedRoute";
import PageNotFound from "./pages/404-not-found/PageNotFound.tsx";
import { HomeIcon } from "lucide-react";

const BaseLayout = lazy(() => import("./layout/base.tsx"));
const Homepage = lazy(() => import("./pages/home/Homepage.tsx"));
const CreateOrderPanel = lazy(() => import("./pages/home/order-panel/CreateOrderPanel.tsx"));
const ViewOrderPanel = lazy(() => import("./pages/home/order-panel/ViewOrderPanel.tsx"));
const CheckoutPanel = lazy(() => import("./pages/home/order-panel/CheckoutPanel.tsx"));
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
      fallback={<SpinnerBox />}
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
    handle: { crumb: () => <HomeIcon className="h-4 w-4" /> },
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
            fallback={<SpinnerBox />}
            component={<Homepage />}
          />
        ),
        children: [
          {
            path: "add-order",
            element: (
              <LazyLoader
                fallback={<SpinnerBox />}
                component={<CreateOrderPanel />}
              />
            ),
          },
          {
            path: "detail/:id",
            element: (
              <LazyLoader
                fallback={<SpinnerBox />}
                component={<ViewOrderPanel />}
              />
            )
          },
          {
            path: "checkout/:id",
            element: (
              <LazyLoader
                fallback={<SpinnerBox />}
                component={<CheckoutPanel />}
              />
            )
          }
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
                fallback={<SpinnerBox />}
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
                fallback={<SpinnerBox />}
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
                fallback={<SpinnerBox />}
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
                fallback={<SpinnerBox />}
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
          <LazyLoader fallback={<SpinnerBox />} component={<OrdersPage />} />
        ),
      },
    ],
  },
]);
