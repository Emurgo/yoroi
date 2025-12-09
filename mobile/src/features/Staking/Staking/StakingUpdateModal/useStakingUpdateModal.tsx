import {getPoolBech32Id} from '@yoroi/cardano-wallet'
import {
  isBoolean,
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

  // Check if modal has been shown before (app-wide, not wallet-specific)
  // Use useQuery for proper caching and to prevent race conditions
  const hasBeenShownQuery = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      try {
        // storage.getItem already parses the value using parseSafe internally
        // So we get the actual parsed value directly (boolean, string, null, etc.)
        const storedValue = await storage.getItem(
          STAKING_UPDATE_MODAL_SHOWN_KEY,
        )

        // Since getItem already parses, check if it's already a boolean
        // If not, it might be a string that needs parsing (shouldn't happen but safe)
        const result =
          typeof storedValue === 'boolean'
            ? storedValue
            : isBoolean(storedValue)
              ? storedValue
              : false

        return result
      } catch (error) {
        return false
      }
    },
    placeholderData: false,
    staleTime: Infinity, // Never refetch - once shown, always shown
    gcTime: Infinity, // Keep in cache forever
    refetchOnMount: false,
    refetchOnWindowFocus: false,
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

      // Mark as shown and update cache
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
  ])

  return {isLoading: isLoadingStakingInfo || isLoadingConfig}
}
