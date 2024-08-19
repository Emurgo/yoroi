/* eslint-disable @typescript-eslint/no-explicit-any */
import {useNavigation} from '@react-navigation/native'
import {StackNavigationProp} from '@react-navigation/stack'
import {useTheme} from '@yoroi/theme'
import BigNumber from 'bignumber.js'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Banner, Button, useModal} from '../../components'
import {
  useGovernanceStrings,
  useIsParticipatingInGovernance,
  WithdrawWarningModal,
} from '../../features/Staking/Governance'
import {useIsGovernanceFeatureEnabled} from '../../features/Staking/Governance'
import {useSelectedWallet} from '../../features/WalletManager/common/hooks/useSelectedWallet'
import globalMessages from '../../kernel/i18n/global-messages'
import {DashboardRoutes, useWalletNavigation} from '../../kernel/navigation'
import {isEmptyString} from '../../kernel/utils'
import {getCardanoNetworkConfigById} from '../../yoroi-wallets/cardano/networks'
import {getCardanoBaseConfig} from '../../yoroi-wallets/cardano/utils'
import {useBalances, useIsOnline, useSync} from '../../yoroi-wallets/hooks'
import {Amounts} from '../../yoroi-wallets/utils'
import {
  genCurrentEpochLength,
  genCurrentSlotLength,
  genTimeToSlot,
  genToRelativeSlotNumber,
} from '../../yoroi-wallets/utils/timeUtils'
import {PoolTransitionNotice} from '../Staking/PoolTransition/PoolTransitionNotice'
import {usePoolTransition} from '../Staking/PoolTransition/usePoolTransition'
import {EpochProgress} from './EpochProgress'
import {NotDelegatedInfo} from './NotDelegatedInfo'
import {StakePoolInfos, useStakingInfo} from './StakePoolInfos'
import {UserSummary} from './UserSummary'
import {WithdrawStakingRewards} from './WithdrawStakingRewards'

export const Dashboard = () => {
  const {styles} = useStyles()
  const intl = useIntl()
  const navigateTo = useNavigateTo()
  const governanceStrings = useGovernanceStrings()
  const {isPoolRetiring} = usePoolTransition()

  const {wallet, meta} = useSelectedWallet()
  const {isLoading: isSyncing, sync} = useSync(wallet)
  const isOnline = useIsOnline(wallet)
  const {openModal, closeModal} = useModal()

  const balances = useBalances(wallet)
  const primaryAmount = Amounts.getAmount(balances, wallet.primaryTokenInfo.id)
  const {stakingInfo, refetch: refetchStakingInfo, error, isLoading} = useStakingInfo(wallet)
  const isGovernanceFeatureEnabled = useIsGovernanceFeatureEnabled(wallet)

  const {resetToTxHistory} = useWalletNavigation()

  const isParticipatingInGovernance = useIsParticipatingInGovernance(wallet)
  const walletNavigateTo = useWalletNavigation()

  const handleOnParticipatePress = () => {
    walletNavigateTo.navigateToGovernanceCentre({navigateToStakingOnSuccess: true})
  }

  const onWithdraw = () => {
    if (isGovernanceFeatureEnabled && !isParticipatingInGovernance) {
      openModal(
        governanceStrings.withdrawWarningTitle,
        <WithdrawWarningModal onParticipatePress={handleOnParticipatePress} />,
      )
      return
    }

    openModal(
      '',
      <WithdrawStakingRewards wallet={wallet} onSuccess={() => resetToTxHistory()} onCancel={() => closeModal()} />,
      450,
    )
  }

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.root}>
      <View style={styles.container}>
        {isOnline && error && <SyncErrorBanner showRefresh={!(isLoading || isSyncing)} />}

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
          {stakingInfo?.status !== 'staked' && <NotDelegatedInfo />}

          {isPoolRetiring && (
            <Row>
              <PoolTransitionNotice />
            </Row>
          )}

          <Row>
            <EpochInfo />
          </Row>

          <Row>
            {!stakingInfo ? (
              <ActivityIndicator size="large" color="black" />
            ) : stakingInfo.status === 'staked' ? (
              <UserSummary
                totalAdaSum={!isEmptyString(primaryAmount.quantity) ? new BigNumber(primaryAmount.quantity) : null}
                totalRewards={new BigNumber(stakingInfo.rewards)}
                totalDelegated={new BigNumber(stakingInfo.amount)}
                onWithdraw={onWithdraw}
                disableWithdraw={meta.isReadOnly}
              />
            ) : (
              <UserSummary
                totalAdaSum={!isEmptyString(primaryAmount.quantity) ? new BigNumber(primaryAmount.quantity) : null}
                totalRewards={null}
                totalDelegated={null}
                onWithdraw={onWithdraw}
                disableWithdraw
              />
            )}
          </Row>

          {stakingInfo?.status === 'staked' && (
            <Row>
              <StakePoolInfos />
            </Row>
          )}
        </ScrollView>

        <Actions>
          <Button
            onPress={navigateTo.stakingCenter}
            title={intl.formatMessage(messages.stakingCenterButton)}
            disabled={meta.isReadOnly}
            shelleyTheme
            block
            testID="stakingCenterButton"
          />
        </Actions>
      </View>
    </SafeAreaView>
  )
}

const useNavigateTo = () => {
  const navigation = useNavigation<StackNavigationProp<DashboardRoutes>>()

  return {
    stakingCenter: () => navigation.navigate('staking-center', {screen: 'staking-center-main'}),
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
  const {wallet} = useSelectedWallet()
  // TODO: revisit drop in favor of epochUtils
  const config = getCardanoBaseConfig(getCardanoNetworkConfigById(wallet.isMainnet ? 1 : 300))

  const toRelativeSlotNumberFn = genToRelativeSlotNumber(config)
  const timeToSlotFn = genTimeToSlot(config)

  const currentAbsoluteSlot = timeToSlotFn({
    time: currentTime,
  })

  const currentRelativeTime = toRelativeSlotNumberFn(
    timeToSlotFn({
      time: Date.now(),
    }).slot,
  )
  const epochLength = genCurrentEpochLength(config)()
  const slotLength = genCurrentSlotLength(config)()

  const secondsLeftInEpoch = (epochLength - currentRelativeTime.slot) * slotLength
  const timeLeftInEpoch = new Date(1000 * secondsLeftInEpoch - currentAbsoluteSlot.msIntoSlot)

  const leftPadDate = (num: number) => {
    if (num < 10) return `0${num}`
    return num.toString()
  }

  return (
    <EpochProgress
      percentage={Math.floor((100 * currentRelativeTime.slot) / epochLength)}
      currentEpoch={currentRelativeTime.epoch}
      endTime={{
        d: leftPadDate(Math.floor(secondsLeftInEpoch / (3600 * 24))),
        h: leftPadDate(timeLeftInEpoch.getUTCHours()),
        m: leftPadDate(timeLeftInEpoch.getUTCMinutes()),
        s: leftPadDate(timeLeftInEpoch.getUTCSeconds()),
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

const useStyles = () => {
  const {color} = useTheme()

  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: color.bg_color_high,
    },
    container: {
      flexDirection: 'column',
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    contentContainer: {
      paddingTop: 16,
      paddingHorizontal: 16,
    },
    row: {
      flex: 1,
      paddingVertical: 12,
    },
    actions: {
      borderTopWidth: 1,
      borderTopColor: color.gray_c200,
      flexDirection: 'row',
      padding: 16,
      elevation: 1,
      shadowOpacity: 0.06,
      shadowColor: color.black_static,
      shadowRadius: 6,
      shadowOffset: {width: 0, height: -8},
    },
  })

  return {styles}
}

const Actions = (props: ViewProps) => {
  const {styles} = useStyles()
  return <View {...props} style={styles.actions} />
}

const Row = (props: ViewProps) => {
  const {styles} = useStyles()
  return <View {...props} style={styles.row} />
}
