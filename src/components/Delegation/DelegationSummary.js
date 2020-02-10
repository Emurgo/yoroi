// @flow

import React from 'react'
import type {ComponentType} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {View, ScrollView, RefreshControl, Platform} from 'react-native'
import {SafeAreaView, withNavigation, NavigationEvents} from 'react-navigation'
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
  isOnlineSelector,
  walletNameSelector,
  utxoBalanceSelector,
  utxosSelector,
  accountBalanceSelector,
  isFetchingAccountStateSelector,
  isFetchingUtxosSelector,
  poolsSelector,
  poolInfoSelector,
  isFetchingPoolInfoSelector,
  totalDelegatedSelector,
  lastAccountStateFetchErrorSelector,
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
import {fetchAccountState} from '../../actions/account'
import {fetchUTXOs} from '../../actions/utxo'
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
  isOnline: boolean,
  utxoBalance: ?BigNumber,
  utxos: ?Array<RawUtxo>,
  accountBalance: ?BigNumber,
  isFetchingAccountState: boolean,
  isFetchingUtxos: boolean,
  pools: ?Array<PoolTuples>,
  fetchPoolInfo: () => any,
  isFetchingPoolInfo: boolean,
  fetchAccountState: () => any,
  poolInfo: ?RemotePoolMetaSuccess,
  totalDelegated: BigNumber,
  lastAccountStateSyncError: any,
}

type State = {
  +currentTime: Date,
}

class DelegationSummary extends React.Component<Props, State> {
  state = {
    currentTime: new Date(),
  }

  _firstFocus = true

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
    // update pool info only when pool list gets updated
    if (prevProps.pools !== this.props.pools && this.props.pools != null) {
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

  handleDidFocus = () => {
    if (this._firstFocus) {
      this._firstFocus = false
      // skip first focus to avoid
      // didMount -> refetch -> done -> didFocus -> refetch
      // blinking
      return
    }
    this.props.fetchPoolInfo()
  }

  render() {
    const {
      isOnline,
      utxoBalance,
      accountBalance,
      pools,
      poolInfo,
      isFetchingPoolInfo,
      totalDelegated,
      fetchAccountState,
      isFetchingAccountState,
      lastAccountStateSyncError,
      isFetchingUtxos,
      intl,
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
          {/* eslint-disable indent */
          isOnline &&
            lastAccountStateSyncError && (
              <SyncErrorBanner
                showRefresh={!(isFetchingAccountState || isFetchingUtxos)}
              />
            )
          /* eslint-enable indent */
          }
          <ScrollView
            style={styles.inner}
            refreshControl={
              <RefreshControl
                onRefresh={fetchAccountState}
                refreshing={
                  isFetchingAccountState ||
                  isFetchingUtxos ||
                  isFetchingPoolInfo
                }
              />
            }
          >
            {(isFetchingAccountState ||
              isFetchingPoolInfo ||
              poolInfo == null) && <NotDelegatedInfo />}
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
          <DelegationNavigationButtons
            onPress={this.navigateToStakingCenter}
            disabled={isFetchingAccountState || isFetchingUtxos}
          />
          {Platform.OS === 'ios' && (
            /* note(v-almonacid): for some reason refreshControl's wheel is not
            /* shown on iOS, so I add a waiting dialog */
            <PleaseWaitModal
              title={''}
              spinnerText={intl.formatMessage(globalMessages.pleaseWait)}
              visible={
                isFetchingAccountState || isFetchingUtxos || isFetchingPoolInfo
              }
            />
          )}
        </View>
        <NavigationEvents onDidFocus={this.handleDidFocus} />
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
        isFetchingUtxos: isFetchingUtxosSelector(state),
        accountBalance: accountBalanceSelector(state),
        isFetchingAccountState: isFetchingAccountStateSelector(state),
        lastAccountStateSyncError: lastAccountStateFetchErrorSelector(state),
        pools: poolsSelector(state),
        poolInfo: poolInfoSelector(state),
        isFetchingPoolInfo: isFetchingPoolInfoSelector(state),
        totalDelegated: totalDelegatedSelector(state),
        isOnline: isOnlineSelector(state),
        walletName: walletNameSelector(state),
      }),
      {
        fetchPoolInfo,
        fetchAccountState,
        fetchUTXOs,
      },
    ),
    withNavigation,
    withNavigationTitle(({walletName}) => walletName),
  )(DelegationSummary): ComponentType<ExternalProps>),
)
