import {useAsyncStorage} from '@yoroi/common'

import {logger} from '~/kernel/logger/logger'

const STORAGE_KEY_PREFIX = 'airdrop/address-cache/'
const ELIGIBLE_KEY = 'eligible'
const NOT_ELIGIBLE_KEY = 'not-eligible'
const EXTERNAL_KEY = 'external'

type EligibleAddressInfo = {
  lastCheckDate: string // ISO date string
  nextThawDate: string | null // ISO date string of next upcoming thaw, or null if all thaws have started
}

type EligibleAddressesMap = Record<string, EligibleAddressInfo>

/**
 * Storage utility for caching airdrop address eligibility
 * Addresses that return a valid schedule are cached as "eligible" with metadata:
 * - lastCheckDate: When we last checked this address
 * - nextThawDate: The earliest upcoming thaw that hasn't started yet
 * Addresses that return "not found" are cached as "not-eligible"
 * This prevents unnecessary API calls by only fetching when the next thaw is ready
 */
export const useAirdropAddressCache = () => {
  const storage = useAsyncStorage()
  const cacheStorage = storage.join(STORAGE_KEY_PREFIX)

  const getEligibleAddresses = async (): Promise<EligibleAddressesMap> => {
    try {
      const addressesJson = await cacheStorage.getItem<string>(ELIGIBLE_KEY)
      if (!addressesJson) {
        return {}
      }
      return JSON.parse(addressesJson) as EligibleAddressesMap
    } catch (error) {
      logger.warn('Failed to read eligible addresses cache', {error})
      return {}
    }
  }

  const getNotEligibleAddresses = async (): Promise<Set<string>> => {
    try {
      const addressesJson = await cacheStorage.getItem<string>(NOT_ELIGIBLE_KEY)
      if (!addressesJson) {
        return new Set()
      }
      const addresses = JSON.parse(addressesJson) as string[]
      return new Set(addresses)
    } catch (error) {
      logger.warn('Failed to read not-eligible addresses cache', {error})
      return new Set()
    }
  }

  const updateEligibleAddress = async (
    address: string,
    nextThawDate: string | null,
  ): Promise<void> => {
    try {
      const eligible = await getEligibleAddresses()
      eligible[address] = {
        lastCheckDate: new Date().toISOString(),
        nextThawDate,
      }
      await cacheStorage.setItem(ELIGIBLE_KEY, JSON.stringify(eligible))
    } catch (error) {
      logger.error('Failed to update eligible address cache', {
        address,
        error,
      })
    }
  }

  const addNotEligibleAddress = async (address: string): Promise<void> => {
    try {
      const notEligible = await getNotEligibleAddresses()
      notEligible.add(address)
      await cacheStorage.setItem(
        NOT_ELIGIBLE_KEY,
        JSON.stringify([...notEligible]),
      )
    } catch (error) {
      logger.error('Failed to add not-eligible address to cache', {
        address,
        error,
      })
    }
  }

  const shouldCheckAddress = async (
    address: string,
  ): Promise<{shouldCheck: boolean; reason: string}> => {
    const eligible = await getEligibleAddresses()
    const eligibleInfo = eligible[address]

    if (!eligibleInfo) {
      // Not cached - need to check
      return {shouldCheck: true, reason: 'not_cached'}
    }

    const now = new Date()
    const nextThawDate = eligibleInfo.nextThawDate

    if (!nextThawDate) {
      // All thaws have started - check periodically (every 5 minutes based on staleTime)
      return {shouldCheck: true, reason: 'all_thaws_started'}
    }

    const nextThaw = new Date(nextThawDate)
    if (nextThaw <= now) {
      // Next thaw is ready - need to check
      return {shouldCheck: true, reason: 'next_thaw_ready'}
    }

    // Next thaw hasn't started yet - skip check
    return {
      shouldCheck: false,
      reason: `next_thaw_not_ready_until_${nextThawDate}`,
    }
  }

  const clearCache = async (): Promise<void> => {
    try {
      await cacheStorage.removeItem(ELIGIBLE_KEY)
      await cacheStorage.removeItem(NOT_ELIGIBLE_KEY)
      await cacheStorage.removeItem(EXTERNAL_KEY)
    } catch (error) {
      logger.error('Failed to clear airdrop address cache', {error})
    }
  }

  const clearAddressesCache = async (
    addresses: ReadonlyArray<string>,
  ): Promise<void> => {
    try {
      // Remove from eligible cache
      const eligible = await getEligibleAddresses()
      let hasChanges = false
      for (const address of addresses) {
        if (eligible[address]) {
          delete eligible[address]
          hasChanges = true
        }
      }
      if (hasChanges) {
        await cacheStorage.setItem(ELIGIBLE_KEY, JSON.stringify(eligible))
      }

      // Remove from not-eligible cache
      const notEligible = await getNotEligibleAddresses()
      const addressesToRemove = addresses.filter((addr) =>
        notEligible.has(addr),
      )
      if (addressesToRemove.length > 0) {
        for (const address of addressesToRemove) {
          notEligible.delete(address)
        }
        await cacheStorage.setItem(
          NOT_ELIGIBLE_KEY,
          JSON.stringify([...notEligible]),
        )
      }
    } catch (error) {
      logger.error('Failed to clear addresses cache', {addresses, error})
    }
  }

  const getExternalAddresses = async (): Promise<Set<string>> => {
    try {
      const addressesJson = await cacheStorage.getItem<string>(EXTERNAL_KEY)
      if (!addressesJson) {
        return new Set()
      }
      const addresses = JSON.parse(addressesJson) as string[]
      return new Set(addresses)
    } catch (error) {
      logger.warn('Failed to read external addresses cache', {error})
      return new Set()
    }
  }

  const getExternalAddressesList = async (): Promise<string[]> => {
    try {
      const addressesJson = await cacheStorage.getItem<string>(EXTERNAL_KEY)
      if (!addressesJson) {
        return []
      }
      const addresses = JSON.parse(addressesJson) as string[]
      return addresses
    } catch (error) {
      logger.warn('Failed to read external addresses cache', {error})
      return []
    }
  }

  const getExternalAddressNumber = async (
    address: string,
  ): Promise<number | null> => {
    try {
      const addresses = await getExternalAddressesList()
      const index = addresses.indexOf(address)
      return index >= 0 ? index + 1 : null
    } catch (error) {
      logger.warn('Failed to get external address number', {error})
      return null
    }
  }

  const addExternalAddress = async (address: string): Promise<void> => {
    try {
      const external = await getExternalAddressesList()
      // Don't add if already exists
      if (external.includes(address)) {
        return
      }
      external.push(address)
      await cacheStorage.setItem(EXTERNAL_KEY, JSON.stringify(external))
    } catch (error) {
      logger.error('Failed to add external address to cache', {
        address,
        error,
      })
    }
  }

  const removeExternalAddress = async (address: string): Promise<void> => {
    try {
      const external = await getExternalAddressesList()
      const index = external.indexOf(address)
      if (index >= 0) {
        external.splice(index, 1)
        await cacheStorage.setItem(EXTERNAL_KEY, JSON.stringify(external))
      }
    } catch (error) {
      logger.error('Failed to remove external address from cache', {
        address,
        error,
      })
    }
  }

  const removeEligibleAddress = async (address: string): Promise<void> => {
    try {
      const eligible = await getEligibleAddresses()
      if (eligible[address]) {
        delete eligible[address]
        await cacheStorage.setItem(ELIGIBLE_KEY, JSON.stringify(eligible))
      }
    } catch (error) {
      logger.error('Failed to remove address from eligible cache', {
        address,
        error,
      })
    }
  }

  return {
    getEligibleAddresses,
    getNotEligibleAddresses,
    getExternalAddresses,
    getExternalAddressesList,
    getExternalAddressNumber,
    updateEligibleAddress,
    addNotEligibleAddress,
    addExternalAddress,
    removeExternalAddress,
    removeEligibleAddress,
    shouldCheckAddress,
    clearCache,
    clearAddressesCache,
  }
}
