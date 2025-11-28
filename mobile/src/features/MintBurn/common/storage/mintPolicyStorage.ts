import type {MintingScript} from '@yoroi/tx'
import {Wallet} from '@yoroi/types'

import AsyncStorage from '@react-native-async-storage/async-storage'

import {YoroiWallet} from '~/wallets/cardano/types'

import type {PolicyRecoveryData} from '../types'
import {createNativeScriptFromWallet} from '../utils/createNativeScript'

const STORAGE_PREFIX = 'mintPolicy:'

/**
 * Get storage key for policy script
 */
function getStorageKey(walletId: string, policyId: string): string {
  return `${STORAGE_PREFIX}${walletId}:${policyId}`
}

/**
 * Store policy script for a wallet
 */
export async function storePolicyScript(
  walletId: string,
  policyId: string,
  script: MintingScript,
): Promise<void> {
  const key = getStorageKey(walletId, policyId)
  await AsyncStorage.setItem(key, JSON.stringify(script))
}

/**
 * Retrieve policy script for a wallet
 */
export async function getPolicyScript(
  walletId: string,
  policyId: string,
): Promise<MintingScript | null> {
  const key = getStorageKey(walletId, policyId)
  const stored = await AsyncStorage.getItem(key)
  if (!stored) {
    return null
  }

  try {
    return JSON.parse(stored) as MintingScript
  } catch {
    return null
  }
}

/**
 * Store policy recovery data
 */
export async function storePolicyRecoveryData(
  walletId: string,
  policyId: string,
  recoveryData: PolicyRecoveryData,
): Promise<void> {
  const key = `${STORAGE_PREFIX}recovery:${walletId}:${policyId}`
  await AsyncStorage.setItem(key, JSON.stringify(recoveryData))
}

/**
 * Retrieve policy recovery data
 */
export async function getPolicyRecoveryData(
  walletId: string,
  policyId: string,
): Promise<PolicyRecoveryData | null> {
  const key = `${STORAGE_PREFIX}recovery:${walletId}:${policyId}`
  const stored = await AsyncStorage.getItem(key)
  if (!stored) {
    return null
  }

  try {
    return JSON.parse(stored) as PolicyRecoveryData
  } catch {
    return null
  }
}

/**
 * Get all stored policy IDs for a wallet
 */
export async function getStoredPolicyIds(walletId: string): Promise<string[]> {
  const keys = await AsyncStorage.getAllKeys()
  const prefix = `${STORAGE_PREFIX}${walletId}:`
  const recoveryPrefix = `${STORAGE_PREFIX}recovery:${walletId}:`

  const policyIds = new Set<string>()

  for (const key of keys) {
    if (key.startsWith(prefix) && !key.startsWith(recoveryPrefix)) {
      // Extract policy ID from key: mintPolicy:walletId:policyId
      const parts = key.split(':')
      if (parts.length === 3) {
        policyIds.add(parts[2]!)
      }
    }
    if (key.startsWith(recoveryPrefix)) {
      // Extract policy ID from recovery key: mintPolicy:recovery:walletId:policyId
      const parts = key.split(':')
      if (parts.length === 4) {
        policyIds.add(parts[3]!)
      }
    }
  }

  return Array.from(policyIds)
}

/**
 * Remove policy script storage
 */
export async function removePolicyScript(
  walletId: string,
  policyId: string,
): Promise<void> {
  const key = getStorageKey(walletId, policyId)
  const recoveryKey = `${STORAGE_PREFIX}recovery:${walletId}:${policyId}`
  await AsyncStorage.multiRemove([key, recoveryKey])
}

/**
 * Check if a policy script can be recreated from wallet address
 * (Only works for basic single-signature scripts)
 */
export async function canRecreatePolicyFromWallet(
  wallet: YoroiWallet,
  policyId: string,
  addressMode: Wallet.AddressMode,
): Promise<boolean> {
  try {
    const {policyId: recreatedPolicyId} = await createNativeScriptFromWallet(
      wallet,
      addressMode,
    )
    return recreatedPolicyId === policyId
  } catch {
    return false
  }
}
