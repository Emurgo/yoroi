// @flow

import React from 'react'
import type {ComponentType} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {View, ScrollView} from 'react-native'
import {SafeAreaView, withNavigation} from 'react-navigation'
import {BigNumber} from 'bignumber.js'
import {injectIntl} from 'react-intl'

import {Banner, OfflineBanner, StatusBar, PleaseWaitModal} from '../UiKit'
import {
  EpochProgress,
  UpcomingRewardInfo,
  UserSummary,
  DelegatedStakepoolInfo,
  NotDelegatedInfo,
} from './dashboard'
import {
  isSynchronizingHistorySelector,
  lastHistorySyncErrorSelector,
  isOnlineSelector,
  walletNameSelector,
  utxoBalanceSelector,
  utxosSelector,
  accountBalanceSelector,
  isFetchingAccountStateSelector,
  isFetchingUtxosSelector,
  poolsSelector,
  poolInfoSelector,
  totalDelegatedSelector,
} from '../../selectors'
import DelegationNavigationButtons from './DelegationNavigationButtons'
import UtxoAutoRefresher from '../Send/UtxoAutoRefresher'
import AccountAutoRefresher from './AccountAutoRefresher'
import {withNavigationTitle} from '../../utils/renderUtils'
import {
  genToRelativeSlotNumber,
  genCurrentEpochLength,
  genCurrentSlotLength,
  genTimeToSlot,
} from '../../helpers/timeUtils'
import {fetchPoolInfo} from '../../actions/pools'
import {SHELLEY_WALLET_ROUTES} from '../../RoutesList'
import walletManager from '../../crypto/wallet'
import globalMessages from '../../i18n/global-messages'
import {formatAdaWithText, formatAdaInteger} from '../../utils/format'

import styles from './styles/DelegationSummary.style'

import type {Navigation} from '../../types/navigation'
import type {
  PoolTuples,
  RemotePoolMetaSuccess,
  RawUtxo,
} from '../../types/HistoryTransaction'

const SyncErrorBanner = injectIntl(({intl, showRefresh}) => (
  <Banner
    error
    text={
      showRefresh
        ? intl.formatMessage(globalMessages.syncErrorBannerTextWithRefresh)
        : intl.formatMessage(globalMessages.syncErrorBannerTextWithoutRefresh)
    }
  />
))

type Props = {
  intl: any,
  navigation: Navigation,
  isSyncing: boolean,
  isOnline: boolean,
  lastSyncError: any,
  utxoBalance: ?BigNumber,
  utxos: ?Array<RawUtxo>,
  accountBalance: ?BigNumber,
  isFetchingAccountState: boolean,
  isFetchingUtxos: boolean,
  pools: ?Array<PoolTuples>,
  fetchPoolInfo: () => any,
  poolInfo: ?RemotePoolMetaSuccess,
  totalDelegated: BigNumber,
}

type State = {
  +currentTime: Date,
}

class DelegationSummary extends React.Component<Props, State> {
  state = {
    currentTime: new Date(),
  }

  componentDidMount() {
    this.intervalId = setInterval(
      () =>
        this.setState({
          currentTime: new Date(),
        }),
      1000,
    )
    this.props.fetchPoolInfo()
  }

  componentDidUpdate(prevProps) {
    // update pool info only when pool list gets updated and only once
    if (
      prevProps.pools == null &&
      this.props.pools != null &&
      this.props.poolInfo == null
    ) {
      this.props.fetchPoolInfo()
    }
  }

  componentWillUnmount() {
    if (this.intervalId != null) clearInterval(this.intervalId)
  }

  intervalId: void | IntervalID

  navigateToStakingCenter: () => void
  navigateToStakingCenter = async () => {
    const {navigation, utxos, pools, accountBalance} = this.props
    /* eslint-disable indent */
    const utxosForKey =
      utxos != null ? await walletManager.getAllUtxosForKey(utxos) : null
    const amountToDelegate =
      utxosForKey != null
        ? utxosForKey
            .map((utxo) => utxo.amount)
            .reduce(
              (x: BigNumber, y) => x.plus(new BigNumber(y || 0)),
              new BigNumber(0),
            )
        : BigNumber(0)
    const poolList = pools != null ? pools.map((pool) => pool[0]) : []
    /* eslint-enable indent */
    const approxAdaToDelegate = formatAdaInteger(amountToDelegate)
    navigation.navigate(SHELLEY_WALLET_ROUTES.STAKING_CENTER, {
      approxAdaToDelegate,
      poolList,
      utxos,
      valueInAccount: accountBalance,
    })
  }

  render() {
    const {
      isOnline,
      isSyncing,
      lastSyncError,
      utxoBalance,
      accountBalance,
      pools,
      poolInfo,
      totalDelegated,
      intl,
      isFetchingAccountState,
      isFetchingUtxos,
    } = this.props

    const totalBalance =
      utxoBalance != null && accountBalance != null
        ? utxoBalance.plus(accountBalance)
        : null

    const toRelativeSlotNumber = genToRelativeSlotNumber()
    const timeToSlot = genTimeToSlot()

    const currentAbsoluteSlot = timeToSlot({
      time: this.state.currentTime,
    })

    const currentRelativeTime = toRelativeSlotNumber(
      timeToSlot({
        time: new Date(),
      }).slot,
    )
    const epochLength = genCurrentEpochLength()()
    const slotLength = genCurrentSlotLength()()

    const secondsLeftInEpoch =
      (epochLength - currentRelativeTime.slot) * slotLength
    const timeLeftInEpoch = new Date(
      1000 * secondsLeftInEpoch - currentAbsoluteSlot.msIntoSlot,
    )

    const leftPadDate: (number) => string = (num) => {
      if (num < 10) return `0${num}`
      return num.toString()
    }

    return (
      <SafeAreaView style={styles.scrollView}>
        <StatusBar type="dark" />
        <UtxoAutoRefresher />
        <AccountAutoRefresher />
        <View style={styles.container}>
          <OfflineBanner />
          {isOnline &&
            lastSyncError && <SyncErrorBanner showRefresh={!isSyncing} />}

          <ScrollView style={styles.inner}>
            {poolInfo == null && <NotDelegatedInfo />}
            <EpochProgress
              percentage={Math.floor(
                (100 * currentRelativeTime.slot) / epochLength,
              )}
              currentEpoch={currentRelativeTime.epoch}
              endTime={{
                h: leftPadDate(timeLeftInEpoch.getUTCHours()),
                m: leftPadDate(timeLeftInEpoch.getUTCMinutes()),
                s: leftPadDate(timeLeftInEpoch.getUTCSeconds()),
              }}
            />
            {/* eslint-disable indent */
            poolInfo != null && (
              /* TODO */
              <UpcomingRewardInfo
                nextRewardText={null}
                followingRewardText={null}
                showDisclaimer
              />
            )
            /* eslint-enable indent */
            }
            <UserSummary
              totalAdaSum={
                totalBalance != null ? formatAdaWithText(totalBalance) : '-'
              }
              totalRewards={
                accountBalance != null ? formatAdaWithText(accountBalance) : '-'
              }
              totalDelegated={
                /* eslint-disable indent */
                poolInfo !== null && totalDelegated !== null
                  ? formatAdaWithText(totalDelegated)
                  : formatAdaWithText(new BigNumber(0))
              }
              /* eslint-enable indent */
            />
            {/* eslint-disable indent */
            poolInfo != null &&
              !!pools && (
                <DelegatedStakepoolInfo
                  poolTicker={poolInfo.info?.ticker}
                  poolName={poolInfo.info?.name}
                  poolHash={
                    pools.length > 0 && pools[0].length > 0 ? pools[0][0] : ''
                  }
                  poolURL={poolInfo.info?.homepage}
                />
              )
            /* eslint-enable indent */
            }
          </ScrollView>
          <PleaseWaitModal
            title=""
            spinnerText={intl.formatMessage(globalMessages.pleaseWait)}
            visible={isFetchingAccountState || isFetchingUtxos}
          />
          <DelegationNavigationButtons onPress={this.navigateToStakingCenter} />
        </View>
      </SafeAreaView>
    )
  }
}

type ExternalProps = {|
  navigation: Navigation,
  intl: any,
|}

export default injectIntl(
  (compose(
    connect(
      (state) => ({
        utxoBalance: utxoBalanceSelector(state),
        utxos: utxosSelector(state),
        accountBalance: accountBalanceSelector(state),
        isFetchingAccountState: isFetchingAccountStateSelector(state),
        isFetchingUtxos: isFetchingUtxosSelector(state),
        pools: poolsSelector(state),
        poolInfo: poolInfoSelector(state),
        totalDelegated: totalDelegatedSelector(state),
        isSyncing: isSynchronizingHistorySelector(state),
        lastSyncError: lastHistorySyncErrorSelector(state),
        isOnline: isOnlineSelector(state),
        walletName: walletNameSelector(state),
      }),
      {
        fetchPoolInfo,
      },
    ),
    withNavigation,
    withNavigationTitle(({walletName}) => walletName),
  )(DelegationSummary): ComponentType<ExternalProps>),
)
