/**
 * Multisig account manager
 * Manages addresses for script-based multisig wallets
 */
import {getLogger} from '@yoroi/common'
import {Address, App} from '@yoroi/types'
import {ScriptCbor} from '@yoroi/types'

import {freeze} from 'immer'

import {createMultisigAddressGenerator} from './multisig-address-generator'

/**
 * Multisig account manager state
 */
type MultisigAccountManagerState = {
  readonly paymentScriptCbor: ScriptCbor
  readonly stakingScriptCbor: ScriptCbor
  readonly chainId: number
  readonly baseAddress: Address
  readonly rewardAddressHex: string
  readonly addressGenerator: ReturnType<typeof createMultisigAddressGenerator>
}

/**
 * Multisig account manager interface
 * Similar to AccountManager but for script-based wallets
 */
export type MultisigAccountManager = {
  readonly paymentScriptCbor: ScriptCbor
  readonly stakingScriptCbor: ScriptCbor
  readonly baseAddress: Address
  readonly rewardAddressHex: string
  readonly externalAddresses: () => Address[]
  readonly internalAddresses: () => Address[]
  readonly receiveAddresses: () => Address[]
  readonly generateNewReceiveAddress: () => boolean
  readonly getChangeAddress: () => Address
}

/**
 * Create a multisig account manager
 */
export const createMultisigAccountManager = ({
  paymentScriptCbor,
  stakingScriptCbor,
  chainId,
}: {
  paymentScriptCbor: ScriptCbor
  stakingScriptCbor: ScriptCbor
  chainId: number
}): MultisigAccountManager => {
  const logger = getLogger()

  // Create address generator
  const addressGenerator = createMultisigAddressGenerator({
    paymentScriptCbor,
    stakingScriptCbor,
    chainId,
  })

  // Generate base address (multisig wallets typically use a single base address)
  const baseAddress = addressGenerator.generateBaseAddress()
  const rewardAddressHex = addressGenerator.generateRewardAddress()

  logger.debug(
    'createMultisigAccountManager: Created multisig account manager',
    {
      baseAddress,
      rewardAddressHex,
    },
  )

  // For multisig wallets, we use a single base address
  // Script addresses don't have the concept of "external" vs "internal" chains
  // like key-based wallets do
  const externalAddresses = (): Address[] => {
    return [baseAddress]
  }

  const internalAddresses = (): Address[] => {
    // Multisig wallets can use the same address for change
    // or we could generate additional addresses if needed
    return [baseAddress]
  }

  const receiveAddresses = (): Address[] => {
    return externalAddresses()
  }

  const generateNewReceiveAddress = (): boolean => {
    // Multisig wallets use script addresses
    // The address is derived from the script hash, so it doesn't change
    // unless the script changes (which would be a new wallet)
    logger.debug(
      'generateNewReceiveAddress: Multisig wallets use fixed script addresses',
    )
    return false
  }

  const getChangeAddress = (): Address => {
    return baseAddress
  }

  return freeze({
    paymentScriptCbor,
    stakingScriptCbor,
    baseAddress,
    rewardAddressHex,
    externalAddresses,
    internalAddresses,
    receiveAddresses,
    generateNewReceiveAddress,
    getChangeAddress,
  })
}
