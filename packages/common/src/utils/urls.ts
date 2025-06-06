export function getBasePath(fullURL: string) {
  const url = new URL(fullURL)
  return url.origin + url.pathname
}
