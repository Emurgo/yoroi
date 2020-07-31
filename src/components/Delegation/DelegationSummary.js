// @flow

import React from 'react'
import type {ComponentType} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {View, ScrollView, RefreshControl} from 'react-native'
import {SafeAreaView, withNavigation, NavigationEvents} from 'react-navigation'
import {BigNumber} from 'bignumber.js'
import {injectIntl, defineMessages} from 'react-intl'

import {Banner, OfflineBanner, StatusBar, WarningBanner} from '../UiKit'
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
} from '../../helpers/timeUtils'
import {fetchAccountState} from '../../actions/account'
import {fetchUTXOs} from '../../actions/utxo'
import {fetchPoolInfo} from '../../actions/pools'
import {checkForFlawedWallets} from '../../actions'
import {JORMUN_WALLET_ROUTES, WALLET_INIT_ROUTES} from '../../RoutesList'
import walletManager from '../../crypto/wallet'
import globalMessages from '../../i18n/global-messages'
import {formatAdaWithText, formatAdaInteger} from '../../utils/format'
import FlawedWalletScreen from './FlawedWalletScreen'
import {getReputation} from '../../api/jormungandr/api'
import {Logger} from '../../utils/logging'

import infoIcon from '../../assets/img/icon/info-light-green.png'
import styles from './styles/DelegationSummary.style'

import type {Navigation} from '../../types/navigation'
import type {
  PoolTuples,
  RemotePoolMetaSuccess,
  RawUtxo,
  ReputationResponse,
} from '../../types/HistoryTransaction'

const warningBannerMessages = defineMessages({
  title: {
    id: 'components.delegationsummary.warningbanner.title',
    defaultMessage: '!!!Note:',
  },
  message: {
    id: 'components.delegationsummary.warningbanner.message',
    defaultMessage:
      '!!!The last ITN rewards were distributed on epoch 190. ' +
      'Rewards can be claimed on mainnet once Shelley is released on mainnet.',
  },
  message2: {
    id: 'components.delegationsummary.warningbanner.message2',
    defaultMessage:
      '!!!Your ITN wallet rewards and balance may not be correctly displayed,' +
      'but this information is still securely stored in the ITN blockchain.',
  },
})

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
  pools: ?Array<PoolTuples>,
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

class DelegationSummary extends React.Component<Props, State> {
  state = {
    currentTime: new Date(),
  }

  _firstFocus = true
  _isDelegating = false
  _poolsReputation: ReputationResponse = {}

  async componentDidMount() {
    this.intervalId = setInterval(
      () =>
        this.setState({
          currentTime: new Date(),
        }),
      1000,
    )
    this.props.checkForFlawedWallets()
    // wrap with try/catch to avoid unnecessary error prompt
    try {
      this._poolsReputation = await getReputation()
    } catch (e) {
      Logger.warn(e.message)
    }
  }

  componentDidUpdate(prevProps) {
    // data from the server is obtained in this order:
    //   - fetchAccountState: account state provides pool list, this is done
    //     inside AccountAutoRefresher component
    //   - fetchPoolInfo: only after getting account state (and pool id), we
    //     fetch detailed pool info

    // update pool info only when pool list gets updated
    if (prevProps.pools !== this.props.pools && this.props.pools != null) {
      // note: even if pools != null, we can have pools = []
      if (this.props.pools.length > 0) this._isDelegating = true
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
    navigation.navigate(JORMUN_WALLET_ROUTES.STAKING_CENTER, {
      approxAdaToDelegate,
      poolList,
      utxos,
      valueInAccount: accountBalance,
      poolsReputation: this._poolsReputation,
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
      intl,
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
      fetchUTXOs,
      isFetchingUtxos,
      isFlawedWallet,
      navigation,
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
            <WarningBanner
              title={intl
                .formatMessage(warningBannerMessages.title)
                .toUpperCase()}
              icon={infoIcon}
              message={`${intl.formatMessage(
                warningBannerMessages.message,
              )}\n${intl.formatMessage(warningBannerMessages.message2)}`}
              style={styles.itemTopMargin}
            />
            {!this._isDelegating && <NotDelegatedInfo />}
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
          {/* disable button by default as ITN is over */}
          <DelegationNavigationButtons
            onPress={this.navigateToStakingCenter}
            disabled
          />
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
  )(DelegationSummary): ComponentType<ExternalProps>),
)
