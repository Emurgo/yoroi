import {time} from '@yoroi/common'
import {Wallet} from '@yoroi/types'

import {useQuery} from '@tanstack/react-query'
import * as React from 'react'
import {LayoutAnimation} from 'react-native'

import {useReviewTx} from '~/features/ReviewTx/common/ReviewTxProvider'
import {useGovernanceParticipation} from '~/features/Staking/Governance/common/helpers'
import {useStakingInfo} from '~/features/Staking/hooks/useStakingInfo'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useWalletEvent} from '~/features/WalletManager/hooks/useWalletEvent'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {logger} from '~/kernel/logger/logger'

import {EarnRewardsBanner} from './EarnRewardsBanner'
import {useEarnRewardsDelegation} from './useEarnRewardsDelegation'

const BANNER_DISMISSED_KEY = 'earnRewardsBanner.dismissed'
const BANNER_DISMISS_DURATION = time.oneMonth

/**
 * Hook to manage the earn rewards banner display and interactions
 * 
 * Conditions for showing the banner:
 * - User is not participating in staking (stakingInfo.status !== 'staked')
 * - User is not participating in governance (no DRep delegation)
 * - User is on mainnet
 * - Banner has not been dismissed in the last month
 */
export const useEarnRewardsBanner = (options?: {forceShow?: boolean}) => {
  const {wallet, meta} = useSelectedWallet()
  const {stakingInfo, isLoading: isLoadingStaking} = useStakingInfo(wallet)
  const {isParticipating: isParticipatingInGovernance, isLoading: isLoadingGovernance} =
    useGovernanceParticipation()
  const {unsignedTxChanged} = useReviewTx()
  const {navigateToTxReview} = useWalletNavigation()
  const {createEarnRewardsTx} = useEarnRewardsDelegation(wallet)

  const [showBanner, setShowBanner] = React.useState(false)
  const [isDismissed, setIsDismissed] = React.useState(false)
  const [forceShow, setForceShow] = React.useState(options?.forceShow ?? false)

  // Check if user is participating in staking
  const isParticipatingInStaking = stakingInfo?.status === 'staked'

  // Check conditions for showing banner
  const shouldShowBanner = React.useMemo(() => {
    // Allow forcing banner to show for testing
    if (forceShow && !isDismissed) return true
    
    if (isLoadingStaking || isLoadingGovernance) return false
    if (!wallet.isMainnet) return false
    if (isParticipatingInStaking) return false
    if (isParticipatingInGovernance) return false
    if (isDismissed) return false
    return true
  }, [
    forceShow,
    isLoadingStaking,
    isLoadingGovernance,
    wallet.isMainnet,
    isParticipatingInStaking,
    isParticipatingInGovernance,
    isDismissed,
  ])

  // Update banner visibility with animation
  React.useEffect(() => {
    if (shouldShowBanner !== showBanner) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
      setShowBanner(shouldShowBanner)
    }
  }, [shouldShowBanner, showBanner])

  // Refresh banner state when UTXOs change
  useWalletEvent(wallet, 'utxos', () => {
    logger.info('Earn rewards banner: UTXOs changed, rechecking conditions')
  })

  // Handle CTA press - create and navigate to transaction review
  const handleCtaPress = React.useCallback(async () => {
    try {
      logger.info('Earn rewards banner: Creating combined delegation transaction')
      const unsignedTx = await createEarnRewardsTx(meta.addressMode)
      unsignedTxChanged(unsignedTx)
      navigateToTxReview({
        context: 'delegate',
        onSuccess: () => {
          logger.info('Earn rewards banner: Transaction submitted successfully')
        },
      })
    } catch (error) {
      logger.error('Earn rewards banner: Error creating transaction', {error})
      throw error
    }
  }, [createEarnRewardsTx, meta.addressMode, unsignedTxChanged, navigateToTxReview])

  // Handle banner dismiss
  const handleDismiss = React.useCallback(() => {
    logger.info('Earn rewards banner: Dismissed by user')
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setIsDismissed(true)
    setShowBanner(false)
  }, [])

  // Render banner component
  const renderBanner = React.useCallback(() => {
    if (!showBanner) return null
    return (
      <EarnRewardsBanner onPress={handleCtaPress} onDismiss={handleDismiss} />
    )
  }, [showBanner, handleCtaPress, handleDismiss])

  // Test function to force show banner (for development/testing)
  const toggleForceShow = React.useCallback(() => {
    setForceShow((prev) => !prev)
    setIsDismissed(false)
  }, [])

  return {
    showBanner,
    renderBanner,
    toggleForceShow, // For testing purposes
  }
}

