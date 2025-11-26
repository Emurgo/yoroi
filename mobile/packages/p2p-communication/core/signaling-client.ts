/**
 * WebRTC Signaling Client
 * Handles WebSocket-based signaling for WebRTC peer connections
 */

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

  const connect = (): void => {
    try {
      // WebSocket is available in both browser and React Native
      if (typeof WebSocket === 'undefined') {
        config.onError(
          new Error('WebSocket is not available in this environment'),
        )
        return
      }
      ws = new WebSocket(config.signalingUrl)

      ws.onopen = () => {
        connected = true
        config.onOpen()
        // Send peer ID to signaling server
        if (ws) {
          ws.send(
            JSON.stringify({
              type: 'peer-id',
              peerId: config.peerId,
            }),
          )
        }
      }

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as SignalingMessage
          config.onMessage(message)
        } catch (error) {
          config.onError(
            new Error(`Failed to parse signaling message: ${error}`),
          )
        }
      }

      ws.onerror = (error) => {
        config.onError(new Error(`WebSocket error: ${error}`))
      }

      ws.onclose = () => {
        connected = false
        config.onClose()
      }
    } catch (error) {
      config.onError(new Error(`Failed to create WebSocket: ${error}`))
    }
  }

  const send = (message: SignalingMessage): void => {
    if (!ws || !connected) {
      config.onError(new Error('WebSocket not connected'))
      return
    }
    ws.send(JSON.stringify(message))
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
