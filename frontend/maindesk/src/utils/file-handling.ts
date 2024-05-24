export const urlToBlob = async (url: string) => {
  const result = await fetch(url);
  return await result.blob();
};
