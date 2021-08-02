export const imgSrc = (src: string, type = "svg"): string =>
  // eslint-disable-next-line import/no-dynamic-require
  require(`@/assets/${src}.${type}`) as string;
