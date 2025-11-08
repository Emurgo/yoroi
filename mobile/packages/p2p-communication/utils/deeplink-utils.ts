/**
 * Deep Link Utilities for P2P Communication
 * Handles generation and parsing of deeplinks for peer connections
 */

export type P2PConnectionDeeplink = {
  readonly peerId: string
  readonly signalingUrl?: string
}

/**
 * Generate a deeplink for P2P connection
 * Format: wallet://connect?peerId=xyz&signalingUrl=wss://...
 *
 * @param params Connection parameters
 * @returns Deep link URL string
 */
export const generateP2PDeeplink = (params: P2PConnectionDeeplink): string => {
  const url = new URL('wallet://connect')
  url.searchParams.set('peerId', params.peerId)

  if (params.signalingUrl) {
    url.searchParams.set('signalingUrl', params.signalingUrl)
  }

  return url.toString()
}

/**
 * Parse a P2P connection deeplink
 * Supports both wallet://connect and web+cardano://connect formats
 *
 * @param deeplink Deep link URL string
 * @returns Parsed connection parameters or null if invalid
 */
export const parseP2PDeeplink = (
  deeplink: string,
): P2PConnectionDeeplink | null => {
  try {
    const url = new URL(deeplink)

    // Support both wallet:// and web+cardano:// schemes
    const isWalletScheme = url.protocol === 'wallet:'
    const isCardanoScheme =
      url.protocol === 'web+cardano:' && url.hostname === 'connect'

    if (!isWalletScheme && !isCardanoScheme) {
      return null
    }

    // For web+cardano://connect, check path is /v1
    if (isCardanoScheme && !url.pathname.startsWith('/v1')) {
      return null
    }

    const peerId = url.searchParams.get('peerId')
    if (!peerId) {
      return null
    }

    const signalingUrl = url.searchParams.get('signalingUrl') || undefined

    return {
      peerId,
      signalingUrl,
    }
  } catch (error) {
    return null
  }
}

/**
 * Generate a CIP-158 compatible deeplink for P2P connection
 * Format: web+cardano://connect/v1?peerId=xyz&signalingUrl=wss://...
 *
 * @param params Connection parameters
 * @returns CIP-158 compatible deep link URL string
 */
export const generateCIP158P2PDeeplink = (
  params: P2PConnectionDeeplink,
): string => {
  const url = new URL('web+cardano://connect/v1')
  url.searchParams.set('peerId', params.peerId)

  if (params.signalingUrl) {
    url.searchParams.set('signalingUrl', params.signalingUrl)
  }

  return url.toString()
}
