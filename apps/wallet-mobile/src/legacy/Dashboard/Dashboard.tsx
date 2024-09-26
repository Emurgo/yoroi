/* eslint-disable @typescript-eslint/no-explicit-any */
import {useNavigation} from '@react-navigation/native'
import {StackNavigationProp} from '@react-navigation/stack'
import {useTheme} from '@yoroi/theme'
import BigNumber from 'bignumber.js'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  ViewProps,
} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Banner} from '../../components/Banner/Banner'
import {Button} from '../../components/Button/Button'
import {useModal} from '../../components/Modal/ModalContext'
import {Space} from '../../components/Space/Space'
import {
  useIsGovernanceFeatureEnabled,
  useIsParticipatingInGovernance,
} from '../../features/Staking/Governance/common/helpers'
import {useStrings} from '../../features/Staking/Governance/common/strings'
import {WithdrawWarningModal} from '../../features/Staking/Governance/useCases/WithdrawWarningModal/WithdrawWarningModal'
import {useSelectedNetwork} from '../../features/WalletManager/common/hooks/useSelectedNetwork'
import {useSelectedWallet} from '../../features/WalletManager/common/hooks/useSelectedWallet'
import globalMessages from '../../kernel/i18n/global-messages'
import {DashboardRoutes, useWalletNavigation} from '../../kernel/navigation'
import {isEmptyString} from '../../kernel/utils'
import {useBalances, useIsOnline, useSync} from '../../yoroi-wallets/hooks'
import {Amounts} from '../../yoroi-wallets/utils/utils'
import {PoolTransitionNotice} from '../Staking/PoolTransition/PoolTransitionNotice'
import {usePoolTransition} from '../Staking/PoolTransition/usePoolTransition'
import {EpochProgress} from './EpochProgress'
import {NotDelegatedInfo} from './NotDelegatedInfo'
import {StakePoolInfos, useStakingInfo} from './StakePoolInfos'
import {UserSummary} from './UserSummary'
import {WithdrawStakingRewards} from './WithdrawStakingRewards/WithdrawStakingRewards'

export const Dashboard = () => {
  const {styles} = useStyles()
  const intl = useIntl()
  const navigateTo = useNavigateTo()
  const governanceStrings = useStrings()
  const {isPoolRetiring} = usePoolTransition()

  const {wallet, meta} = useSelectedWallet()
  const {isLoading: isSyncing, sync} = useSync(wallet)
  const isOnline = useIsOnline(wallet)
  const {openModal} = useModal()
  const {height: windowHeight} = useWindowDimensions()

  const balances = useBalances(wallet)
  const primaryAmount = Amounts.getAmount(balances, wallet.portfolioPrimaryTokenInfo.id)
  const {stakingInfo, refetch: refetchStakingInfo, error, isLoading} = useStakingInfo(wallet)
  const isGovernanceFeatureEnabled = useIsGovernanceFeatureEnabled(wallet)

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

    openModal('', <WithdrawStakingRewards wallet={wallet} />, Math.min(windowHeight * 0.9, 704))
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
          {stakingInfo?.status !== 'staked' && (
            <>
              <NotDelegatedInfo />

              <Space height="xl" />
            </>
          )}

          {isPoolRetiring && (
            <Row>
              <PoolTransitionNotice />

              <Space height="xl" />
            </Row>
          )}

          <Row>
            <EpochInfo />

            <Space height="xl" />
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

            <Space height="xl" />
          </Row>

          {stakingInfo?.status === 'staked' && (
            <Row>
              <StakePoolInfos />

              <Space height="xl" />
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

const useStyles = () => {
  const {color, atoms} = useTheme()

  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
      backgroundColor: color.bg_color_max,
    },
    container: {
      ...atoms.flex_1,
      ...atoms.flex_col,
    },
    scrollView: {
      ...atoms.flex_1,
    },
    contentContainer: {
      ...atoms.pt_lg,
      ...atoms.px_lg,
    },
    row: {
      ...atoms.flex_1,
    },
    actions: {
      ...atoms.flex_row,
      ...atoms.p_lg,
      borderTopWidth: 1,
      borderTopColor: color.gray_200,
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
