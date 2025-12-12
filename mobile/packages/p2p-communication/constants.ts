/**
 * P2P Communication Constants
 */

export const MESSAGE_TYPES = {
  REQUEST: 'request',
  RESPONSE: 'response',
} as const

export const WALLET_METHODS = {
  SIGN_TX: 'signTx',
} as const

export const STORAGE_KEYS = {
  DAPP_PEER_ID: 'dapp-peer-id',
  WALLET_PEER_ID: 'wallet-peer-id',
  WALLET_INSTALL_TIME: 'wallet-install-time',
} as const

export const CONNECTION_CONSTANTS = {
  MAX_RECONNECT_ATTEMPTS: 100,
  RECONNECT_INTERVAL: 200,
  CONNECTION_TIMEOUT: 20000,
  HEARTBEAT_INTERVAL: 5000,
  HEARTBEAT_TIMEOUT: 3000,
} as const

export const PEER_CONFIG = {
  debug: 1,
  iceServers: [
    {urls: 'stun:stun.l.google.com:19302'},
    {urls: 'stun:stun1.l.google.com:19302'},
  ],
} as const
