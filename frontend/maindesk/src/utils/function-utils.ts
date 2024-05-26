export const debounce = <F extends (...args: Parameters<F>) => ReturnType<F>>(
  fn: F,
  delay: number,
) => {
  let timeout: ReturnType<typeof setTimeout>;
  return function(...args: Parameters<F>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

export const throttle = <R, A extends unknown[]>(
  fn: (...args: A) => R,
  delay: number,
) => {
  let wait = false;
  let timeout: ReturnType<typeof setTimeout>;
  return function(...args: A) {
    if (wait) return undefined;

    const val = fn(...args);

    wait = true;

    timeout = setTimeout(() => {
      clearTimeout(timeout)
      wait = false;
    }, delay);

    return val;
  };
};
