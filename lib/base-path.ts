// next/image does not prefix unoptimized local image `src` strings with
// `basePath` under static export, so any hardcoded "/img/..." path needs
// this to resolve correctly on a GitHub Pages project page.
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function withBasePath(path: string): string {
  return `${basePath}${path}`;
}
