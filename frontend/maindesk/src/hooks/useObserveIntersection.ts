import React from "react";

export const useObserveIntersection = (
  ref: React.RefObject<HTMLElement>,
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
) => {
  React.useEffect(() => {
    const observer = new IntersectionObserver(callback, options);
    const target = ref.current;
    if (target) {
      observer.observe(target);
    }
    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [ref, callback, options]);
};
