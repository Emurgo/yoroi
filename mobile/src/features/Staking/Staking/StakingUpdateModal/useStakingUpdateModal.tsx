import {getPoolBech32Id} from '@yoroi/cardano-wallet'
import {
  parseBoolean,
  useAsyncStorage,
  useMutationWithInvalidations,
} from '@yoroi/common'
import {useSelectedWallet} from '@yoroi/wallet-manager'

import {useQuery, useQueryClient} from '@tanstack/react-query'
import * as React from 'react'
import {useWindowDimensions} from 'react-native'

import {useRemoteConfig} from '~/common/hooks/useRemoteConfig'
import {useStakingInfo} from '~/features/Staking/hooks/useStakingInfo'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useModal} from '~/ui/Modal/context/ModalContext'

import {StakingUpdateModal} from './StakingUpdateModal'

const STAKING_UPDATE_MODAL_SHOWN_KEY = 'staking-update-modal-shown'
const QUERY_KEY = ['stakingUpdateModalShown']

export const useStakingUpdateModal = () => {
  const {wallet} = useSelectedWallet()
  const {stakingInfo, isLoading: isLoadingStakingInfo} = useStakingInfo(wallet)
  const {config, isLoading: isLoadingConfig} = useRemoteConfig()
  const {openModal} = useModal()
  const strings = useStrings()
  const screenHeight = useWindowDimensions().height
  const modalHeight = screenHeight * 0.8
  const storage = useAsyncStorage()
  const queryClient = useQueryClient()

  // Check cache first to avoid unnecessary storage reads
  const cachedValue = queryClient.getQueryData<boolean>(QUERY_KEY)

  // Check if modal has been shown before (app-wide, not wallet-specific)
  // Use useQuery for proper caching and to prevent race conditions
  const hasBeenShownQuery = useQuery({
    queryKey: QUERY_KEY,
    // If we already have the value in cache (especially if it's true), use it as initial data
    // This prevents refetching when cache exists
    initialData: cachedValue,
    queryFn: async () => {
      try {
        // Read raw string from AsyncStorage to handle all possible formats
        // Storage might contain: JSON string "true", plain string "true", or boolean true
        const rawValue = await storage.getItem<string | null>(
          STAKING_UPDATE_MODAL_SHOWN_KEY,
          (value) => value, // Get raw string from AsyncStorage
        )

        // parseBoolean handles all formats:
        // - If already boolean: returns it directly
        // - If JSON string "true"/"false": parseSafe does JSON.parse, returns boolean
        // - If plain string "true": parseSafe tries JSON.parse, fails, returns undefined
        //   Then we check if rawValue === "true" as fallback
        if (rawValue === null) {
          return false
        }

        const parsed = parseBoolean(rawValue)
        if (parsed !== undefined) {
          return parsed
        }

        // Fallback: handle plain string "true"/"false" if JSON.parse failed
        if (rawValue === 'true') {
          return true
        }
        if (rawValue === 'false') {
          return false
        }

        // Default to true (don't show) if value exists but can't be parsed
        // Safer to assume modal was already shown rather than show it again
        return true
      } catch (error) {
        // On error reading storage, default to true (don't show modal)
        // Safer to assume modal was already shown rather than potentially show it multiple times
        // This should only happen if storage is corrupted or inaccessible
        return true
      }
    },
    placeholderData: true, // Default to true (don't show) while loading
    staleTime: Infinity, // Never refetch - once shown, always shown
    gcTime: Infinity, // Keep in cache forever
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false, // Don't retry on failure - if storage read fails, assume not shown
  })

  const setModalShown = useMutationWithInvalidations({
    mutationFn: async () => {
      await storage.setItem(STAKING_UPDATE_MODAL_SHOWN_KEY, true)
    },
    invalidateQueries: [], // Don't invalidate - we'll update cache directly
    onSuccess: () => {
      // Optimistically update cache instead of invalidating to prevent refetch loop
      queryClient.setQueryData(QUERY_KEY, true)
    },
  })

  const hasBeenShown = hasBeenShownQuery.data ?? false
  const hasTriggeredRef = React.useRef(false)

  React.useEffect(() => {
    const poolId =
      stakingInfo?.status === 'staked' ? stakingInfo.poolId : undefined

    // Don't show if:
    // 1. Still loading storage check
    // 2. Already shown before
    // 3. Already triggered in this session (prevent infinite loop)
    // 4. Still loading staking info
    // 5. Still loading config
    // 6. Feature not enabled in remote config
    // 7. Wallet is not staking
    // 8. Current pool is not in the affected pools list
    if (
      !hasBeenShownQuery.isSuccess ||
      hasBeenShown ||
      hasTriggeredRef.current ||
      isLoadingStakingInfo ||
      isLoadingConfig ||
      !config?.popups?.stakingUpdate?.display ||
      stakingInfo?.status !== 'staked' ||
      !poolId
    ) {
      return
    }

    const affectedPools = config?.popups?.stakingUpdate?.affectedPools ?? []

    // Convert wallet's poolId (hex) to bech32 format for comparison with config pool IDs
    let walletPoolIdBech32: string | null = null
    try {
      walletPoolIdBech32 = getPoolBech32Id(poolId)
    } catch (error) {
      // If conversion fails, poolId might already be bech32 or invalid
      // Try direct comparison first, then fallback
      walletPoolIdBech32 = poolId.startsWith('pool') ? poolId : null
    }

    const isStakingToAffectedPool =
      walletPoolIdBech32 != null && affectedPools.includes(walletPoolIdBech32)

    if (isStakingToAffectedPool) {
      // Mark as triggered to prevent infinite loop
      hasTriggeredRef.current = true

      // Update cache FIRST (synchronously) to prevent re-triggering on remount
      // This ensures the modal won't show again even if storage write fails or component remounts
      queryClient.setQueryData(QUERY_KEY, true)

      // Write to storage asynchronously (fire and forget)
      // If this fails, the cache update above still prevents re-showing
      setModalShown.mutate()

      openModal({
        title: strings.staking.stakingUpdatesTitle,
        content: <StakingUpdateModal.Content />,
        footer: <StakingUpdateModal.Footer />,
        height: modalHeight,
        canDiscard: true,
      })
    }
  }, [
    hasBeenShownQuery.isSuccess,
    hasBeenShown,
    isLoadingStakingInfo,
    isLoadingConfig,
    config,
    stakingInfo,
    openModal,
    strings,
    modalHeight,
    setModalShown,
    queryClient,
  ])

  return {isLoading: isLoadingStakingInfo || isLoadingConfig}
}
