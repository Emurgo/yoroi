import {cardanoWalletApiMaker} from '@yoroi/api'
import type {ManualAddressReason} from '@yoroi/cardano-wallet'
import {Branded} from '@yoroi/types'

import {redemptionApi} from '~/features/Airdrop/api/redemptionApi'
import {logger} from '~/kernel/logger/logger'

export type AddressCheckResult = {
  address: string
  hasUtxo: boolean
  hasHistory: boolean
  isAirdropEligible: boolean
  nextThawDate: string | null // ISO date string of next upcoming thaw, or null
  reasons: ManualAddressReason[]
}

/**
 * Check if address has UTXOs by querying UTXO endpoint
 */
export async function checkAddressUtxo(
  address: string,
  apiUrl: string,
): Promise<boolean> {
  try {
    // Use legacy API endpoint to check UTXOs
    // POST /v2/txs/utxoForAddresses
    const response = await fetch(`${apiUrl}v2/txs/utxoForAddresses`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({addresses: [address]}),
    })

    if (!response.ok) {
      if (response.status === 404) {
        return false
      }
      logger.warn('checkAddressUtxo: API error', {
        address,
        status: response.status,
      })
      return false
    }

    const data = await response.json()
    // Response is array of UTXOs
    return Array.isArray(data) && data.length > 0
  } catch (error) {
    logger.warn('checkAddressUtxo: Failed to check UTXO', {
      address,
      error,
    })
    return false
  }
}

/**
 * Check if address has transaction history using filterUsedAddresses
 */
export async function checkAddressHistory(
  address: string,
  apiUrl: string,
): Promise<boolean> {
  try {
    // Use filterUsedAddresses to check if address has been used
    const cardanoApi = cardanoWalletApiMaker({
      baseApiUrl: apiUrl,
      getSpendingKey: () => null, // Not needed for read-only check
    })
    const addresses = [Branded.asAddress(address)]
    const usedAddresses = await cardanoApi.filterUsedAddresses(addresses)

    return usedAddresses.length > 0
  } catch (error) {
    logger.warn('checkAddressHistory: Failed to check history', {
      address,
      error,
    })
    return false
  }
}

/**
 * Check if address is eligible for airdrop and return next thaw date
 */
export async function checkAirdropEligibility(
  address: string,
): Promise<{isEligible: boolean; nextThawDate: string | null}> {
  try {
    const schedule = await redemptionApi.getThawSchedule(address)
    // If no error, address is eligible - calculate next thaw date
    const now = new Date()
    const upcomingThaws = schedule.thaws
      .filter((thaw) => {
        const thawDate = new Date(thaw.thawing_period_start)
        return thawDate > now && thaw.status === 'upcoming'
      })
      .sort(
        (a, b) =>
          new Date(a.thawing_period_start).getTime() -
          new Date(b.thawing_period_start).getTime(),
      )

    const nextThawDate =
      upcomingThaws.length > 0
        ? (upcomingThaws[0]?.thawing_period_start ?? null)
        : null

    return {isEligible: true, nextThawDate}
  } catch (error) {
    // ADDRESS_NOT_FOUND means not eligible
    if (error instanceof Error && error.message === 'ADDRESS_NOT_FOUND') {
      return {isEligible: false, nextThawDate: null}
    }
    // Other errors (like API_ACCESS_FORBIDDEN) - log but assume not eligible
    logger.warn('checkAirdropEligibility: Error checking eligibility', {
      address,
      error: error instanceof Error ? error.message : String(error),
    })
    return {isEligible: false, nextThawDate: null}
  }
}

/**
 * Check all statuses for an address
 */
export async function checkAddressStatus(
  address: string,
  apiUrl: string,
): Promise<AddressCheckResult> {
  const [hasUtxo, hasHistory, airdropCheck] = await Promise.all([
    checkAddressUtxo(address, apiUrl),
    checkAddressHistory(address, apiUrl),
    checkAirdropEligibility(address),
  ])

  const isAirdropEligible = airdropCheck.isEligible
  const nextThawDate = airdropCheck.nextThawDate

  const reasons: ManualAddressReason[] = []
  if (hasUtxo) reasons.push('utxo')
  if (hasHistory) reasons.push('used')
  if (isAirdropEligible) reasons.push('airdrop')

  return {
    address,
    hasUtxo,
    hasHistory,
    isAirdropEligible,
    nextThawDate,
    reasons,
  }
}

/**
 * Check multiple addresses in batch
 */
export async function checkAddressesBatch(
  addresses: string[],
  apiUrl: string,
  batchSize: number = 10,
  onProgress?: (
    checked: number,
    total: number,
    result: AddressCheckResult,
  ) => void,
  shouldPause?: () => boolean,
): Promise<Map<string, AddressCheckResult>> {
  const results = new Map<string, AddressCheckResult>()
  let checked = 0

  // Process in batches
  for (let i = 0; i < addresses.length; i += batchSize) {
    // Check for pause before processing each batch
    if (shouldPause?.()) {
      throw new Error('PAUSED')
    }

    const batch = addresses.slice(i, i + batchSize)
    const batchResults = await Promise.all(
      batch.map((address) => checkAddressStatus(address, apiUrl)),
    )

    for (const result of batchResults) {
      results.set(result.address, result)
      checked++
      // Update progress first
      onProgress?.(checked, addresses.length, result)

      // Check for pause after updating progress
      if (shouldPause?.()) {
        throw new Error('PAUSED')
      }
    }
  }

  return results
}
