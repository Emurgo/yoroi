export function getBasePath(fullURL: string) {
  const url = new URL(fullURL)
  return url.origin + url.pathname
}

/**
 * Constructs a URL string like `{url}/{path}`
 *
 * @param url - base url
 * @param path - url path
 */
export function joinUrl(url: string, path: string): string {
  const newUrl = new URL(url)

  const basePath = newUrl.pathname.replace(/\/$/, '')

  const sanitizedPath = path.startsWith('/') ? path.slice(1) : path

  newUrl.pathname = `${basePath}/${sanitizedPath}`

  return newUrl.href
}
