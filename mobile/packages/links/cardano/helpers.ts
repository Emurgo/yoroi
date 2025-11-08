import {isString} from '@yoroi/common'
import {Links} from '@yoroi/types'

import {
  configCardanoAddressV1,
  configCardanoBlockV1,
  configCardanoBrowseV1,
  configCardanoClaimV1,
  configCardanoConnectV1,
  configCardanoPayV1,
  configCardanoPaymentV1,
  configCardanoStakeV1,
  configCardanoTransactionV1,
} from './constants'

/**
 * Classifies and validates a Cardano address
 * Based on cardano-uri-parser classifyCardanoAddress logic
 * @param address - The address string to validate
 * @returns Object with valid flag, type, and is_testnet flag
 */
export const classifyCardanoAddress = (
  address: string,
): {valid: boolean; type?: string; is_testnet?: boolean} => {
  const is_testnet = address.includes('_test')

  if (address.startsWith('stake1') || address.startsWith('stake_test1')) {
    return {
      valid: address.length === 59 || address.length === 64,
      type: 'stake',
      is_testnet,
    }
  }

  if (address.startsWith('addr1')) {
    return {
      valid: address.length === 103 || address.length === 58,
      type: 'shelley',
      is_testnet,
    }
  }

  if (address.startsWith('addr_test1')) {
    return {
      valid: address.length === 108 || address.length === 63,
      type: 'shelley',
      is_testnet,
    }
  }

  if (address.startsWith('Ae2')) {
    return {
      valid: address.length >= 59 && address.length <= 64,
      type: 'byron_icarus',
      is_testnet,
    }
  }

  if (address.startsWith('DdzFF')) {
    return {
      valid: address.length >= 104 && address.length <= 128,
      type: 'byron_daedalus',
      is_testnet,
    }
  }

  const cip105Prefixes = [
    'drep_vk',
    'drep_script',
    'drep',
    'cc_cold_vk',
    'cc_cold_script',
    'cc_cold',
    'cc_hot_vk',
    'cc_hot_script',
    'cc_hot',
  ]

  for (const prefix of cip105Prefixes) {
    if (address.startsWith(prefix)) {
      return {valid: true, type: prefix, is_testnet}
    }
  }

  return {valid: false}
}

/**
 * Validates if a string is a valid Cardano address
 * Uses classifyCardanoAddress for comprehensive validation
 * @param address - The address string to validate
 * @returns true if the address is valid, false otherwise
 */
export const validateCardanoAddress = (address: string): boolean => {
  if (!isString(address)) {
    return false
  }
  return classifyCardanoAddress(address).valid
}

/**
 * @deprecated Use validateCardanoAddress instead
 * LEGACY COMPATIBILITY: Simple regex-based validation kept for backward compatibility
 * NOTE: This is a simple test and may not catch all invalid addresses
 */
export const isCardanoAddress = (address: string) =>
  isString(address) && /^[A-Za-z_0-9]+$/.test(address)

/**
 * Helper functions to detect Cardano URI authorities
 */
export const isCardanoClaimV1 = (url: URL): boolean => {
  if (url.hostname === configCardanoClaimV1.authority) {
    if (url.pathname === `/${configCardanoClaimV1.version}`) return true
    throw new Links.Errors.UnsupportedVersion()
  }
  return false
}

export const isCardanoBrowseV1 = (url: URL): boolean => {
  if (url.hostname === configCardanoBrowseV1.authority) {
    if (url.pathname.startsWith(`/${configCardanoBrowseV1.version}/`)) return true
    throw new Links.Errors.UnsupportedVersion()
  }
  return false
}

export const isCardanoPayV1 = (url: URL): boolean => {
  if (url.hostname === configCardanoPayV1.authority) {
    if (url.pathname === `/${configCardanoPayV1.version}`) return true
    throw new Links.Errors.UnsupportedVersion()
  }
  return false
}

export const isCardanoPaymentV1 = (url: URL): boolean => {
  if (url.hostname === configCardanoPaymentV1.authority) {
    if (url.pathname === `/${configCardanoPaymentV1.version}`) return true
    throw new Links.Errors.UnsupportedVersion()
  }
  return false
}

export const isCardanoStakeV1 = (url: URL): boolean => {
  if (url.hostname === configCardanoStakeV1.authority) {
    if (url.pathname === `/${configCardanoStakeV1.version}`) return true
    throw new Links.Errors.UnsupportedVersion()
  }
  return false
}

export const isCardanoTransactionV1 = (url: URL): boolean => {
  if (url.hostname === configCardanoTransactionV1.authority) {
    if (url.pathname.startsWith(`/${configCardanoTransactionV1.version}/`)) return true
    throw new Links.Errors.UnsupportedVersion()
  }
  return false
}

export const isCardanoBlockV1 = (url: URL): boolean => {
  if (url.hostname === configCardanoBlockV1.authority) {
    if (url.pathname === `/${configCardanoBlockV1.version}`) return true
    throw new Links.Errors.UnsupportedVersion()
  }
  return false
}

export const isCardanoAddressV1 = (url: URL): boolean => {
  if (url.hostname === configCardanoAddressV1.authority) {
    if (url.pathname.startsWith(`/${configCardanoAddressV1.version}/`)) return true
    throw new Links.Errors.UnsupportedVersion()
  }
  return false
}

export const isCardanoConnectV1 = (url: URL): boolean => {
  if (url.hostname === configCardanoConnectV1.authority) {
    if (url.pathname === `/${configCardanoConnectV1.version}`) return true
    throw new Links.Errors.UnsupportedVersion()
  }
  return false
}
