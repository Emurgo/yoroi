import {BaseStorage} from '@yoroi/types'

/**
 * P2P Communication Types
 */

/**
 * WebRTC Adapter interface
 * Provides platform-agnostic WebRTC API access
 * Apps should provide their own implementation based on their environment:
 * - Browser: Pass native WebRTC APIs (RTCPeerConnection, RTCSessionDescription, RTCIceCandidate)
 * - React Native: Pass exports from react-native-webrtc
 */
export type WebRTCAdapter = {
  readonly RTCPeerConnection: new (
    configuration?: RTCConfiguration,
  ) => RTCPeerConnection
  readonly RTCSessionDescription: new (
    descriptionInitDict?: RTCSessionDescriptionInit,
  ) => RTCSessionDescription
  readonly RTCIceCandidate: new (
    candidateInitDict?: RTCIceCandidateInit,
  ) => RTCIceCandidate
}

export type MessageType = 'request' | 'response' | 'heartbeat'

export type WalletRequest = {
  readonly type: 'request'
  readonly method: string
  readonly data?: unknown
  readonly id: number
}

export type WalletResponse = {
  readonly type: 'response'
  readonly method: string
  readonly data?: unknown
  readonly error?: string
  readonly id: number
}

export type HeartbeatMessage = {
  readonly type: 'heartbeat'
  readonly action: 'ping' | 'pong'
  readonly timestamp: number
  readonly received?: number
}

export type WalletMessage = WalletRequest | WalletResponse | HeartbeatMessage

export type ConnectionStatus =
  | 'initializing'
  | 'ready'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'closed'
  | 'reconnecting'

export type PeerConnectionConfig = {
  readonly signalingUrl?: string
  readonly iceServers?: ReadonlyArray<{readonly urls: string}>
  readonly debug?: number
  readonly targetPeerId?: string // For wallet-to-wallet connections
}

export type ConnectionManagerConfig = {
  readonly storage: BaseStorage
  readonly webrtcAdapter: WebRTCAdapter
  readonly peerConfig?: PeerConnectionConfig
  readonly isWallet?: boolean // Whether this is a wallet (true) or dApp (false/undefined)
}

export type EventCallback<T = unknown> = (data?: T) => void

export type EventListener = {
  readonly open: ReadonlyArray<EventCallback<string>>
  readonly error: ReadonlyArray<EventCallback<Error>>
  readonly close: ReadonlyArray<EventCallback<void>>
  readonly disconnected: ReadonlyArray<EventCallback<void>>
  readonly connection: ReadonlyArray<EventCallback<unknown>>
  readonly data: ReadonlyArray<EventCallback<unknown>>
  readonly connectionClosed: ReadonlyArray<EventCallback<void>>
  readonly peerConnected: ReadonlyArray<EventCallback<string>> // When a specific peer connects
}

export type WalletConnectionState = {
  readonly walletId: string
  readonly connected: boolean
  readonly status: ConnectionStatus
  readonly error: Error | null
}

export type PeerConnectionState = {
  readonly peerId: string
  readonly status: ConnectionStatus
  readonly isReady: boolean
  readonly error: Error | null
}
