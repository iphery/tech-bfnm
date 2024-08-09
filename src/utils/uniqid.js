export const GetUniqueId = () => {
  const now = new Date();
  const timestamp = now.getTime();
  const microseconds = performance.now() % 1000;

  return `${timestamp}${Math.floor(microseconds * 1000)}`;
};
