/* eslint-disable @typescript-eslint/no-explicit-any */
import {useNavigation} from '@react-navigation/native'
import BigNumber from 'bignumber.js'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View, ViewProps} from 'react-native'

import {Banner, Button, useModal} from '../components'
import {
  useGovernanceStrings,
  useIsParticipatingInGovernance,
  WithdrawWarningModal,
} from '../features/Staking/Governance'
import {useIsGovernanceFeatureEnabled} from '../features/Staking/Governance'
import globalMessages from '../i18n/global-messages'
import {Modal} from '../legacy/Modal'
import {useWalletNavigation} from '../navigation'
import {useSelectedWallet} from '../SelectedWallet'
import {useStatusBar} from '../theme/hooks'
import {isEmptyString} from '../utils/utils'
import {getCardanoNetworkConfigById} from '../yoroi-wallets/cardano/networks'
import {getCardanoBaseConfig} from '../yoroi-wallets/cardano/utils'
import {useBalances, useIsOnline, useSync} from '../yoroi-wallets/hooks'
import {Amounts} from '../yoroi-wallets/utils'
import {
  genCurrentEpochLength,
  genCurrentSlotLength,
  genTimeToSlot,
  genToRelativeSlotNumber,
} from '../yoroi-wallets/utils/timeUtils'
import {EpochProgress} from './EpochProgress'
import {NotDelegatedInfo} from './NotDelegatedInfo'
import {StakePoolInfos, useStakingInfo} from './StakePoolInfos'
import {UserSummary} from './UserSummary'
import {WithdrawStakingRewards} from './WithdrawStakingRewards'

export const Dashboard = () => {
  const intl = useIntl()
  const navigateTo = useNavigateTo()
  const governanceStrings = useGovernanceStrings()

  const wallet = useSelectedWallet()
  const {isLoading: isSyncing, sync} = useSync(wallet)
  const isOnline = useIsOnline(wallet)
  const {openModal} = useModal()

  const balances = useBalances(wallet)
  const primaryAmount = Amounts.getAmount(balances, '')
  const {stakingInfo, refetch: refetchStakingInfo, error, isLoading} = useStakingInfo(wallet)
  const isGovernanceFeatureEnabled = useIsGovernanceFeatureEnabled(wallet)

  const [showWithdrawalDialog, setShowWithdrawalDialog] = React.useState(false)

  const {resetToTxHistory} = useWalletNavigation()

  const isParticipatingInGovernance = useIsParticipatingInGovernance(wallet)
  const walletNavigateTo = useWalletNavigation()

  useStatusBar()

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
    setShowWithdrawalDialog(true)
  }

  return (
    <View style={styles.root}>
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
                disableWithdraw={wallet.isReadOnly}
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
            disabled={wallet.isReadOnly}
            shelleyTheme
            block
            testID="stakingCenterButton"
          />
        </Actions>
      </View>

      {stakingInfo?.status === 'staked' && (
        <Modal visible={showWithdrawalDialog} onRequestClose={() => setShowWithdrawalDialog(false)} showCloseIcon>
          <WithdrawStakingRewards
            wallet={wallet}
            onSuccess={() => resetToTxHistory()}
            onCancel={() => setShowWithdrawalDialog(false)}
          />
        </Modal>
      )}
    </View>
  )
}

const useNavigateTo = () => {
  const navigation = useNavigation()

  return {
    stakingCenter: () => {
      navigation.navigate('app-root', {
        screen: 'main-wallet-routes',
        params: {
          screen: 'staking-dashboard',
          params: {
            screen: 'staking-center',
            params: {
              screen: 'staking-center-main',
            },
          },
        },
      })
    },
  }
}

const Row = ({style, ...props}: ViewProps) => <View {...props} style={[style, styles.row]} />

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
  const wallet = useSelectedWallet()
  const config = getCardanoBaseConfig(getCardanoNetworkConfigById(wallet.networkId))

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

const Actions = (props: ViewProps) => <View {...props} style={styles.actions} />

const messages = defineMessages({
  stakingCenterButton: {
    id: 'components.delegation.delegationnavigationbuttons.stakingCenterButton',
    defaultMessage: '!!!Go to Staking Center',
  },
})

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flexDirection: 'column',
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
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
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    elevation: 1,
    shadowOpacity: 0.06,
    shadowColor: 'black',
    shadowRadius: 6,
    shadowOffset: {width: 0, height: -8},
  },
})
