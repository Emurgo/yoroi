import {
  HeartbeatMessage,
  WalletMessage,
  WalletRequest,
  WalletResponse,
} from '../types'

/**
 * Message Utilities
 */

export const createWalletRequest = (
  method: string,
  data: unknown = null,
): WalletRequest => ({
  type: 'request',
  method,
  data: data ?? null,
  id: Date.now(),
})

export const createTextMessage = (
  message: string,
): {readonly message: string} => ({
  message,
})

export const parseWalletMessage = (data: unknown): WalletMessage => {
  try {
    if (typeof data === 'string') {
      return JSON.parse(data) as WalletMessage
    }
    return data as WalletMessage
  } catch (error) {
    // Silently fail - let caller handle error
    throw new Error('Invalid message format')
  }
}

export const isWalletRequest = (
  message: WalletMessage,
): message is WalletRequest => {
  return message.type === 'request'
}

export const isWalletResponse = (
  message: WalletMessage,
): message is WalletResponse => {
  return message.type === 'response'
}

export const isHeartbeatMessage = (
  message: WalletMessage,
): message is HeartbeatMessage => {
  return message.type === 'heartbeat'
}
