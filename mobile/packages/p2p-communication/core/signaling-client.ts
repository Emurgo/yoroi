/**
 * WebRTC Signaling Client
 * Handles WebSocket-based signaling for WebRTC peer connections
 * Compatible with PeerJS signaling protocol
 */

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
  | {type: 'OPEN'; id: string}
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
  const fromPeerJSMessage = (data: string): SignalingMessage | null => {
    try {
      const peerjsMsg = JSON.parse(data) as PeerJSMessage

      if (peerjsMsg.type === 'OPEN') {
        // PeerJS server confirms peer registration
        // The id in OPEN response is our own peer ID
        return {type: 'peer-id', peerId: peerjsMsg.id}
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
      ws = new WebSocket(config.signalingUrl)

      ws.onopen = () => {
        connected = true
        // Send peer ID registration (PeerJS uses OPEN, custom uses peer-id)
        if (ws) {
          if (usePeerJSProtocol) {
            ws.send(JSON.stringify({type: 'OPEN', id: config.peerId}))
          } else {
            ws.send(
              JSON.stringify({
                type: 'peer-id',
                peerId: config.peerId,
              }),
            )
          }
          peerIdRegistered = true
          config.onOpen()
        }
      }

      ws.onmessage = (event) => {
        try {
          let message: SignalingMessage | null = null

          if (usePeerJSProtocol) {
            message = fromPeerJSMessage(event.data)
          } else {
            message = JSON.parse(event.data) as SignalingMessage
          }

          if (message) {
            config.onMessage(message)
          }
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
        peerIdRegistered = false
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
    if (!peerIdRegistered && message.type !== 'peer-id') {
      config.onError(new Error('Peer ID not registered. Cannot send messages.'))
      return
    }

    if (usePeerJSProtocol) {
      ws.send(toPeerJSMessage(message))
    } else {
      ws.send(JSON.stringify(message))
    }
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
