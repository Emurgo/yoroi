import {Branded} from '@yoroi/types'

import {logger} from '@sentry/react'
import * as React from 'react'
import {LayoutAnimation} from 'react-native'

import {useGovernanceParticipation} from '~/features/Staking/Governance/common/helpers'
import {useNavigateTo} from '~/features/Staking/Governance/common/navigation'
import {isInsufficientBalanceError} from '~/features/Staking/Governance/common/transactionErrorHandling'
import {useStakingInfo} from '~/features/Staking/hooks/useStakingInfo'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {minAdaForGovernanceBanner} from '~/kernel/constants'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {Space} from '~/ui/Space/Space'

import {EarnRewardsBanner} from './EarnRewardsBanner'
import {useEarnRewardsDelegation} from './useEarnRewardsDelegation'
import {useYoroiStakePool} from './useYoroiStakePool'

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
  const {navigateToTxReview} = useWalletNavigation()
  const navigateTo = useNavigateTo()
  const {createEarnRewardsTx} = useEarnRewardsDelegation(wallet)
  const {poolId: yoroiPoolId, isLoading: isLoadingYoroiPool} =
    useYoroiStakePool()

  const [showBanner, setShowBanner] = React.useState(false)
  const [isDismissed, setIsDismissed] = React.useState(false)

  // Check if wallet has enough ADA (at least 5 ADA for transaction fees + stake key deposit if needed)
  const hasEnoughAda = React.useMemo(() => {
    const balance = wallet.balanceManager.getPrimaryBalance()
    const adaLovelace = BigInt(balance?.quantity ?? Branded.ZERO_QUANTITY)
    return adaLovelace >= minAdaForGovernanceBanner
  }, [wallet])

  const shouldShowBanner = React.useMemo(() => {
    return (
      !isLoadingStaking &&
      !isLoadingGovernance &&
      !isLoadingYoroiPool &&
      wallet.isMainnet &&
      stakingInfo?.status !== 'staked' &&
      !isParticipatingInGovernance &&
      yoroiPoolId != null && // Only show if we have a pool to delegate to
      hasEnoughAda && // Need at least 5 ADA to create transaction
      !isDismissed
    )
  }, [
    isLoadingStaking,
    isLoadingGovernance,
    isLoadingYoroiPool,
    wallet.isMainnet,
    stakingInfo?.status,
    isParticipatingInGovernance,
    yoroiPoolId,
    hasEnoughAda,
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
        yoroiPoolId ?? undefined,
      )
      navigateToTxReview({
        cbor: unsignedTx.cbor,
        context: 'delegate',
      })
    } catch (error) {
      logger.error('Earn rewards banner: Error creating transaction', {error})

      // Check if error is due to insufficient balance and navigate to noFunds screen
      if (isInsufficientBalanceError(error)) {
        navigateTo.noFunds()
        return
      }

      throw error
    }
  }, [
    createEarnRewardsTx,
    meta.addressMode,
    yoroiPoolId,
    navigateToTxReview,
    navigateTo,
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
