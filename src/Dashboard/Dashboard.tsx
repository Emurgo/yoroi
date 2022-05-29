/* eslint-disable @typescript-eslint/no-explicit-any */
import {useNavigation} from '@react-navigation/native'
import BigNumber from 'bignumber.js'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View, ViewProps} from 'react-native'
import {useDispatch, useSelector} from 'react-redux'

import {AccountAutoRefresher} from '../AccountAutoRefresher'
import {VotingBanner} from '../Catalyst/VotingBanner'
import {Banner, Button, OfflineBanner, StatusBar} from '../components'
import globalMessages from '../i18n/global-messages'
import {fetchAccountState} from '../legacy/account'
import {getCardanoBaseConfig, UI_V2} from '../legacy/config'
import {getCardanoNetworkConfigById} from '../legacy/networks'
import {
  isFetchingAccountStateSelector,
  isFetchingUtxosSelector,
  isOnlineSelector,
  lastAccountStateFetchErrorSelector,
  tokenBalanceSelector,
} from '../legacy/selectors'
import {fetchUTXOs} from '../legacy/utxo'
import {useSelectedWallet} from '../SelectedWallet'
import {UtxoAutoRefresher} from '../UtxoAutoRefresher'
import {YoroiWallet} from '../yoroi-wallets'
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
  const navigation = useNavigation()
  const dispatch = useDispatch()

  const isFetchingUtxos = useSelector(isFetchingUtxosSelector)
  const isFetchingAccountState = useSelector(isFetchingAccountStateSelector)
  const lastAccountStateSyncError = useSelector(lastAccountStateFetchErrorSelector)
  const isOnline = useSelector(isOnlineSelector)

  const wallet = useSelectedWallet()
  const balances = useBalances(wallet)
  const {stakingInfo, refetch: refetchStakingInfo, error} = useStakingInfo(wallet)

  const [showWithdrawalDialog, setShowWithdrawalDialog] = React.useState(false)

  console.log('QWE', stakingInfo)

  return (
    <View style={styles.root}>
      <StatusBar type="dark" />
      <UtxoAutoRefresher />
      <AccountAutoRefresher />

      <View style={styles.container}>
        <OfflineBanner />
        {isOnline && (lastAccountStateSyncError || error) && (
          <SyncErrorBanner showRefresh={!(isFetchingAccountState || isFetchingUtxos)} />
        )}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl
              onRefresh={() => {
                dispatch(fetchUTXOs())
                dispatch(fetchAccountState())
                refetchStakingInfo()
              }}
              refreshing={false}
            />
          }
        >
          {stakingInfo?.status === 'not-registered' && <NotDelegatedInfo />}

          <Row>
            <EpochInfo />
          </Row>

          <Row>
            {!stakingInfo ? (
              <ActivityIndicator size="large" color="black" />
            ) : stakingInfo.status === 'staked' ? (
              <UserSummary
                totalAdaSum={balances['ADA'] ? new BigNumber(balances['ADA']) : null}
                totalRewards={new BigNumber(stakingInfo.rewards)}
                totalDelegated={new BigNumber(stakingInfo.amount)}
                onWithdraw={() => setShowWithdrawalDialog(!showWithdrawalDialog)}
                disableWithdraw={wallet.isReadOnly}
              />
            ) : (
              <UserSummary
                totalAdaSum={balances['ADA'] ? new BigNumber(balances['ADA']) : null}
                totalRewards={null}
                totalDelegated={null}
                onWithdraw={() => setShowWithdrawalDialog(!showWithdrawalDialog)}
                disableWithdraw
              />
            )}
          </Row>

          {!UI_V2 && (
            <VotingBanner
              onPress={() =>
                navigation.navigate('app-root', {
                  screen: 'catalyst-router',
                  params: {
                    screen: 'catalyst-landing',
                  },
                })
              }
            />
          )}

          {stakingInfo?.status === 'registered' && (
            <Row>
              <StakePoolInfos />
            </Row>
          )}
        </ScrollView>

        <Actions>
          <Button
            onPress={() => {
              if (UI_V2) {
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
              } else {
                navigation.navigate('app-root', {
                  screen: 'main-wallet-routes',
                  params: {
                    screen: 'staking-center',
                    params: {
                      screen: 'staking-center-main',
                    },
                  },
                })
              }
            }}
            title={intl.formatMessage(messages.stakingCenterButton)}
            disabled={wallet.isReadOnly}
            shelleyTheme
            block
          />
        </Actions>
      </View>

      {stakingInfo?.status === 'staked' && showWithdrawalDialog && (
        <WithdrawStakingRewards
          onCancel={() => setShowWithdrawalDialog(false)}
          onSuccess={() => navigation.reset(txHistoryRoute as any)}
        />
      )}
    </View>
  )
}

const Row = ({style, ...props}: ViewProps) => <View {...props} style={[style, styles.row]} />

const SyncErrorBanner = ({showRefresh}: Record<string, unknown> /* TODO: type */) => {
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
  const [currentTime, setCurrentTime] = React.useState(() => new Date())
  React.useEffect(() => {
    const id = setInterval(() => setCurrentTime(new Date()), 1000)

    return () => clearInterval(id)
  }, [])

  return currentTime
}

const EpochInfo = () => {
  const currentTime = useCurrentTime()
  const wallet = useSelectedWallet()
  const config = getCardanoBaseConfig(getCardanoNetworkConfigById(wallet.networkId, wallet.provider))

  const toRelativeSlotNumberFn = genToRelativeSlotNumber(config)
  const timeToSlotFn = genTimeToSlot(config)

  const currentAbsoluteSlot = timeToSlotFn({
    time: currentTime,
  })

  const currentRelativeTime = toRelativeSlotNumberFn(
    timeToSlotFn({
      time: new Date(),
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

const Actions = (props) => <View {...props} style={styles.actions} />

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

const useBalances = (_wallet: YoroiWallet) => {
  const multitoken = useSelector(tokenBalanceSelector)

  return multitoken.values.reduce(
    (result, token) => ({
      ...result,
      [token.identifier === '' ? 'ADA' : token.identifier]: token.amount.toString(),
    }),
    {},
  )
}

const txHistoryRoute = {
  index: 0,
  routes: [
    {
      name: 'app-root',
      state: {
        routes: [
          {name: 'wallet-selection'},
          {
            name: 'main-wallet-routes',
            state: {
              routes: [
                {
                  name: 'history',
                  state: {
                    routes: [{name: 'history-list'}],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
}
