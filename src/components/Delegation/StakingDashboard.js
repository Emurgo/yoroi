// @flow

import React from 'react'
import type {ComponentType} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {View, ScrollView, RefreshControl} from 'react-native'
import {SafeAreaView, withNavigation, NavigationEvents} from 'react-navigation'
import {BigNumber} from 'bignumber.js'
import {injectIntl} from 'react-intl'

import {Banner, OfflineBanner, StatusBar} from '../UiKit'
import {
  EpochProgress,
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
  poolOperatorSelector,
  poolInfoSelector,
  isFetchingPoolInfoSelector,
  totalDelegatedSelector,
  lastAccountStateFetchErrorSelector,
  isFlawedWalletSelector,
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
} from '../../utils/timeUtils'
import {fetchAccountState} from '../../actions/account'
import {fetchUTXOs} from '../../actions/utxo'
import {fetchPoolInfo} from '../../actions/pools'
import {checkForFlawedWallets} from '../../actions'
import {DELEGATION_ROUTES, WALLET_INIT_ROUTES} from '../../RoutesList'
import walletManager from '../../crypto/walletManager'
import globalMessages from '../../i18n/global-messages'
import {formatAdaWithText, formatAdaInteger} from '../../utils/format'
import FlawedWalletScreen from './FlawedWalletScreen'
import {CONFIG} from '../../config/config'

import styles from './styles/DelegationSummary.style'

import type {Navigation} from '../../types/navigation'
import type {RemotePoolMetaSuccess, RawUtxo} from '../../api/types'

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

type Props = {|
  intl: any,
  navigation: Navigation,
  isOnline: boolean,
  utxoBalance: ?BigNumber,
  utxos: ?Array<RawUtxo>,
  accountBalance: ?BigNumber,
  isFetchingAccountState: boolean,
  fetchUTXOs: () => any,
  isFetchingUtxos: boolean,
  poolOperator: string,
  fetchPoolInfo: () => any,
  isFetchingPoolInfo: boolean,
  fetchAccountState: () => any,
  poolInfo: ?RemotePoolMetaSuccess,
  totalDelegated: BigNumber,
  lastAccountStateSyncError: any,
  checkForFlawedWallets: () => any,
  isFlawedWallet: boolean,
|}

type State = {
  +currentTime: Date,
}

class StakingDashboard extends React.Component<Props, State> {
  state = {
    currentTime: new Date(),
  }

  _firstFocus = true
  _isDelegating = false

  componentDidMount() {
    this.intervalId = setInterval(
      () =>
        this.setState({
          currentTime: new Date(),
        }),
      1000,
    )
    this.props.checkForFlawedWallets()
  }

  componentDidUpdate(prevProps) {
    // data from the server is obtained in this order:
    //   - fetchAccountState: account state provides pool list, this is done
    //     inside AccountAutoRefresher component
    //   - fetchPoolInfo: only after getting account state (and pool id), we
    //     fetch detailed pool info

    // update pool info only when pool list gets updated
    if (
      prevProps.poolOperator !== this.props.poolOperator &&
      this.props.poolOperator != null
    ) {
      this._isDelegating = true
      this.props.fetchPoolInfo()
    }
  }

  componentWillUnmount() {
    if (this.intervalId != null) clearInterval(this.intervalId)
  }

  intervalId: void | IntervalID

  navigateToStakingCenter: () => void
  navigateToStakingCenter = async () => {
    const {navigation, utxos, poolOperator, accountBalance} = this.props
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
    const poolList = poolOperator != null ? [poolOperator] : []
    /* eslint-enable indent */
    const approxAdaToDelegate = formatAdaInteger(amountToDelegate)
    navigation.navigate(DELEGATION_ROUTES.STAKING_CENTER, {
      approxAdaToDelegate,
      poolList,
      utxos,
      valueInAccount: accountBalance,
    })
  }

  handleDidFocus: () => void
  handleDidFocus = () => {
    if (this._firstFocus) {
      this._firstFocus = false
      // skip first focus to avoid
      // didMount -> fetchPoolInfo -> done -> didFocus -> fetchPoolInfo
      // blinking
      return
    }
    this.props.checkForFlawedWallets()
  }

  render() {
    const {
      isOnline,
      utxoBalance,
      accountBalance,
      poolOperator,
      poolInfo,
      isFetchingPoolInfo,
      totalDelegated,
      fetchAccountState,
      isFetchingAccountState,
      lastAccountStateSyncError,
      fetchUTXOs,
      isFetchingUtxos,
      isFlawedWallet,
      navigation,
    } = this.props

    // TODO: shouldn't be haskell-shelley specific
    const config = {
      StartAt: CONFIG.NETWORKS.HASKELL_SHELLEY.START_AT,
      GenesisDate: CONFIG.NETWORKS.HASKELL_SHELLEY.GENESIS_DATE,
      SlotsPerEpoch: CONFIG.NETWORKS.HASKELL_SHELLEY.SLOTS_PER_EPOCH,
      SlotDuration: CONFIG.NETWORKS.HASKELL_SHELLEY.SLOT_DURATION,
    }
    const toRelativeSlotNumberFn = genToRelativeSlotNumber([config])
    const timeToSlotFn = genTimeToSlot([config])

    const currentAbsoluteSlot = timeToSlotFn({
      time: this.state.currentTime,
    })

    const currentRelativeTime = toRelativeSlotNumberFn(
      timeToSlotFn({
        time: new Date(),
      }).slot,
    )
    const epochLength = genCurrentEpochLength([config])()
    const slotLength = genCurrentSlotLength([config])()

    const secondsLeftInEpoch =
      (epochLength - currentRelativeTime.slot) * slotLength
    const timeLeftInEpoch = new Date(
      1000 * secondsLeftInEpoch - currentAbsoluteSlot.msIntoSlot,
    )

    const leftPadDate: (number) => string = (num) => {
      if (num < 10) return `0${num}`
      return num.toString()
    }

    if (isFlawedWallet === true) {
      return (
        <FlawedWalletScreen
          disableButtons={false}
          onPress={() =>
            navigation.navigate(WALLET_INIT_ROUTES.WALLET_SELECTION)
          }
          onRequestClose={() =>
            navigation.navigate(WALLET_INIT_ROUTES.WALLET_SELECTION)
          }
        />
      )
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
                onRefresh={() =>
                  Promise.all([fetchUTXOs(), fetchAccountState()])
                }
                refreshing={
                  isFetchingAccountState ||
                  isFetchingUtxos ||
                  isFetchingPoolInfo
                }
              />
            }
          >
            {!this._isDelegating && <NotDelegatedInfo />}
            <EpochProgress
              percentage={Math.floor(
                (100 * currentRelativeTime.slot) / epochLength,
              )}
              currentEpoch={currentRelativeTime.epoch}
              endTime={{
                d: leftPadDate(Math.floor(secondsLeftInEpoch / (3600 * 24))),
                h: leftPadDate(timeLeftInEpoch.getUTCHours()),
                m: leftPadDate(timeLeftInEpoch.getUTCMinutes()),
                s: leftPadDate(timeLeftInEpoch.getUTCSeconds()),
              }}
            />
            <UserSummary
              totalAdaSum={
                utxoBalance != null ? formatAdaWithText(utxoBalance) : '-'
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
              !!poolOperator && (
                <DelegatedStakepoolInfo
                  poolTicker={poolInfo.info?.ticker}
                  poolName={poolInfo.info?.name}
                  poolHash={poolOperator != null ? poolOperator : ''}
                  poolURL={poolInfo.info?.homepage}
                />
              )
            /* eslint-enable indent */
            }
          </ScrollView>
          {/* disable button by default as ITN is over */}
          <DelegationNavigationButtons onPress={this.navigateToStakingCenter} />
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
        poolOperator: poolOperatorSelector(state),
        poolInfo: poolInfoSelector(state),
        isFetchingPoolInfo: isFetchingPoolInfoSelector(state),
        totalDelegated: totalDelegatedSelector(state),
        isOnline: isOnlineSelector(state),
        walletName: walletNameSelector(state),
        isFlawedWallet: isFlawedWalletSelector(state),
      }),
      {
        fetchPoolInfo,
        fetchAccountState,
        fetchUTXOs,
        checkForFlawedWallets,
      },
      (state, dispatchProps, ownProps) => ({
        ...state,
        ...dispatchProps,
        ...ownProps,
      }),
    ),
    withNavigation,
    withNavigationTitle(({walletName}) => walletName),
  )(StakingDashboard): ComponentType<ExternalProps>),
)
