import {isError, time} from '@yoroi/common'
import {isByronAddress} from '@yoroi/tx'
import {useWalletEvent, useWalletManager} from '@yoroi/wallet-manager'

import {useQuery, useQueryClient} from '@tanstack/react-query'
import * as React from 'react'

import {useRemoteConfig} from '~/common/hooks/useRemoteConfig'
import {useIsByronWallet} from '~/features/WalletManager/hooks/useIsByronWallet'
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
  const isByronWallet = useIsByronWallet()
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
    enabled:
      isAirdropEnabled &&
      wallet?.isMainnet === true &&
      !!wallet &&
      !isByronWallet,
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
      const [cachedEligible, cachedNotEligible, externalAddresses] =
        await Promise.all([
          addressCache.getEligibleAddresses(),
          addressCache.getNotEligibleAddresses(),
          addressCache.getExternalAddresses(),
        ])

      // Filter addresses based on cache status
      // - Not eligible: skip entirely (never have allocations)
      // - Eligible: check if next thaw is ready before fetching
      // - Uncached: always check
      const addressesToCheck: string[] = []
      const skippedAddresses: Array<{address: string; reason: string}> = []

      // Pre-load React Query cache to check if we have cached allocations
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

      for (const address of addresses) {
        if (cachedNotEligible.has(address)) {
          // Address is cached as not eligible - skip API call
          skippedAddresses.push({address, reason: 'not_eligible'})
          continue
        }

        // Check if we should fetch for this address
        const checkResult = await addressCache.shouldCheckAddress(address)
        if (!checkResult.shouldCheck) {
          // Address is cached as eligible but we're skipping the API call
          // However, if we don't have React Query cache for it, we need to fetch it
          // This can happen after app restart when React Query cache is empty
          // but our address cache still has the address marked as eligible
          const hasCachedAllocation = cachedAllocationsByAddress.has(address)
          if (!hasCachedAllocation) {
            // No cached data - fetch it anyway to ensure it appears
            addressesToCheck.push(address)
            continue
          }

          // Check if cached allocation has redeemable thaws - if so, refetch to check redemption status
          const cachedAllocation = cachedAllocationsByAddress.get(address)
          if (cachedAllocation && cachedAllocation.redeemableAmount > 0) {
            // Has redeemable thaws - refetch to check if they're still unredeemed
            addressesToCheck.push(address)
            continue
          }

          // We have cached data, so we can skip the API call
          skippedAddresses.push({
            address,
            reason: checkResult.reason,
          })
          continue
        }

        addressesToCheck.push(address)
      }

      logger.debug('Address eligibility check', {
        totalAddresses: addresses.length,
        cachedNotEligible: cachedNotEligible.size,
        cachedEligible: Object.keys(cachedEligible).length,
        externalAddresses: externalAddresses.size,
        addressesToCheck: addressesToCheck.length,
        skippedAddresses: skippedAddresses.length,
      })

      // Fetch allocations for addresses we need to check
      const allocations: AddressAllocation[] = []

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
            const isExternal = externalAddresses.has(address)
            let displayName: string | undefined
            let nextThawDate: string | null | undefined

            // Get next thaw date from eligible cache for both external and regular addresses
            const eligibleInfo = (await addressCache.getEligibleAddresses())[
              address
            ]
            nextThawDate = eligibleInfo?.nextThawDate ?? null

            if (isExternal) {
              // Get display name for external address
              const externalAddressesList =
                await addressCache.getExternalAddressesList()
              const addressIndex = externalAddressesList.indexOf(address)
              displayName =
                addressIndex >= 0
                  ? `Manual address ${addressIndex + 1}`
                  : 'Manual address'
            }

            // Recalculate numberOfClaimedAllocations from confirmed/confirming thaws
            // (API sometimes returns incorrect value, so we calculate it ourselves)
            const numberOfClaimedAllocations =
              cachedAllocation.schedule.thaws.filter(
                (thaw) =>
                  thaw.status === 'confirmed' || thaw.status === 'confirming',
              ).length

            allocations.push({
              ...cachedAllocation,
              schedule: {
                ...cachedAllocation.schedule,
                numberOfClaimedAllocations,
              },
              isExternal,
              displayName,
              nextThawDate,
            })
          }
          // Note: If no cached allocation, the address should have been added to
          // addressesToCheck in the previous loop, so we don't need to handle it here
        }
      }

      // Also include external addresses that aren't in wallet addresses
      const externalAddressesList =
        await addressCache.getExternalAddressesList()
      for (const externalAddress of externalAddresses) {
        // Skip if already in wallet addresses (handled above)
        if (addresses.includes(externalAddress)) {
          continue
        }

        // Get the number for this external address
        const addressIndex = externalAddressesList.indexOf(externalAddress)
        const displayName =
          addressIndex >= 0
            ? `Manual address ${addressIndex + 1}`
            : 'Manual address'

        // Get next thaw date from eligible cache
        const eligibleInfo = (await addressCache.getEligibleAddresses())[
          externalAddress
        ]
        const nextThawDate = eligibleInfo?.nextThawDate ?? null

        // Check if we have cached React Query data for this external address
        const cachedAllocation = cachedAllocationsByAddress.get(externalAddress)
        if (cachedAllocation) {
          // Check if cached allocation has redeemable thaws - if so, refetch to check redemption status
          if (cachedAllocation.redeemableAmount > 0) {
            // Has redeemable thaws - refetch to check if they're still unredeemed
            addressesToCheck.push(externalAddress)
            continue
          }

          // Recalculate numberOfClaimedAllocations from confirmed/confirming thaws
          // (API sometimes returns incorrect value, so we calculate it ourselves)
          const numberOfClaimedAllocations =
            cachedAllocation.schedule.thaws.filter(
              (thaw) =>
                thaw.status === 'confirmed' || thaw.status === 'confirming',
            ).length

          // We have cached data - include it
          allocations.push({
            ...cachedAllocation,
            schedule: {
              ...cachedAllocation.schedule,
              numberOfClaimedAllocations,
            },
            isExternal: true,
            displayName,
            nextThawDate,
          })
          continue
        }

        // No cached data - check if we should fetch for this external address
        const checkResult =
          await addressCache.shouldCheckAddress(externalAddress)
        if (!checkResult.shouldCheck) {
          // Address is cached as eligible but we don't have React Query cache
          // This can happen when a new external address is just added
          // Fetch it anyway to ensure it appears
          addressesToCheck.push(externalAddress)
          continue
        }

        // Fetch for external address
        addressesToCheck.push(externalAddress)
      }

      logger.debug('Fetching thaw schedules', {
        addressesToCheckCount: addressesToCheck.length,
        cachedAllocationsCount: allocations.length,
      })

      for (const address of addressesToCheck) {
        try {
          // Skip Byron addresses - they don't support airdrop
          if (isByronAddress(address)) {
            continue
          }

          const schedule = await redemptionApi.getThawSchedule(address)

          // Calculate redeemable amount (sum of redeemable thaws)
          const redeemableAmount = schedule.thaws
            .filter((thaw) => thaw.status === 'redeemable')
            .reduce((sum, thaw) => sum + thaw.amount, 0)

          // Calculate total allocation (sum of all thaws excluding failed ones)
          const totalAllocation = schedule.thaws
            .filter((thaw) => thaw.status !== 'failed')
            .reduce((sum, thaw) => sum + thaw.amount, 0)

          // Calculate redeemed so far (sum of confirmed thaws)
          const redeemedSoFar = schedule.thaws
            .filter(
              (thaw) =>
                thaw.status === 'confirmed' || thaw.status === 'confirming',
            )
            .reduce((sum, thaw) => sum + thaw.amount, 0)

          // Total left to redeem excludes redeemed thaws (failed already excluded from totalAllocation)
          const totalLeftToRedeem = totalAllocation - redeemedSoFar

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

          // Calculate numberOfClaimedAllocations from confirmed/confirming thaws
          // (API sometimes returns incorrect value, so we calculate it ourselves)
          const numberOfClaimedAllocations = schedule.thaws.filter(
            (thaw) =>
              thaw.status === 'confirmed' || thaw.status === 'confirming',
          ).length

          // Get display name for external address
          const isExternal = externalAddresses.has(address)
          let displayName: string | undefined
          if (isExternal) {
            const externalAddressesList =
              await addressCache.getExternalAddressesList()
            const addressIndex = externalAddressesList.indexOf(address)
            displayName =
              addressIndex >= 0
                ? `Manual address ${addressIndex + 1}`
                : 'Manual address'
          }

          allocations.push({
            address,
            schedule: {
              ...schedule,
              numberOfClaimedAllocations,
            },
            redeemableAmount,
            totalAllocation,
            redeemedSoFar,
            totalLeftToRedeem,
            isExternal,
            displayName,
            nextThawDate,
          })

          // Cache as eligible with next thaw date
          await addressCache.updateEligibleAddress(address, nextThawDate)
        } catch (error: unknown) {
          // Handle addresses without allocations
          if (isError(error) && error.message === 'ADDRESS_NOT_FOUND') {
            // Cache as not eligible to avoid future API calls
            await addressCache.addNotEligibleAddress(address)
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
    refetch: query.refetch,
    hasEligibleAddresses: (query.data?.length ?? 0) > 0,
    totalRedeemableAmount:
      query.data?.reduce((sum, alloc) => sum + alloc.redeemableAmount, 0) ?? 0,
    hardRefresh,
  }
}
