/**
 * Deep Link Utilities for P2P Communication
 * Handles generation and parsing of deeplinks for peer connections
 */

export type P2PConnectionDeeplink = {
  readonly dappPeer: string
  readonly host?: string
  readonly port?: string
  readonly path?: string
  readonly secure?: boolean
}

/**
 * Convert signaling URL to host/port/path/secure format
 * @param signalingUrl WebSocket URL (e.g., wss://host:port/path)
 * @returns Parsed signaling server parameters
 */
export const parseSignalingUrl = (
  signalingUrl: string,
): {
  host: string
  port?: string
  path?: string
  secure: boolean
} => {
  try {
    const url = new URL(signalingUrl)
    return {
      host: url.hostname,
      port: url.port || undefined,
      path: url.pathname !== '/' ? url.pathname : undefined,
      secure: url.protocol === 'wss:' || url.protocol === 'https:',
    }
  } catch {
    // Fallback: treat as hostname only
    return {
      host: signalingUrl,
      secure: true,
    }
  }
}

/**
 * Convert host/port/path/secure format to signaling URL
 * @param params Signaling server parameters
 * @returns WebSocket URL string
 */
export const buildSignalingUrl = (params: {
  host: string
  port?: string
  path?: string
  secure?: boolean
}): string => {
  const protocol = params.secure !== false ? 'wss' : 'ws'
  const port = params.port ? `:${params.port}` : ''
  const path = params.path || ''
  return `${protocol}://${params.host}${port}${path}`
}

/**
 * Generate a deeplink for P2P connection
 * Format: wallet://connect?dappPeer=xyz&host=...&port=...&path=...&secure=true
 *
 * @param params Connection parameters
 * @returns Deep link URL string
 */
export const generateP2PDeeplink = (params: P2PConnectionDeeplink): string => {
  const url = new URL('wallet://connect')
  url.searchParams.set('dappPeer', params.dappPeer)

  if (params.host) {
    url.searchParams.set('host', params.host)
  }
  if (params.port) {
    url.searchParams.set('port', params.port)
  }
  if (params.path) {
    url.searchParams.set('path', params.path)
  }
  if (params.secure !== undefined) {
    url.searchParams.set('secure', String(params.secure))
  }

  return url.toString()
}

/**
 * Parse a P2P connection deeplink
 * Supports both wallet://connect and web+cardano://connect formats
 * Supports both new format (dappPeer, host, port, path, secure) and legacy format (peerId, signalingUrl)
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

    // Try new format first (dappPeer)
    const dappPeer = url.searchParams.get('dappPeer')
    // Fallback to legacy format (peerId)
    const peerId = dappPeer || url.searchParams.get('peerId')

    if (!peerId) {
      return null
    }

    // Try new format parameters
    const host = url.searchParams.get('host') || undefined
    const port = url.searchParams.get('port') || undefined
    const path = url.searchParams.get('path') || undefined
    const secureParam = url.searchParams.get('secure')
    const secure = secureParam !== null ? secureParam === 'true' : undefined

    // If new format is present, use it
    if (host) {
      return {
        dappPeer: peerId,
        host,
        port,
        path,
        secure,
      }
    }

    // Fallback to legacy format (signalingUrl)
    const signalingUrl = url.searchParams.get('signalingUrl')
    if (signalingUrl) {
      const parsed = parseSignalingUrl(signalingUrl)
      return {
        dappPeer: peerId,
        host: parsed.host,
        port: parsed.port,
        path: parsed.path,
        secure: parsed.secure,
      }
    }

    // No signaling server specified
    return {
      dappPeer: peerId,
    }
  } catch (error) {
    return null
  }
}

/**
 * Generate a CIP-158 compatible deeplink for P2P connection
 * Format: web+cardano://connect/v1?dappPeer=xyz&host=...&port=...&path=...&secure=true
 *
 * @param params Connection parameters
 * @returns CIP-158 compatible deep link URL string
 */
export const generateCIP158P2PDeeplink = (
  params: P2PConnectionDeeplink,
): string => {
  const url = new URL('web+cardano://connect/v1')
  url.searchParams.set('dappPeer', params.dappPeer)

  if (params.host) {
    url.searchParams.set('host', params.host)
  }
  if (params.port) {
    url.searchParams.set('port', params.port)
  }
  if (params.path) {
    url.searchParams.set('path', params.path)
  }
  if (params.secure !== undefined) {
    url.searchParams.set('secure', String(params.secure))
  }

  return url.toString()
}
