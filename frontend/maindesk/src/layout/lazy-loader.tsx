import { Suspense, type SuspenseProps } from "react";

export type LazyLoaderProps = {
  component: SuspenseProps["children"];
  fallback: SuspenseProps["fallback"];
};

export const LazyLoader = ({ component, fallback }: LazyLoaderProps) => {
  return <Suspense fallback={fallback}>{component}</Suspense>;
};

export default LazyLoader;
