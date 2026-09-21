export const publicAsset = (filename: string): string =>
  `${import.meta.env.BASE_URL}${filename}`;
