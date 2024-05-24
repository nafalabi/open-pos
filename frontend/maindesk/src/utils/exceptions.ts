export const exceptionCatcher = async <TReturn>(
  statementBlock: () => Promise<TReturn>,
): Promise<
  | readonly [returnvalue: Awaited<TReturn>, error: undefined]
  | readonly [returnvalue: undefined, error: Error]
> => {
  try {
    const returnValue = await statementBlock();
    return [returnValue, undefined];
  } catch (error) {
    return [undefined, error as Error];
  }
};
