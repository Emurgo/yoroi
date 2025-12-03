import {createWithdrawalWithGovernanceTxFromWallet} from '@yoroi/cardano-wallet/transaction-recipes'
import {isEmptyString} from '@yoroi/cardano-wallet/utils/string'
import {Amounts} from '@yoroi/cardano-wallet/utils/utils'
import {getYoroiDrepIdHex} from '@yoroi/staking'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Branded, KeyHash} from '@yoroi/types'
import {useIsOnline} from '@yoroi/wallet-manager/hooks/useIsOnline'
import {useSelectedNetwork} from '@yoroi/wallet-manager/hooks/useSelectedNetwork'
import {useSelectedWallet} from '@yoroi/wallet-manager/hooks/useSelectedWallet'
import {useSync} from '@yoroi/wallet-manager/hooks/useSync'

import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {StackNavigationProp} from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  View,
  ViewProps,
} from 'react-native'

import {useBalances} from '~/features/Portfolio/common/hooks/useBalances'
import {StakeRewardsWithdrawalOperation} from '~/features/ReviewTx/common/operations'
import {useGovernanceParticipation} from '~/features/Staking/Governance/common/helpers'
import {WithdrawGovernanceWarningModal} from '~/features/Staking/Governance/useCases/WithdrawGovernanceWarningModal/WithdrawGovernanceWarningModal'
import {usePrefetchPoolList} from '~/features/Staking/Staking/PoolList/usePoolList'
import {PoolTransitionNotice} from '~/features/Staking/Staking/PoolTransition/PoolTransitionNotice'
import {usePoolTransition} from '~/features/Staking/Staking/PoolTransition/usePoolTransition'
import {useCreateWithdrawTx} from '~/features/Staking/hooks/useCreateWithdrawTx'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useResultNavigation} from '~/kernel/navigation/hooks/useResultNavigation'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {DashboardRoutes} from '~/kernel/navigation/types'
import {Banner} from '~/ui/Banner/Banner'
import {Button} from '~/ui/Button/Button'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'

import {useStakingInfo} from '../../../Staking/hooks/useStakingInfo'
import {EpochProgress} from '../shared/EpochProgress'
import {NotDelegatedInfo} from '../shared/NotDelegatedInfo'
import {StakePoolInfos} from '../shared/StakePoolInfos'
import {UserSummary} from '../shared/UserSummary'

export const DashboardScreen = () => {
  const {atoms: ta} = useTheme()
  const screenHeight = Dimensions.get('window').height

  const strings = useStrings()
  const navigateTo = useNavigateTo()
  const {isPoolRetiring} = usePoolTransition()
  const prefetchPoolList = usePrefetchPoolList()

  // Prefetch pool list when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      prefetchPoolList()
    }, [prefetchPoolList]),
  )
  const {
    isPending: isWithdrawLoading,
    hasRewards,
    resolve: createWithdrawalTx,
  } = useCreateWithdrawTx({
    onError: () => navigateTo.failedTx(),
    onSuccess: (result) => {
      walletNavigateTo.navigateToTxReview({
        cbor: result.cbor,
        operations: [<StakeRewardsWithdrawalOperation key="0" />],
        context: 'withdraw rewards',
      })
    },
  })
  const {wallet, meta} = useSelectedWallet()
  const {isPending: isSyncing, sync} = useSync(wallet)
  const isOnline = useIsOnline(wallet)
  const {openModal, closeModal} = useModal()
  const walletNavigateTo = useWalletNavigation()

  const balances = useBalances(wallet)
  const primaryAmount = Amounts.getAmount(
    balances,
    wallet.portfolioPrimaryTokenInfo.id,
  )
  const {
    stakingInfo,
    refetch: refetchStakingInfo,
    error,
    isLoading: isStakingInfoLoading,
  } = useStakingInfo(wallet)

  const {isParticipating, isLoading: isGovernanceParticipationLoading} =
    useGovernanceParticipation()
  const {networkManager} = useSelectedNetwork()

  const [isBuildingCombinedTx, setIsBuildingCombinedTx] = React.useState(false)

  const createOnWithdraw =
    ({shouldDeregister}: {shouldDeregister: boolean}) =>
    () => {
      // For undelegation, always just undelegate without combining with DRep
      if (shouldDeregister) {
        createWithdrawalTx({shouldDeregister})
        return
      }

      // For withdrawal only, show modal if not participating in governance
      if (isGovernanceParticipationLoading) {
        return
      }
      if (!isParticipating) {
        const handleDelegateAndWithdraw = async () => {
          closeModal()
          setIsBuildingCombinedTx(true)

          try {
            // Create combined transaction with withdrawal + DRep delegation
            const drepValue: {KeyHash: KeyHash} = {
              KeyHash: Branded.asKeyHash(
                getYoroiDrepIdHex(wallet.networkManager.network),
              ),
            }
            const result = await createWithdrawalWithGovernanceTxFromWallet(
              wallet,
              {
                shouldDeregister,
                addressMode: meta.addressMode,
                networkManager,
                drepValue,
              },
            )

            // Navigate to tx review with combined operations
            walletNavigateTo.navigateToTxReview({
              cbor: result.cbor,
              operations: [<StakeRewardsWithdrawalOperation key="0" />],
              context: 'withdraw rewards',
            })
          } catch {
            navigateTo.failedTx()
          } finally {
            setIsBuildingCombinedTx(false)
          }
        }
        openModal({
          title: strings.staking.withdrawWarningTitle,
          content: React.createElement(WithdrawGovernanceWarningModal.Content),
          footer: React.createElement(WithdrawGovernanceWarningModal.Footer, {
            onDelegateAndWithdraw: handleDelegateAndWithdraw,
          }),
          height: screenHeight * 0.7,
        })
        return
      }

      createWithdrawalTx({shouldDeregister})
    }

  const isLoading = isWithdrawLoading || isBuildingCombinedTx

  return (
    <SafeArea
      edges={['bottom', 'left', 'right']}
      style={[a.flex_1, ta.bg_color_max]}
    >
      <View style={[a.flex_1]}>
        {isOnline && error && (
          <SyncErrorBanner showRefresh={!(isStakingInfoLoading || isSyncing)} />
        )}

        <ScrollView
          style={[a.flex_1]}
          contentContainerStyle={[a.px_lg, a.py_lg]}
          refreshControl={
            <RefreshControl
              onRefresh={() => {
                sync()
                refetchStakingInfo()
              }}
              refreshing={false}
            />
          }
        >
          {stakingInfo?.status !== 'staked' && (
            <>
              <NotDelegatedInfo />

              <Space.Height.xl />
            </>
          )}

          {isPoolRetiring && (
            <Row>
              <PoolTransitionNotice />

              <Space.Height.xl />
            </Row>
          )}

          <Row>
            <EpochInfo />

            <Space.Height.xl />
          </Row>

          <Row>
            {!stakingInfo ? (
              <ActivityIndicator size="large" color="black" />
            ) : stakingInfo.status === 'staked' ? (
              <UserSummary
                totalAdaSum={
                  !isEmptyString(primaryAmount.quantity)
                    ? new BigNumber(primaryAmount.quantity)
                    : null
                }
                totalRewards={new BigNumber(stakingInfo.rewards)}
                totalDelegated={new BigNumber(stakingInfo.amount)}
                ctaProps={{
                  onPress: createOnWithdraw({shouldDeregister: false}),
                  disabled: meta.isReadOnly || isLoading || !hasRewards,
                }}
              />
            ) : (
              <UserSummary
                totalAdaSum={
                  !isEmptyString(primaryAmount.quantity)
                    ? new BigNumber(primaryAmount.quantity)
                    : null
                }
                totalRewards={null}
                totalDelegated={null}
              />
            )}

            <Space.Height.xl />
          </Row>

          {stakingInfo?.status === 'staked' && (
            <Row>
              <StakePoolInfos
                ctaProps={{
                  onPress: createOnWithdraw({shouldDeregister: true}),
                  disabled: meta.isReadOnly || isLoading,
                }}
              />

              <Space.Height.xl />
            </Row>
          )}
        </ScrollView>

        <Actions>
          <Button
            onPress={navigateTo.stakingCenter}
            title={strings.dashboard.stakingCenterButton}
            disabled={meta.isReadOnly}
            testID="stakingCenterButton"
          />
        </Actions>
      </View>
    </SafeArea>
  )
}

export const useNavigateTo = () => {
  const navigation = useNavigation<StackNavigationProp<DashboardRoutes>>()
  const strings = useStrings()
  const resultNavigation = useResultNavigation()
  const walletNavigation = useWalletNavigation()

  return {
    stakingCenter: () =>
      navigation.navigate('staking-center', {screen: 'staking-center-main'}),
    submittedTx: () =>
      resultNavigation.showResultScreen({
        type: 'success',
        context: 'delegate',
        title: strings.staking.submittedTxTitle,
        message: strings.staking.submittedTxText,
        primaryAction: {
          title: strings.staking.submittedTxButton,
          onPress: walletNavigation.resetToTxHistory,
        },
      }),
    failedTx: () =>
      resultNavigation.showResultScreen({
        type: 'error',
        context: 'delegate',
        title: strings.staking.failedTxTitle,
        message: strings.staking.failedTxText,
        primaryAction: {
          title: strings.staking.failedTxButton,
          onPress: walletNavigation.resetToTxHistory,
        },
      }),
  }
}

const SyncErrorBanner = ({showRefresh}: {showRefresh: boolean}) => {
  const strings = useStrings()

  return (
    <Banner
      error
      text={
        showRefresh
          ? strings.transactions.syncErrorBannerTextWithRefresh
          : strings.transactions.syncErrorBannerTextWithoutRefresh
      }
    />
  )
}

const useCurrentTime = () => {
  const [currentTime, setCurrentTime] = React.useState(() => Date.now())
  React.useEffect(() => {
    const id = setInterval(() => setCurrentTime(Date.now()), 1000)

    return () => clearInterval(id)
  }, [])

  return currentTime
}

const EpochInfo = () => {
  const currentTime = useCurrentTime()
  const {networkManager} = useSelectedNetwork()
  const {epoch} = networkManager.epoch.info(new Date(currentTime))
  const {
    timeRemaining: {days, hours, minutes, seconds},
    progress,
  } = networkManager.epoch.progress(new Date(currentTime))

  const leftPadDate = (num: number) => {
    if (num < 10) return `0${num}`
    return num.toString()
  }

  return (
    <EpochProgress
      percentage={Math.floor(progress)}
      currentEpoch={epoch}
      endTime={{
        d: leftPadDate(days),
        h: leftPadDate(hours),
        m: leftPadDate(minutes),
        s: leftPadDate(seconds),
      }}
    />
  )
}

const Actions = (props: ViewProps) => {
  const {palette: p} = useTheme()
  return (
    <View
      {...props}
      style={[
        a.flex_row,
        a.p_lg,
        {borderTopWidth: 1, borderTopColor: p.gray_200},
      ]}
    />
  )
}

const Row = (props: ViewProps) => {
  return <View {...props} style={[a.flex_1]} />
}
