import {App} from '@yoroi/types'

import {Buffer} from 'buffer'
import _ from 'lodash'

import {logger} from '~/kernel/logger/logger'

import * as legacyApi from '../api/api'
import {deriveRewardAddressFromAddress} from '../utils'
import {CardanoMobileWrapped} from '../wrappedCsl'

/**
 * Simplified AddressChain for read-only wallets
 * No address generation or discovery - just manages a fixed list
 */
export class ReadOnlyAddressChain {
  private _addresses: string[]
  private _blockSize: number

  constructor(addresses: string[], blockSize = 50) {
    this._addresses = [...addresses] // defensive copy
    this._blockSize = blockSize
  }

  get addresses(): string[] {
    return [...this._addresses] // defensive copy
  }

  isMyAddress(address: string): boolean {
    return this._addresses.includes(address)
  }

  getIndexOfAddress(address: string): number {
    return this._addresses.indexOf(address)
  }

  getBlocks(): string[][] {
    return _.chunk(this._addresses, this._blockSize)
  }

  // No discovery, no generation - just return what we have
  get info() {
    return {
      lastUsedIndex: this._addresses.length - 1,
      lastUsedIndexVisual: this._addresses.length - 1,
      canIncrease: false, // Can't generate new addresses
    } as const
  }

  // For compatibility with AddressChain interface
  addSubscriberToNewAddresses(_subscriber: (addresses: string[]) => unknown) {
    // No-op: read-only wallets don't generate new addresses
  }

  // Allow adding addresses discovered from transactions
  addAddresses(newAddresses: string[]) {
    const uniqueNew = newAddresses.filter(
      (addr) => !this._addresses.includes(addr),
    )
    if (uniqueNew.length > 0) {
      this._addresses = [...this._addresses, ...uniqueNew]
    }
  }
}

export type ReadOnlyAccountManager = {
  internalChain: ReadOnlyAddressChain
  externalChain: ReadOnlyAddressChain
  discoverAddresses: () => Promise<void>
  getAddressesInBlocks: (rewardAddressHex: string) => string[][]
  save: () => Promise<void>
  clear: () => Promise<void>
}

/**
 * Validates if a string looks like a valid Cardano address
 */
function isValidCardanoAddress(address: string): boolean {
  if (!address || typeof address !== 'string') return false
  const trimmed = address.trim()
  return (
    trimmed.startsWith('addr') ||
    trimmed.startsWith('stake') ||
    trimmed.startsWith('Ae2') ||
    trimmed.startsWith('DdzFF') ||
    /^[0-9a-fA-F]{64,}$/.test(trimmed) // Hex address (at least 32 bytes)
  )
}

/**
 * Discover used addresses by querying transactions and filtering by staking credential
 */
async function discoverUsedAddressesByStakingCredential({
  knownBaseAddress,
  chainId,
  baseApiUrl,
}: {
  knownBaseAddress: string
  chainId: number
  baseApiUrl: string
}): Promise<{
  internalAddresses: string[]
  externalAddresses: string[]
  rewardAddressHex: string
}> {
  // Validate address before using it
  if (!isValidCardanoAddress(knownBaseAddress)) {
    throw new Error(
      `Invalid Cardano address provided for discovery: ${knownBaseAddress}`,
    )
  }

  // Step 1: Derive reward address from known base address
  const rewardAddressBech32 = deriveRewardAddressFromAddress(
    knownBaseAddress,
    chainId,
  )

  const rewardAddressHex = CardanoMobileWrapped.cslScope((csl) => {
    const addr = csl.Address.fromBech32(rewardAddressBech32)
    return Buffer.from(addr.toBytes()).toString('hex')
  })

  // Step 2: Extract staking credential for filtering
  const stakingCredentialHex = CardanoMobileWrapped.cslScope((csl) => {
    const baseAddr = csl.BaseAddress.fromAddress(
      csl.Address.fromBech32(knownBaseAddress),
    )
    if (!baseAddr) {
      throw new Error('Failed to parse base address')
    }
    const stakeCred = baseAddr.stakeCred()
    return Buffer.from(stakeCred.toBytes()).toString('hex')
  })

  // Step 3: Query transaction history for both addresses
  const {bestBlock} = await legacyApi.getTipStatus(baseApiUrl)
  if (!bestBlock.hash) {
    throw new Error('Failed to get tip status')
  }

  const txHistoryPayload = {
    addresses: [rewardAddressBech32, knownBaseAddress],
    untilBlock: bestBlock.hash,
  }

  // Fetch all transactions (may need pagination in production)
  const allTransactions: any[] = []
  let isLast = false
  let after: {block: string; tx: string} | undefined

  do {
    const payload = after ? {...txHistoryPayload, after} : txHistoryPayload

    const response = await legacyApi.fetchNewTxHistory(payload, baseApiUrl)
    allTransactions.push(...response.transactions)
    isLast = response.isLast

    if (!isLast && response.transactions.length > 0) {
      const lastTx = response.transactions[response.transactions.length - 1]
      if (lastTx?.block_hash && lastTx?.hash) {
        after = {
          block: lastTx.block_hash,
          tx: lastTx.hash,
        }
      } else {
        isLast = true
      }
    }
  } while (!isLast)

  // Step 4: Extract all unique addresses from transactions
  const allAddresses = new Set<string>()
  for (const tx of allTransactions) {
    tx.inputs?.forEach((input: any) => {
      if (input.address) allAddresses.add(input.address)
    })
    tx.outputs?.forEach((output: any) => {
      if (output.address) allAddresses.add(output.address)
    })
  }

  // Step 5: Filter addresses that share the same staking credential
  const matchingAddresses: string[] = []
  for (const address of allAddresses) {
    try {
      const matches = CardanoMobileWrapped.cslScope((csl) => {
        try {
          const addr = csl.Address.fromBech32(address)
          const baseAddr = csl.BaseAddress.fromAddress(addr)
          if (!baseAddr) return false

          const stakeCred = baseAddr.stakeCred()
          const stakeCredBytes = stakeCred.toBytes()
          const stakeCredHex = Buffer.from(stakeCredBytes).toString('hex')

          return stakeCredHex === stakingCredentialHex
        } catch {
          return false
        }
      })

      if (matches) {
        matchingAddresses.push(address)
      }
    } catch (error) {
      logger.warn('Failed to check address staking credential', {
        address,
        error,
      })
    }
  }

  // Step 6: Classify addresses (heuristic: external are typically outputs, internal are change)
  // For now, we'll put all discovered addresses in external since we can't determine derivation
  // The user can manually organize if needed
  const externalAddresses = matchingAddresses.filter(
    (addr) => addr !== knownBaseAddress,
  )
  const internalAddresses: string[] = [] // Empty for now - would need heuristics

  return {
    internalAddresses,
    externalAddresses,
    rewardAddressHex,
  }
}

export const readOnlyAccountManagerMaker = async ({
  chainId,
  knownAddress,
  internalAddresses = [],
  externalAddresses = [],
  rewardAddressHex,
  storage,
  baseApiUrl,
  enableDiscovery = false,
}: {
  chainId: number
  knownAddress?: string
  internalAddresses?: string[]
  externalAddresses?: string[]
  rewardAddressHex?: string
  storage: App.Storage
  baseApiUrl: string
  enableDiscovery?: boolean
}): Promise<ReadOnlyAccountManager> => {
  let finalInternalAddresses = internalAddresses
  let finalExternalAddresses = externalAddresses
  let finalRewardAddressHex = rewardAddressHex

  // If we have a known address but no address list, discover them!
  if (
    knownAddress &&
    isValidCardanoAddress(knownAddress) &&
    enableDiscovery &&
    internalAddresses.length === 0 &&
    externalAddresses.length === 0
  ) {
    try {
      logger.debug('Discovering addresses by staking credential', {
        knownAddress,
      })
      const discovered = await discoverUsedAddressesByStakingCredential({
        knownBaseAddress: knownAddress,
        chainId,
        baseApiUrl,
      })

      finalInternalAddresses = discovered.internalAddresses
      finalExternalAddresses = discovered.externalAddresses
      finalRewardAddressHex = discovered.rewardAddressHex

      logger.debug('Address discovery completed', {
        internalCount: finalInternalAddresses.length,
        externalCount: finalExternalAddresses.length,
      })
    } catch (error) {
      logger.error('Address discovery failed', {error})
      // Fall back to just the known address (only if valid)
      if (isValidCardanoAddress(knownAddress)) {
        finalExternalAddresses = [knownAddress]
      }
    }
  } else if (
    knownAddress &&
    isValidCardanoAddress(knownAddress) &&
    !finalRewardAddressHex
  ) {
    // Derive reward address if not provided
    try {
      const rewardAddressBech32 = deriveRewardAddressFromAddress(
        knownAddress,
        chainId,
      )
      finalRewardAddressHex = CardanoMobileWrapped.cslScope((csl) => {
        const addr = csl.Address.fromBech32(rewardAddressBech32)
        return Buffer.from(addr.toBytes()).toString('hex')
      })
    } catch (error) {
      logger.warn('Failed to derive reward address', {error})
      finalRewardAddressHex = ''
    }
  }

  // Ensure we have at least the known address (only if valid)
  if (
    finalExternalAddresses.length === 0 &&
    finalInternalAddresses.length === 0 &&
    knownAddress &&
    isValidCardanoAddress(knownAddress)
  ) {
    finalExternalAddresses = [knownAddress]
  }

  const internalChain = new ReadOnlyAddressChain(finalInternalAddresses)
  const externalChain = new ReadOnlyAddressChain(finalExternalAddresses)

  const discoverAddresses = async () => {
    // No-op: we can't discover new addresses without accountPubKeyHex
    // But we could potentially re-run discovery if enableDiscovery is true
    if (enableDiscovery && knownAddress) {
      try {
        const discovered = await discoverUsedAddressesByStakingCredential({
          knownBaseAddress: knownAddress,
          chainId,
          baseApiUrl,
        })
        // Add newly discovered addresses
        internalChain.addAddresses(discovered.internalAddresses)
        externalChain.addAddresses(discovered.externalAddresses)
      } catch (error) {
        logger.warn('Address re-discovery failed', {error})
      }
    }
  }

  const getAddressesInBlocks = (rewardAddressHex: string) => {
    const internalBlocks = internalChain.getBlocks()
    const externalBlocks = externalChain.getBlocks()

    if (rewardAddressHex !== '') {
      return [...internalBlocks, ...externalBlocks, [rewardAddressHex]]
    }

    return [...internalBlocks, ...externalBlocks]
  }

  const save = async () => {
    // Save address list for persistence
    await storage.setItem('readOnlyAddresses', {
      internal: finalInternalAddresses,
      external: finalExternalAddresses,
      rewardAddress: finalRewardAddressHex,
    })
  }

  const clear = async () => {
    await storage.removeItem('readOnlyAddresses')
  }

  return {
    internalChain,
    externalChain,
    discoverAddresses,
    getAddressesInBlocks,
    save,
    clear,
  }
}
