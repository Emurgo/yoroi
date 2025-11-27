import {time} from '@yoroi/common'

import {useQuery} from '@tanstack/react-query'

import {useRemoteConfig} from '~/features/RemoteConfig/hooks/useRemoteConfig'
import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {useWalletEvent} from '~/features/WalletManager/hooks/useWalletEvent'
import {logger} from '~/kernel/logger/logger'

import {redemptionApi} from '../api/redemptionApi'
import type {AddressAllocation} from '../types'
import {MOCK_ADDRESS_ALLOCATIONS} from './mockData'

// Set to true to use mock data instead of API calls (for UI testing)
const USE_MOCK_DATA = true

export const useAirdropEligibility = () => {
  const walletManager = useWalletManager()
  const wallet = walletManager.selected.wallet
  const {config} = useRemoteConfig()
  const isAirdropEnabled = config?.features?.midnightAirdrop?.enabled ?? false

  const queryKey = ['airdropEligibility', wallet?.id] as const

  useWalletEvent(wallet ?? null, 'addresses', () => {
    // Invalidate when addresses change
  })

  const query = useQuery({
    queryKey,
    enabled:
      isAirdropEnabled &&
      (USE_MOCK_DATA || (wallet?.isMainnet === true && !!wallet)),
    staleTime: time.fiveMinutes,
    queryFn: async (): Promise<AddressAllocation[]> => {
      // Use mock data for UI testing (works even without wallet)
      if (USE_MOCK_DATA) {
        logger.debug('useAirdropEligibility: Using mock data')
        return MOCK_ADDRESS_ALLOCATIONS
      }

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

      const allocations: AddressAllocation[] = []

      // Check each address for allocations
      for (const address of addresses) {
        try {
          const schedule = await redemptionApi.getThawSchedule(address)

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
        } catch (error: any) {
          // Skip addresses without allocations (404) or network errors
          if (error.message !== 'ADDRESS_NOT_FOUND') {
            // Only log non-network errors (network errors are expected when offline)
            const isNetworkError =
              error.message?.includes('Network') ||
              error.message?.includes('no response')
            if (!isNetworkError) {
              logger.error('Failed to check address eligibility', {
                address,
                error: error.message,
              })
            }
          }
        }
      }

      return allocations
    },
  })

  return {
    allocations: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    hasEligibleAddresses: (query.data?.length ?? 0) > 0,
    totalRedeemableAmount:
      query.data?.reduce((sum, alloc) => sum + alloc.redeemableAmount, 0) ?? 0,
  }
}
