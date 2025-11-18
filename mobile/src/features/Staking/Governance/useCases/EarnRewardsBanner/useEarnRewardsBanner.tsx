import * as React from 'react'
import {LayoutAnimation} from 'react-native'

import {useReviewTx} from '~/features/ReviewTx/common/ReviewTxProvider'
import {useGovernanceParticipation} from '~/features/Staking/Governance/common/helpers'
import {useStakingInfo} from '~/features/Staking/hooks/useStakingInfo'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useWalletEvent} from '~/features/WalletManager/hooks/useWalletEvent'
import {logger} from '~/kernel/logger/logger'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'

import {EarnRewardsBanner} from './EarnRewardsBanner'
import {useEarnRewardsDelegation} from './useEarnRewardsDelegation'

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

  const [showBanner, setShowBanner] = React.useState(false)
  const [isDismissed, setIsDismissed] = React.useState(false)

  const isParticipatingInStaking = stakingInfo?.status === 'staked'

  const shouldShowBanner = React.useMemo(() => {
    if (isLoadingStaking || isLoadingGovernance) return false
    if (!wallet.isMainnet) return false
    if (isParticipatingInStaking) return false
    if (isParticipatingInGovernance) return false
    if (isDismissed) return false
    return true
  }, [
    isLoadingStaking,
    isLoadingGovernance,
    wallet.isMainnet,
    isParticipatingInStaking,
    isParticipatingInGovernance,
    isDismissed,
  ])

  React.useEffect(() => {
    if (shouldShowBanner !== showBanner) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
      setShowBanner(shouldShowBanner)
    }
  }, [shouldShowBanner, showBanner])

  useWalletEvent(wallet, 'utxos', () => {
    logger.info('Earn rewards banner: UTXOs changed, rechecking conditions')
  })

  const handleCtaPress = React.useCallback(async () => {
    try {
      logger.info(
        'Earn rewards banner: Creating combined delegation transaction',
      )
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
  }, [
    createEarnRewardsTx,
    meta.addressMode,
    unsignedTxChanged,
    navigateToTxReview,
  ])

  const handleDismiss = React.useCallback(() => {
    logger.info('Earn rewards banner: Dismissed by user')
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setIsDismissed(true)
    setShowBanner(false)
  }, [])

  const renderBanner = React.useCallback(() => {
    if (!showBanner) return null
    return (
      <EarnRewardsBanner onPress={handleCtaPress} onDismiss={handleDismiss} />
    )
  }, [showBanner, handleCtaPress, handleDismiss])

  return {
    showBanner,
    renderBanner,
  }
}
