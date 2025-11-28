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
  // Use the provided path, or default to empty (PeerJS library handles path internally)
  // For direct WebSocket connections, PeerJS servers typically use /peerjs
  // But since we're building the URL ourselves, we'll use the provided path
  let path = params.path || ''

  // If path is '/' and it's a known PeerJS server, use /peerjs
  // PeerJS cloud (0.peerjs.com) uses /peerjs path
  if (path === '/' && isPeerJSServer(params.host)) {
    path = '/peerjs'
  }

  return `${protocol}://${params.host}${port}${path}`
}

/**
 * Check if host is a PeerJS server
 */
const isPeerJSServer = (host: string): boolean => {
  return (
    host.includes('peerjs.com') ||
    host.includes('peerjs') ||
    host.includes('0.peerjs') ||
    host.includes('ecosyseng') // Demo server
  )
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

    const dappPeer = url.searchParams.get('dappPeer')
    if (!dappPeer) {
      return null
    }

    const host = url.searchParams.get('host') || undefined
    const port = url.searchParams.get('port') || undefined
    const path = url.searchParams.get('path') || undefined
    const secureParam = url.searchParams.get('secure')
    const secure = secureParam !== null ? secureParam === 'true' : undefined

    return {
      dappPeer,
      host,
      port,
      path,
      secure,
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
