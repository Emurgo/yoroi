import {useNavigation} from '@react-navigation/native'
import {StackNavigationProp} from '@react-navigation/stack'
import {atoms as a, useTheme} from '@yoroi/theme'
import BigNumber from 'bignumber.js'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  View,
  ViewProps,
} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {StakeRewardsWithdrawalOperation} from '~/features/ReviewTx/common/operations'
import {useReviewTx} from '~/features/ReviewTx/common/ReviewTxProvider'
import {useIsParticipatingInGovernance} from '~/features/Staking/Governance/common/helpers'
import {useStrings} from '~/features/Staking/Governance/common/strings'
import {WithdrawGovernanceWarningModal} from '~/features/Staking/Governance/useCases/WithdrawGovernanceWarningModal/WithdrawGovernanceWarningModal'
import {PoolTransitionNotice} from '~/features/Staking/Staking/PoolTransition/PoolTransitionNotice'
import {usePoolTransition} from '~/features/Staking/Staking/PoolTransition/usePoolTransition'
import {useSelectedNetwork} from '~/features/WalletManager/hooks/useSelectedNetwork'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import globalMessages from '~/kernel/i18n/global-messages'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {DashboardRoutes, useWalletNavigation} from '~/kernel/navigation'

import {Banner} from '~/ui/Banner/Banner'
import {Button} from '~/ui/Button/Button'
import {useModal} from '~/ui/Modal/ModalContext'
import {Space} from '~/ui/Space/Space'
import {
  useBalances,
  useCreateWithdrawTx,
  useIsOnline,
  useSync,
} from '~/wallets/hooks'
import {isEmptyString} from '~/wallets/utils/string'
import {Amounts} from '~/wallets/utils/utils'
import {EpochProgress} from './EpochProgress'
import {NotDelegatedInfo} from './NotDelegatedInfo'
import {StakePoolInfos, useStakingInfo} from './StakePoolInfos'
import {UserSummary} from './UserSummary'

export const Dashboard = () => {
  const {track} = useMetrics()
  const {color} = useTheme()

  const intl = useIntl()
  const navigateTo = useNavigateTo()
  const governanceStrings = useStrings()
  const {isPoolRetiring} = usePoolTransition()
  const {unsignedTxChanged} = useReviewTx()
  const {
    isLoading: isWithdrawLoading,
    hasRewards,
    createWithdrawalTx,
  } = useCreateWithdrawTx()
  const {wallet, meta} = useSelectedWallet()
  const {isLoading: isSyncing, sync} = useSync(wallet)
  const isOnline = useIsOnline(wallet)
  const {openModal} = useModal()

  const balances = useBalances(wallet)
  const primaryAmount = Amounts.getAmount(
    balances,
    wallet.portfolioPrimaryTokenInfo.id,
  )
  const {
    stakingInfo,
    refetch: refetchStakingInfo,
    error,
    isLoading,
  } = useStakingInfo(wallet)

  const isParticipatingInGovernance = useIsParticipatingInGovernance()
  const walletNavigateTo = useWalletNavigation()

  const createOnWithdraw =
    ({shouldDeregister}: {shouldDeregister: boolean}) =>
    () => {
      if (!isParticipatingInGovernance) {
        openModal({
          title: governanceStrings.withdrawWarningTitle,
          content: (
            <WithdrawGovernanceWarningModal
              onParticipatePress={() =>
                walletNavigateTo.navigateToGovernanceCentre()
              }
            />
          ),
        })
        return
      }

      createWithdrawalTx({
        shouldDeregister,
        onError: navigateTo.failedTx,
        onSuccess: (unsignedTx) => {
          unsignedTxChanged(unsignedTx)
          walletNavigateTo.navigateToTxReview({
            operations: [<StakeRewardsWithdrawalOperation key="0" />],
            onSuccess: () => {
              track.claimAdaTransactionSubmitted()
              navigateTo.submittedTx()
            },
            onError: navigateTo.failedTx,
          })
          return
        },
      })
    }

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={[styles.root, {backgroundColor: color.bg_color_max}]}
    >
      <View style={styles.container}>
        {isOnline && error && (
          <SyncErrorBanner showRefresh={!(isLoading || isSyncing)} />
        )}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
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
                  disabled: meta.isReadOnly || isWithdrawLoading || !hasRewards,
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
                  disabled: meta.isReadOnly || isWithdrawLoading,
                }}
              />

              <Space.Height.xl />
            </Row>
          )}
        </ScrollView>

        <Actions>
          <Button
            onPress={navigateTo.stakingCenter}
            title={intl.formatMessage(messages.stakingCenterButton)}
            disabled={meta.isReadOnly}
            testID="stakingCenterButton"
          />
        </Actions>
      </View>
    </SafeAreaView>
  )
}

export const useNavigateTo = () => {
  const navigation = useNavigation<StackNavigationProp<DashboardRoutes>>()

  return {
    stakingCenter: () =>
      navigation.navigate('staking-center', {screen: 'staking-center-main'}),
    submittedTx: () => navigation.navigate('staking-submitted-tx'),
    failedTx: () => navigation.navigate('staking-failed-tx'),
  }
}

const SyncErrorBanner = ({showRefresh}: {showRefresh: boolean}) => {
  const intl = useIntl()

  return (
    <Banner
      error
      text={
        showRefresh
          ? intl.formatMessage(globalMessages.syncErrorBannerTextWithRefresh)
          : intl.formatMessage(globalMessages.syncErrorBannerTextWithoutRefresh)
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

const messages = defineMessages({
  stakingCenterButton: {
    id: 'components.delegation.delegationnavigationbuttons.stakingCenterButton',
    defaultMessage: '!!!Go to Staking Center',
  },
})

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
