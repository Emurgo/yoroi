import {time} from '@yoroi/common'
import {isError} from '@yoroi/common'
import {useWalletEvent} from '@yoroi/wallet-manager'
import {useWalletManager} from '@yoroi/wallet-manager'

import {useQuery, useQueryClient} from '@tanstack/react-query'
import * as React from 'react'

import {useRemoteConfig} from '~/common/hooks/useRemoteConfig'
import {persistPrefixKeyword} from '~/kernel/connection/ConnectionProvider'
import {logger} from '~/kernel/logger/logger'

import {redemptionApi} from '../api/redemptionApi'
import type {AddressAllocation} from '../types'
import {useAirdropAddressCache} from './airdropAddressCache'

export const useAirdropEligibility = () => {
  const walletManager = useWalletManager()
  const wallet = walletManager.selected.wallet
  const {config} = useRemoteConfig()
  const isAirdropEnabled = config?.features?.midnightAirdrop?.enabled ?? false
  const addressCache = useAirdropAddressCache()
  const queryClient = useQueryClient()

  const queryKey = React.useMemo(
    () => [persistPrefixKeyword, 'airdropEligibility', wallet?.id] as const,
    [wallet?.id],
  )

  useWalletEvent(wallet ?? null, 'addresses', () => {
    // Invalidate when addresses change to refresh eligibility
    queryClient.invalidateQueries({queryKey})
  })

  const query = useQuery({
    queryKey,
    enabled: isAirdropEnabled && wallet?.isMainnet === true && !!wallet,
    staleTime: time.fiveMinutes,
    queryFn: async (): Promise<AddressAllocation[]> => {
      if (!wallet || !wallet.isMainnet) {
        return []
      }

      // Check if wallet is properly initialized by checking if addresses are available
      // If wallet is not initialized, receiveAddresses will be empty or throw

      // Get all receive addresses (external addresses)
      // Handle gracefully if addresses are not available
      let addresses: string[] = []
      try {
        addresses = wallet.receiveAddresses() || []
      } catch (error) {
        logger.warn('Failed to get receive addresses', {error})
        return []
      }

      if (addresses.length === 0) {
        return []
      }

      // Load cached addresses to avoid unnecessary API calls
      const [cachedEligible, cachedNotEligible] = await Promise.all([
        addressCache.getEligibleAddresses(),
        addressCache.getNotEligibleAddresses(),
      ])

      // Filter addresses based on cache status
      // - Not eligible: skip entirely (never have allocations)
      // - Eligible: check if next thaw is ready before fetching
      // - Uncached: always check
      const addressesToCheck: string[] = []
      const skippedAddresses: Array<{address: string; reason: string}> = []

      for (const address of addresses) {
        if (cachedNotEligible.has(address)) {
          // Address is cached as not eligible - skip API call
          skippedAddresses.push({address, reason: 'not_eligible'})
          continue
        }

        // Check if we should fetch for this address
        const checkResult = await addressCache.shouldCheckAddress(address)
        if (!checkResult.shouldCheck) {
          skippedAddresses.push({
            address,
            reason: checkResult.reason,
          })
          continue
        }

        addressesToCheck.push(address)
      }

      logger.info('Address eligibility check', {
        totalAddresses: addresses.length,
        cachedNotEligible: cachedNotEligible.size,
        cachedEligible: Object.keys(cachedEligible).length,
        addressesToCheck: addressesToCheck.length,
        skippedAddresses: skippedAddresses.length,
        skippedReasons: skippedAddresses.map((s) => s.reason),
        allAddresses: addresses,
        cachedNotEligibleAddresses: Array.from(cachedNotEligible),
        addressesToCheckList: addressesToCheck,
      })

      // Fetch allocations for addresses we need to check
      const allocations: AddressAllocation[] = []

      // First, load cached allocations from React Query cache for skipped eligible addresses
      // This ensures we show cached data even when skipping API calls
      const previousData =
        queryClient.getQueryData<AddressAllocation[]>(queryKey)
      const cachedAllocationsByAddress = new Map<string, AddressAllocation>()
      if (previousData) {
        for (const cachedAllocation of previousData) {
          cachedAllocationsByAddress.set(
            cachedAllocation.address,
            cachedAllocation,
          )
        }
      }

      // Include cached allocations for addresses we're skipping
      for (const address of addresses) {
        if (cachedNotEligible.has(address)) {
          // Skip not-eligible addresses entirely
          continue
        }

        if (!addressesToCheck.includes(address)) {
          // Address is being skipped - check if we have cached data
          const cachedAllocation = cachedAllocationsByAddress.get(address)
          if (cachedAllocation) {
            allocations.push(cachedAllocation)
            logger.info('Including cached allocation (skipping API call)', {
              address,
              reason: 'cached_data_available',
            })
          } else {
            // No cached data but we're skipping - this shouldn't happen, but log it
            logger.warn('Skipping address but no cached data available', {
              address,
            })
          }
        }
      }

      logger.info('Fetching thaw schedules', {
        addressesToCheckCount: addressesToCheck.length,
        addressesToCheck,
        cachedAllocationsCount: allocations.length,
      })

      for (const address of addressesToCheck) {
        try {
          logger.info('Checking address for eligibility', {address})
          const schedule = await redemptionApi.getThawSchedule(address)
          logger.info('Address has valid schedule', {
            address,
            thawsCount: schedule.thaws.length,
            numberOfClaimedAllocations: schedule.numberOfClaimedAllocations,
          })

          // Calculate redeemable amount (sum of redeemable thaws)
          const redeemableAmount = schedule.thaws
            .filter((thaw) => thaw.status === 'redeemable')
            .reduce((sum, thaw) => sum + thaw.amount, 0)

          // Calculate total allocation (sum of all thaws)
          const totalAllocation = schedule.thaws.reduce(
            (sum, thaw) => sum + thaw.amount,
            0,
          )

          // Calculate redeemed so far (sum of confirmed thaws)
          const redeemedSoFar = schedule.thaws
            .filter(
              (thaw) =>
                thaw.status === 'confirmed' || thaw.status === 'confirming',
            )
            .reduce((sum, thaw) => sum + thaw.amount, 0)

          const totalLeftToRedeem = totalAllocation - redeemedSoFar

          allocations.push({
            address,
            schedule,
            redeemableAmount,
            totalAllocation,
            redeemedSoFar,
            totalLeftToRedeem,
          })

          // Find the next upcoming thaw that hasn't started yet
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

          // Cache as eligible with next thaw date
          await addressCache.updateEligibleAddress(address, nextThawDate)
        } catch (error: unknown) {
          // Handle addresses without allocations
          if (isError(error) && error.message === 'ADDRESS_NOT_FOUND') {
            // Cache as not eligible to avoid future API calls
            await addressCache.addNotEligibleAddress(address)
            logger.info('Cached address as not eligible', {address})
            continue
          }

          // Handle 403 Forbidden - temporary access issue, don't cache
          if (isError(error) && error.message === 'API_ACCESS_FORBIDDEN') {
            logger.warn('API access forbidden for address', {
              address,
              error: error.message,
            })
            // Don't cache - this is a temporary issue, will retry next time
            continue
          }

          // Handle other errors (network errors, etc.)
          if (isError(error)) {
            // Only log non-network errors (network errors are expected when offline)
            const isNetworkError =
              error.message.includes('Network') ||
              error.message.includes('no response')
            if (!isNetworkError) {
              logger.error('Failed to check address eligibility', {
                address,
                error: error.message,
              })
            }
            // Don't cache network errors or other errors - we'll retry next time
          }
        }
      }

      // Return allocations for all addresses we checked
      // Note: addresses cached as not-eligible were skipped entirely
      return allocations
    },
  })

  const hardRefresh = React.useCallback(async () => {
    if (!wallet) {
      logger.warn('Cannot hard refresh: wallet not available')
      return
    }

    try {
      // Get all wallet addresses
      const addresses = wallet.receiveAddresses() || []
      if (addresses.length === 0) {
        logger.warn('Cannot hard refresh: no addresses available')
        return
      }

      logger.info('Hard refreshing airdrop eligibility', {
        walletId: wallet.id,
        addressesCount: addresses.length,
      })

      // Clear cache for all wallet addresses
      await addressCache.clearAddressesCache(addresses)

      // Reset the query to clear all cached data and force fresh fetch
      // This ensures the query will refetch even if it was previously disabled
      queryClient.resetQueries({queryKey}, {throwOnError: false})

      // Also invalidate to mark as stale
      await queryClient.invalidateQueries({queryKey})

      // Force refetch - this will work even if query was previously disabled
      await queryClient.refetchQueries({queryKey}, {throwOnError: false})
    } catch (error) {
      logger.error('Failed to hard refresh airdrop eligibility', {error})
    }
  }, [wallet, addressCache, queryClient, queryKey])

  return {
    allocations: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    hasEligibleAddresses: (query.data?.length ?? 0) > 0,
    totalRedeemableAmount:
      query.data?.reduce((sum, alloc) => sum + alloc.redeemableAmount, 0) ?? 0,
    hardRefresh,
  }
}
