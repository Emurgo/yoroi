/**
 * WebRTC Signaling Client
 * Handles WebSocket-based signaling for WebRTC peer connections
 * Compatible with PeerJS signaling protocol
 */
import {getLogger} from '@yoroi/logger'

// Internal message format (normalized)
export type SignalingMessage =
  | {
      readonly type: 'offer'
      readonly sdp: string
      readonly peerId: string
      readonly targetPeerId?: string
    }
  | {
      readonly type: 'answer'
      readonly sdp: string
      readonly peerId: string
      readonly targetPeerId?: string
    }
  | {
      readonly type: 'ice-candidate'
      readonly candidate: unknown
      readonly peerId: string
      readonly targetPeerId?: string
    }
  | {readonly type: 'peer-id'; readonly peerId: string}

// PeerJS protocol message format
type PeerJSMessage =
  | {type: 'OPEN'; id?: string} // Server may or may not include id field
  | {
      type: 'OFFER'
      src: string
      dst: string
      payload: {type: string; sdp: string}
    }
  | {
      type: 'ANSWER'
      src: string
      dst: string
      payload: {type: string; sdp: string}
    }
  | {type: 'CANDIDATE'; src: string; dst: string; payload: unknown}
  | {type: 'ERROR'; payload: {msg: string}}

export type SignalingClientConfig = {
  readonly signalingUrl: string
  readonly peerId: string
  readonly onMessage: (message: SignalingMessage) => void
  readonly onError: (error: Error) => void
  readonly onOpen: () => void
  readonly onClose: () => void
}

export type SignalingClient = {
  readonly send: (message: SignalingMessage) => void
  readonly close: () => void
  readonly isConnected: () => boolean
}

export const signalingClientMaker = (
  config: SignalingClientConfig,
): SignalingClient => {
  let ws: WebSocket | null = null
  let connected = false
  let peerIdRegistered = false

  // Detect if this is a PeerJS server (based on URL)
  const isPeerJSServer = (url: string): boolean => {
    try {
      const urlObj = new URL(url)
      return (
        urlObj.hostname.includes('peerjs.com') ||
        urlObj.hostname.includes('peerjs') ||
        urlObj.hostname.includes('0.peerjs') ||
        urlObj.pathname.includes('/peerjs')
      )
    } catch {
      return false
    }
  }

  const usePeerJSProtocol = isPeerJSServer(config.signalingUrl)

  // Convert internal message format to PeerJS protocol
  const toPeerJSMessage = (message: SignalingMessage): string => {
    if (message.type === 'peer-id') {
      return JSON.stringify({type: 'OPEN', id: message.peerId})
    }
    if (message.type === 'offer') {
      return JSON.stringify({
        type: 'OFFER',
        src: message.peerId,
        dst: message.targetPeerId || '',
        payload: {type: 'offer', sdp: message.sdp},
      })
    }
    if (message.type === 'answer') {
      return JSON.stringify({
        type: 'ANSWER',
        src: message.peerId,
        dst: message.targetPeerId || '',
        payload: {type: 'answer', sdp: message.sdp},
      })
    }
    if (message.type === 'ice-candidate') {
      return JSON.stringify({
        type: 'CANDIDATE',
        src: message.peerId,
        dst: message.targetPeerId || '',
        payload: message.candidate,
      })
    }
    return JSON.stringify(message)
  }

  // Convert PeerJS protocol to internal message format
  const fromPeerJSMessage = (
    data: string,
    peerId: string,
  ): SignalingMessage | null => {
    try {
      const peerjsMsg = JSON.parse(data) as PeerJSMessage

      if (peerjsMsg.type === 'OPEN') {
        // PeerJS server confirms peer registration
        // The server may or may not include the id field in OPEN message
        // If not provided, we use the peerId that was in the URL
        return {type: 'peer-id', peerId: peerjsMsg.id || peerId}
      }
      if (peerjsMsg.type === 'OFFER') {
        // src = sender (peer making offer), dst = receiver (us)
        return {
          type: 'offer',
          sdp: peerjsMsg.payload.sdp,
          peerId: peerjsMsg.src,
          targetPeerId: peerjsMsg.dst || undefined,
        }
      }
      if (peerjsMsg.type === 'ANSWER') {
        // src = sender (peer answering), dst = receiver (us)
        return {
          type: 'answer',
          sdp: peerjsMsg.payload.sdp,
          peerId: peerjsMsg.src,
          targetPeerId: peerjsMsg.dst || undefined,
        }
      }
      if (peerjsMsg.type === 'CANDIDATE') {
        // src = sender, dst = receiver
        return {
          type: 'ice-candidate',
          candidate: peerjsMsg.payload,
          peerId: peerjsMsg.src,
          targetPeerId: peerjsMsg.dst || undefined,
        }
      }
      if (peerjsMsg.type === 'ERROR') {
        throw new Error(peerjsMsg.payload.msg || 'PeerJS error')
      }
      return null
    } catch (error) {
      config.onError(new Error(`Failed to parse PeerJS message: ${error}`))
      return null
    }
  }

  const connect = (): void => {
    try {
      // WebSocket is available in both browser and React Native
      if (typeof WebSocket === 'undefined') {
        config.onError(
          new Error('WebSocket is not available in this environment'),
        )
        return
      }

      // Ensure PeerJS URL has correct format with query parameters
      let urlToConnect = config.signalingUrl
      if (usePeerJSProtocol) {
        try {
          const urlObj = new URL(config.signalingUrl)

          // PeerJS format: wss://host:port/pathpeerjs?key=peerjs&id=...&token=...&version=...
          // From socket.ts line 30: wsProtocol + host + ":" + port + path + "peerjs?key=" + key
          // From peer.ts lines 247-253: path is normalized to start with "/" and end with "/"
          // Then socket.ts appends "peerjs" directly (no slash between path and "peerjs")

          let path = urlObj.pathname || '/'

          // Remove any existing "peerjs" from the path (user might have included it)
          // This handles cases where URL already has "/peerjs" or "/peerjs/"
          path = path.replace(/\/peerjs\/?$/, '')

          // Normalize path: ensure it starts and ends with "/" (PeerJS expects this)
          if (!path.startsWith('/')) {
            path = '/' + path
          }
          if (!path.endsWith('/')) {
            path += '/'
          }

          // Append "peerjs" directly (no slash between path and "peerjs")
          // Example: "/" -> "/peerjs", "/custom/" -> "/custom/peerjs"
          path += 'peerjs'

          urlObj.pathname = path

          // Build query string manually to match PeerJS format exactly
          // PeerJS uses: ?key=peerjs&id=...&token=...&version=...
          const params = new URLSearchParams()
          params.set('key', 'peerjs')
          params.set('id', config.peerId)
          // Generate random token like PeerJS does: Math.random().toString(36).slice(2)
          const token = Math.random().toString(36).slice(2)
          params.set('token', token)
          params.set('version', '1.5.4')

          // Construct URL - don't include port if it's the default (443 for wss, 80 for ws)
          // This matches PeerJS behavior - it doesn't explicitly include default ports
          let hostPort = urlObj.hostname
          if (urlObj.port) {
            // Only include port if it's explicitly set and not the default
            const isDefaultPort =
              (urlObj.protocol === 'wss:' && urlObj.port === '443') ||
              (urlObj.protocol === 'ws:' && urlObj.port === '80')
            if (!isDefaultPort) {
              hostPort += ':' + urlObj.port
            }
          }

          // Construct final URL with query string
          urlToConnect = `${urlObj.protocol}//${hostPort}${urlObj.pathname}?${params.toString()}`

          getLogger().log('Constructed PeerJS WebSocket URL', {
            origin: 'p2p-communication',
            originalUrl: config.signalingUrl,
            constructedUrl: urlToConnect,
            peerId: config.peerId,
            token,
          })
        } catch (error) {
          getLogger().warn('Failed to construct PeerJS URL, using original', {
            origin: 'p2p-communication',
            originalUrl: config.signalingUrl,
            error,
          })
          // If URL parsing fails, use original URL
        }
      }

      // Set connection timeout (10 seconds)
      const connectionTimeout = setTimeout(() => {
        if (!connected && ws) {
          getLogger().warn('Signaling connection timeout', {
            origin: 'p2p-communication',
            peerId: config.peerId,
            signalingUrl: config.signalingUrl,
            urlToConnect,
            wsReadyState: ws.readyState,
          })
          ws.close()
          config.onError(
            new Error(
              'Signaling server connection timeout after 10 seconds. Please check your network connection or try again.',
            ),
          )
        }
      }, 10000)

      getLogger().log('Attempting WebSocket connection', {
        origin: 'p2p-communication',
        peerId: config.peerId,
        originalUrl: config.signalingUrl,
        urlToConnect,
        usePeerJSProtocol,
      })

      ws = new WebSocket(urlToConnect)

      ws.onopen = () => {
        clearTimeout(connectionTimeout)
        connected = true
        getLogger().log('WebSocket opened, waiting for server confirmation', {
          origin: 'p2p-communication',
          peerId: config.peerId,
          signalingUrl: config.signalingUrl,
          usePeerJSProtocol,
          urlToConnect,
        })
        // IMPORTANT: With PeerJS, the peer ID is already in the URL query string
        // The server will send us an OPEN message to confirm registration
        // We should NOT send an OPEN message - just wait for the server's response
        // For custom signaling servers, we may need to send peer-id
        if (!usePeerJSProtocol && ws) {
          ws.send(
            JSON.stringify({
              type: 'peer-id',
              peerId: config.peerId,
            }),
          )
          peerIdRegistered = true
          getLogger().log('Peer ID sent to custom signaling server', {
            origin: 'p2p-communication',
            peerId: config.peerId,
          })
          // For custom servers, call onOpen immediately
          config.onOpen()
        }
        // For PeerJS, we wait for the server's OPEN message before calling onOpen
      }

      ws.onmessage = (event) => {
        try {
          let message: SignalingMessage | null = null

          if (usePeerJSProtocol) {
            message = fromPeerJSMessage(event.data, config.peerId)
          } else {
            message = JSON.parse(event.data) as SignalingMessage
          }

          if (message) {
            getLogger().log('Signaling message received via WebSocket', {
              origin: 'p2p-communication',
              peerId: config.peerId,
              messageType: message.type,
              fromPeerId: 'peerId' in message ? message.peerId : undefined,
              rawData:
                typeof event.data === 'string'
                  ? event.data.substring(0, 200)
                  : 'binary',
            })

            // Handle PeerJS OPEN message (server confirms registration)
            if (usePeerJSProtocol && message.type === 'peer-id') {
              // Server sent OPEN message confirming our registration
              peerIdRegistered = true
              getLogger().log('Peer ID registration confirmed by server', {
                origin: 'p2p-communication',
                peerId: config.peerId,
                serverPeerId: message.peerId,
              })
              // Now we can call onOpen - server has confirmed we're registered
              config.onOpen()
            }

            config.onMessage(message)
          }
        } catch (error) {
          getLogger().error('Failed to parse signaling message', {
            origin: 'p2p-communication',
            peerId: config.peerId,
            error,
          })
          config.onError(
            new Error(`Failed to parse signaling message: ${error}`),
          )
        }
      }

      ws.onerror = (error) => {
        clearTimeout(connectionTimeout)
        getLogger().warn('WebSocket error event', {
          origin: 'p2p-communication',
          peerId: config.peerId,
          signalingUrl: config.signalingUrl,
          urlToConnect,
          errorType: error?.type,
          errorTarget: error?.target ? 'present' : 'absent',
          wsReadyState: ws?.readyState,
        })
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'WebSocket connection error. Please check your network connection and try again.'
        config.onError(new Error(errorMessage))
      }

      ws.onclose = (event) => {
        clearTimeout(connectionTimeout)
        connected = false
        peerIdRegistered = false
        getLogger().log('WebSocket closed', {
          origin: 'p2p-communication',
          peerId: config.peerId,
          signalingUrl: config.signalingUrl,
          closeCode: event.code,
          closeReason: event.reason || 'none',
          wasClean: event.wasClean,
        })
        // Only call onClose if it was a normal close, not an error
        if (event.code !== 1006 && event.wasClean) {
          // 1006 is abnormal closure (no close frame received)
          config.onClose()
        } else if (event.code === 1006 || !event.wasClean) {
          // Abnormal closure - treat as error
          const closeReason = event.reason || 'none'
          getLogger().warn('WebSocket abnormal closure', {
            origin: 'p2p-communication',
            peerId: config.peerId,
            closeCode: event.code,
            closeReason,
            wasClean: event.wasClean,
          })

          // Check for specific error reasons
          let errorMessage = `WebSocket connection closed abnormally (code: ${event.code}).`
          if (
            closeReason.includes('525') ||
            closeReason.includes('SSL') ||
            closeReason.includes('TLS')
          ) {
            errorMessage = `SSL/TLS handshake failed (HTTP 525). This may be due to certificate validation issues in the emulator. Try on a real device or check your network configuration.`
          } else if (closeReason.includes('403 Forbidden')) {
            errorMessage = `Signaling server returned 403 Forbidden. The PeerJS server may be rate-limiting or blocking connections. Consider using a custom signaling server or retrying later.`
          } else if (closeReason.includes('401')) {
            errorMessage = `Signaling server returned 401 Unauthorized. Authentication may be required.`
          } else if (closeReason.includes('404')) {
            errorMessage = `Signaling server returned 404 Not Found. The signaling server URL may be incorrect.`
          } else if (closeReason) {
            errorMessage = `WebSocket connection failed: ${closeReason}`
          } else {
            errorMessage = `WebSocket connection closed abnormally (code: ${event.code}). Please check your network connection.`
          }

          config.onError(new Error(errorMessage))
        }
      }
    } catch (error) {
      getLogger().warn('Failed to create WebSocket', {
        origin: 'p2p-communication',
        peerId: config.peerId,
        signalingUrl: config.signalingUrl,
        error,
      })
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to create WebSocket connection. Please check the signaling server URL.'
      config.onError(new Error(errorMessage))
    }
  }

  const send = (message: SignalingMessage): void => {
    if (!ws || !connected) {
      getLogger().warn(
        'Cannot send signaling message - WebSocket not connected',
        {
          origin: 'p2p-communication',
          peerId: config.peerId,
          messageType: message.type,
        },
      )
      config.onError(new Error('WebSocket not connected'))
      return
    }
    if (!peerIdRegistered && message.type !== 'peer-id') {
      getLogger().warn(
        'Cannot send signaling message - Peer ID not registered',
        {
          origin: 'p2p-communication',
          peerId: config.peerId,
          messageType: message.type,
        },
      )
      config.onError(new Error('Peer ID not registered. Cannot send messages.'))
      return
    }

    getLogger().log('Sending signaling message', {
      origin: 'p2p-communication',
      peerId: config.peerId,
      messageType: message.type,
      targetPeerId:
        'targetPeerId' in message ? message.targetPeerId : undefined,
    })
    if (usePeerJSProtocol) {
      ws.send(toPeerJSMessage(message))
    } else {
      ws.send(JSON.stringify(message))
    }
    getLogger().log('Signaling message sent', {
      origin: 'p2p-communication',
      peerId: config.peerId,
      messageType: message.type,
    })
  }

  const close = (): void => {
    if (ws) {
      ws.close()
      ws = null
    }
    connected = false
  }

  const isConnected = (): boolean => connected

  // Auto-connect on creation
  connect()

  return {
    send,
    close,
    isConnected,
  }
}
