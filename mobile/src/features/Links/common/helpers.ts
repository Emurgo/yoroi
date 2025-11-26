/**
 * Helper function to check if a URL is a web+cardano:// link
 * Used to determine if we should parse it as a Cardano link instead of Yoroi link
 */
export const isWebCardanoLink = (url: string): boolean => {
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'web+cardano:'
  } catch {
    return false
  }
}
