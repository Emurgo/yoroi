// @flow

import React from 'react'
import type {ComponentType} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {View, ScrollView, RefreshControl, Platform} from 'react-native'
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
import WithdrawalDialog from './WithdrawalDialog'
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
  isHWSelector,
  hwDeviceInfoSelector,
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
import {setLedgerDeviceId, setLedgerDeviceObj} from '../../actions/hwWallet'
import {checkForFlawedWallets} from '../../actions'
import {DELEGATION_ROUTES, WALLET_INIT_ROUTES} from '../../RoutesList'
import walletManager from '../../crypto/walletManager'
import globalMessages from '../../i18n/global-messages'
import {formatAdaWithText, formatAdaInteger} from '../../utils/format'
import FlawedWalletScreen from './FlawedWalletScreen'
import {CONFIG} from '../../config/config'
import {WITHDRAWAL_DIALOG_STEPS, type WithdrawalDialogSteps} from './types'
import {HaskellShelleyTxSignRequest} from '../../crypto/shelley/HaskellShelleyTxSignRequest'

import styles from './styles/DelegationSummary.style'

import type {Navigation} from '../../types/navigation'
import type {RemotePoolMetaSuccess, RawUtxo} from '../../api/types'
import type {
  HWDeviceInfo,
  DeviceObj,
  DeviceId,
} from '../../crypto/shelley/ledgerUtils'

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
  setLedgerDeviceId: (DeviceId) => Promise<void>,
  setLedgerDeviceObj: (DeviceObj) => Promise<void>,
  isFlawedWallet: boolean,
  isHW: boolean,
  hwDeviceInfo: HWDeviceInfo,
|}

type State = {|
  +currentTime: Date,
  withdrawalDialogStep: WithdrawalDialogSteps,
  useUSB: boolean,
|}

class StakingDashboard extends React.Component<Props, State> {
  state = {
    currentTime: new Date(),
    withdrawalDialogStep: WITHDRAWAL_DIALOG_STEPS.CLOSED,
    useUSB: false,
  }

  _firstFocus: boolean = true
  _isDelegating: boolean = false

  _shouldDeregister: boolean = false

  // TODO: these should be state variables
  _withdrawals: Array<{|
    address: string,
    amount: BigNumber,
  |}> = []

  _deregistrations: ?Array<{|
    rewardAddress: string,
    refund: BigNumber,
  |}> = null

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

  /* withdrawal logic */

  openWithdrawalDialog: () => void
  openWithdrawalDialog = () =>
    this.setState({
      withdrawalDialogStep: WITHDRAWAL_DIALOG_STEPS.WARNING,
    })

  onKeepOrDeregisterKey: (Object, boolean) => Promise<void>
  onKeepOrDeregisterKey = async (event, shouldDeregister) => {
    this._shouldDeregister = shouldDeregister
    if (
      this.props.isHW &&
      Platform.OS === 'android' &&
      CONFIG.HARDWARE_WALLETS.LEDGER_NANO.ENABLE_USB_TRANSPORT
    ) {
      // toggle ledger transport switch modal
      this.setState({
        withdrawalDialogStep: WITHDRAWAL_DIALOG_STEPS.CHOOSE_TRANSPORT,
      })
    } else {
      await this.createWithdrawalTx()
    }
  }

  /* create withdrawal tx and move to confirm */
  createWithdrawalTx: () => Promise<void>
  createWithdrawalTx = async () => {
    const {utxos} = this.props
    if (utxos == null) return // should never happen
    try {
      const unsignedTx = await walletManager.createWithdrawalTx(
        utxos,
        this._shouldDeregister,
      )
      if (unsignedTx instanceof HaskellShelleyTxSignRequest) {
        this._withdrawals = await unsignedTx.withdrawals()
        this._deregistrations = await unsignedTx.keyDeregistrations()
        this.setState({
          withdrawalDialogStep: WITHDRAWAL_DIALOG_STEPS.CONFIRM,
        })
      } else {
        throw new Error('unexpected withdrawal tx type')
      }
    } catch (e) {}
  }

  openLedgerConnect: () => void
  openLedgerConnect = () =>
    this.setState({
      withdrawalDialogStep: WITHDRAWAL_DIALOG_STEPS.LEDGER_CONNECT,
    })

  onChooseTransport: (Object, boolean) => Promise<void>
  onChooseTransport = async (event, useUSB) => {
    const {hwDeviceInfo} = this.props
    this.setState({useUSB})
    if (
      (useUSB && hwDeviceInfo.hwFeatures.deviceObj == null) ||
      (!useUSB && hwDeviceInfo.hwFeatures.deviceId == null)
    ) {
      this.openLedgerConnect()
    } else {
      await this.createWithdrawalTx()
    }
  }

  onConnectUSB: () => Promise<void>
  onConnectUSB = async (deviceObj) => {
    await this.props.setLedgerDeviceObj(deviceObj)
    await this.createWithdrawalTx()
  }

  onConnectBLE: () => Promise<void>
  onConnectBLE = async (deviceId) => {
    await this.props.setLedgerDeviceId(deviceId)
    await this.createWithdrawalTx()
  }

  closeWithdrawalDialog: () => void
  closeWithdrawalDialog = () =>
    this.setState({
      withdrawalDialogStep: WITHDRAWAL_DIALOG_STEPS.CLOSED,
    })

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
    const config = [
      {
        StartAt: CONFIG.NETWORKS.BYRON_MAINNET.START_AT,
        GenesisDate: CONFIG.NETWORKS.BYRON_MAINNET.GENESIS_DATE,
        SlotsPerEpoch: CONFIG.NETWORKS.BYRON_MAINNET.SLOTS_PER_EPOCH,
        SlotDuration: CONFIG.NETWORKS.BYRON_MAINNET.SLOT_DURATION,
      },
      {
        StartAt: CONFIG.NETWORKS.HASKELL_SHELLEY.START_AT,
        GenesisDate: CONFIG.NETWORKS.HASKELL_SHELLEY.GENESIS_DATE,
        SlotsPerEpoch: CONFIG.NETWORKS.HASKELL_SHELLEY.SLOTS_PER_EPOCH,
        SlotDuration: CONFIG.NETWORKS.HASKELL_SHELLEY.SLOT_DURATION,
      },
    ]
    const toRelativeSlotNumberFn = genToRelativeSlotNumber(config)
    const timeToSlotFn = genTimeToSlot(config)

    const currentAbsoluteSlot = timeToSlotFn({
      time: this.state.currentTime,
    })

    const currentRelativeTime = toRelativeSlotNumberFn(
      timeToSlotFn({
        time: new Date(),
      }).slot,
    )
    const epochLength = genCurrentEpochLength(config)()
    const slotLength = genCurrentSlotLength(config)()

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
                /* eslint-enable indent */
              }
              onWithdraw={this.openWithdrawalDialog}
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

        <WithdrawalDialog
          step={this.state.withdrawalDialogStep}
          onKeepKey={(event) => this.onKeepOrDeregisterKey(event, false)}
          onDeregisterKey={(event) => this.onKeepOrDeregisterKey(event, true)}
          onChooseTransport={this.onChooseTransport}
          useUSB={this.state.useUSB}
          onConnectBLE={this.onConnectBLE}
          onConnectUSB={this.onConnectUSB}
          withdrawals={this._withdrawals}
          deregistrations={this._deregistrations}
          onConfirm={() => ({})}
          onRequestClose={this.closeWithdrawalDialog}
        />
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
        isHW: isHWSelector(state),
        hwDeviceInfo: hwDeviceInfoSelector(state),
      }),
      {
        fetchPoolInfo,
        fetchAccountState,
        fetchUTXOs,
        checkForFlawedWallets,
        setLedgerDeviceId,
        setLedgerDeviceObj,
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
