import {logger} from '@sentry/react'
import * as React from 'react'
import {LayoutAnimation} from 'react-native'

import {useReviewTx} from '~/features/ReviewTx/common/ReviewTxProvider'
import {useGovernanceParticipation} from '~/features/Staking/Governance/common/helpers'
import {useStakingInfo} from '~/features/Staking/hooks/useStakingInfo'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {Space} from '~/ui/Space/Space'

import {EarnRewardsBanner} from './EarnRewardsBanner'
import {useEarnRewardsDelegation} from './useEarnRewardsDelegation'
import {useTopStakePool} from './useTopStakePool'

/**
 * Hook to manage the earn rewards banner display and interactions
 * Conditions for showing the banner:
 * - User is not participating in staking (stakingInfo.status !== 'staked')
 * - User is not participating in governance (no DRep delegation)
 * - User is on mainnet
 * - Banner has not been dismissed in the last month
 */
export const useEarnRewardsBanner = () => {
  const {wallet, meta} = useSelectedWallet()
  const {stakingInfo, isLoading: isLoadingStaking} = useStakingInfo(wallet)
  const {
    isParticipating: isParticipatingInGovernance,
    isLoading: isLoadingGovernance,
  } = useGovernanceParticipation()
  const {unsignedTxChanged} = useReviewTx()
  const {navigateToTxReview} = useWalletNavigation()
  const {createEarnRewardsTx} = useEarnRewardsDelegation(wallet)
  const {poolId: topPoolId, isLoading: isLoadingTopPool} = useTopStakePool()

  const [showBanner, setShowBanner] = React.useState(false)
  const [isDismissed, setIsDismissed] = React.useState(false)

  const shouldShowBanner = React.useMemo(() => {
    return (
      !isLoadingStaking &&
      !isLoadingGovernance &&
      !isLoadingTopPool &&
      wallet.isMainnet &&
      stakingInfo?.status !== 'staked' &&
      !isParticipatingInGovernance &&
      topPoolId != null && // Only show if we have a pool to delegate to
      !isDismissed
    )
  }, [
    isLoadingStaking,
    isLoadingGovernance,
    isLoadingTopPool,
    wallet.isMainnet,
    stakingInfo?.status,
    isParticipatingInGovernance,
    topPoolId,
    isDismissed,
  ])

  React.useEffect(() => {
    if (shouldShowBanner !== showBanner) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
      setShowBanner(shouldShowBanner)
    }
  }, [shouldShowBanner, showBanner])

  const handleCtaPress = React.useCallback(async () => {
    try {
      const unsignedTx = await createEarnRewardsTx(
        meta.addressMode,
        topPoolId ?? undefined,
      )
      unsignedTxChanged(unsignedTx)
      navigateToTxReview({
        context: 'delegate',
      })
    } catch (error) {
      logger.error('Earn rewards banner: Error creating transaction', {error})
      throw error
    }
  }, [
    createEarnRewardsTx,
    meta.addressMode,
    topPoolId,
    unsignedTxChanged,
    navigateToTxReview,
  ])

  const handleDismiss = React.useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setIsDismissed(true)
    setShowBanner(false)
  }, [])

  const renderBanner = React.useCallback(() => {
    if (!showBanner) return null
    return (
      <>
        <Space.Height.md />
        <EarnRewardsBanner onPress={handleCtaPress} onDismiss={handleDismiss} />
      </>
    )
  }, [showBanner, handleCtaPress, handleDismiss])

  return {
    showBanner,
    renderBanner,
  }
}
