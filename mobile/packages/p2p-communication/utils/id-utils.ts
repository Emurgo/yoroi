/* eslint-disable no-bitwise */
import {BaseStorage} from '@yoroi/types'

import {STORAGE_KEYS} from '../constants'

/**
 * ID Utilities with Storage Injection
 */

export const getPersistentDappId = async (
  storage: BaseStorage,
): Promise<string> => {
  const existingId = await storage.getItem(STORAGE_KEYS.DAPP_PEER_ID)
  if (existingId) {
    return existingId
  }

  const deviceId = generateDeviceId('dapp')
  const id = `dapp-${deviceId}`
  await storage.setItem(STORAGE_KEYS.DAPP_PEER_ID, id)
  return id
}

export const getPersistentWalletId = async (
  storage: BaseStorage,
): Promise<string> => {
  const existingId = await storage.getItem(STORAGE_KEYS.WALLET_PEER_ID)
  if (existingId) {
    return existingId
  }

  const deviceId = await generateWalletDeviceId(storage)
  const id = `wallet-${deviceId}`
  await storage.setItem(STORAGE_KEYS.WALLET_PEER_ID, id)
  return id
}

const generateDeviceId = (_prefix: string): string => {
  const fingerprint = [
    typeof navigator !== 'undefined' ? navigator.userAgent : '',
    typeof navigator !== 'undefined' ? navigator.language : '',
    typeof screen !== 'undefined' ? `${screen.width}x${screen.height}` : '',
    new Date().getTimezoneOffset().toString(),
    typeof navigator !== 'undefined'
      ? (navigator.hardwareConcurrency ?? 'unknown').toString()
      : 'unknown',
  ].join('|')

  let hash = 0
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }

  const deviceHash = Math.abs(hash).toString(36)
  const timestamp = Date.now().toString(24)

  return `${deviceHash}-${timestamp}`
}

const generateWalletDeviceId = async (
  storage: BaseStorage,
): Promise<string> => {
  const fingerprint = [
    typeof navigator !== 'undefined' ? navigator.userAgent : '',
    typeof screen !== 'undefined' ? `${screen.width}x${screen.height}` : '',
    typeof navigator !== 'undefined'
      ? (navigator.hardwareConcurrency ?? 'unknown').toString()
      : 'unknown',
    typeof navigator !== 'undefined' ? navigator.language : '',
    new Date().getTimezoneOffset().toString(),
  ].join('|')

  let hash = 0
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }

  const deviceHash = Math.abs(hash).toString(36)

  let installTime = await storage.getItem(STORAGE_KEYS.WALLET_INSTALL_TIME)
  if (!installTime) {
    installTime = Date.now().toString(36)
    await storage.setItem(STORAGE_KEYS.WALLET_INSTALL_TIME, installTime)
  }

  return `${deviceHash}-${installTime}`
}
