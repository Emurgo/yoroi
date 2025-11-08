/**
 * P2P Communication Package
 * Main exports
 */

// Core
export {connectionManagerMaker} from './core/connection-manager'
export type {ConnectionManager} from './core/connection-manager'

export {peerConnectionMaker} from './core/peer-connection'
export type {PeerConnection} from './core/peer-connection'

export {multiConnectionManagerMaker} from './core/multi-connection-manager'
export type {MultiConnectionManager} from './core/multi-connection-manager'

export {walletCommunicationMaker} from './core/wallet-communication'
export type {WalletCommunication} from './core/wallet-communication'

export {signalingClientMaker} from './core/signaling-client'
export type {
  SignalingClient,
  SignalingClientConfig,
  SignalingMessage,
} from './core/signaling-client'

// Hooks
export {usePeerConnection} from './hooks/use-peer-connection'
export {useWalletConnection} from './hooks/use-wallet-connection'
export {useWalletMessages} from './hooks/use-wallet-messages'

// Utils
export {
  createWalletRequest,
  createTextMessage,
  parseWalletMessage,
  isWalletRequest,
  isWalletResponse,
  isHeartbeatMessage,
} from './utils/message-utils'

export {getPersistentDappId, getPersistentWalletId} from './utils/id-utils'

// Types
export type {
  MessageType,
  WalletRequest,
  WalletResponse,
  HeartbeatMessage,
  WalletMessage,
  ConnectionStatus,
  PeerConnectionConfig,
  ConnectionManagerConfig,
  EventCallback,
  EventListener,
  WalletConnectionState,
  PeerConnectionState,
} from './types'
// Re-export WebRTCAdapter for convenience
export type {WebRTCAdapter} from './types'

// Constants
export {
  MESSAGE_TYPES,
  WALLET_METHODS,
  STORAGE_KEYS,
  CONNECTION_CONSTANTS,
  PEER_CONFIG,
} from './constants'
