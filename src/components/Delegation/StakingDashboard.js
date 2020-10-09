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
import ErrorModal from '../Common/ErrorModal'
import LocalizableError from '../../i18n/LocalizableError'
import {
  isOnlineSelector,
  walletNameSelector,
  utxoBalanceSelector,
  utxosSelector,
  accountBalanceSelector,
  isDelegatingSelector,
  isFetchingAccountStateSelector,
  isFetchingUtxosSelector,
  poolOperatorSelector,
  poolInfoSelector,
  isFetchingPoolInfoSelector,
  totalDelegatedSelector,
  lastAccountStateFetchErrorSelector,
  isFlawedWalletSelector,
  isHWSelector,
  easyConfirmationSelector,
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
import {
  checkForFlawedWallets,
  submitDelegationTx,
  submitSignedTx,
  showErrorDialog,
} from '../../actions'
import {
  DELEGATION_ROUTES,
  SEND_ROUTES,
  WALLET_INIT_ROUTES,
  WALLET_ROUTES,
} from '../../RoutesList'
import {NetworkError, ApiError} from '../../api/errors'
import {WrongPassword} from '../../crypto/errors'
import walletManager, {SystemAuthDisabled} from '../../crypto/walletManager'
import globalMessages, {errorMessages} from '../../i18n/global-messages'
import {formatAdaInteger} from '../../utils/format'
import FlawedWalletScreen from './FlawedWalletScreen'
import {CONFIG} from '../../config/config'
import {WITHDRAWAL_DIALOG_STEPS, type WithdrawalDialogSteps} from './types'
import {HaskellShelleyTxSignRequest} from '../../crypto/shelley/HaskellShelleyTxSignRequest'
import KeyStore from '../../crypto/KeyStore'

import styles from './styles/DelegationSummary.style'

import type {Navigation} from '../../types/navigation'
import type {RemotePoolMetaSuccess, RawUtxo} from '../../api/types'
import type {
  HWDeviceInfo,
  DeviceObj,
  DeviceId,
} from '../../crypto/shelley/ledgerUtils'
import type {BaseSignRequest} from '../../crypto/types'

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
  isDelegating: boolean,
  isFetchingAccountState: boolean,
  fetchUTXOs: () => any,
  isFetchingUtxos: boolean,
  poolOperator: string,
  fetchPoolInfo: () => any,
  isFetchingPoolInfo: boolean,
  fetchAccountState: () => any,
  poolInfo: ?RemotePoolMetaSuccess,
  totalDelegated: ?BigNumber,
  lastAccountStateSyncError: any,
  checkForFlawedWallets: () => any,
  setLedgerDeviceId: (DeviceId) => Promise<void>,
  setLedgerDeviceObj: (DeviceObj) => Promise<void>,
  isFlawedWallet: boolean,
  isHW: boolean,
  isEasyConfirmationEnabled: boolean,
  hwDeviceInfo: HWDeviceInfo,
  submitDelegationTx: <T>(string, BaseSignRequest<T>) => Promise<void>,
  submitSignedTx: (string) => Promise<void>,
|}

type State = {|
  +currentTime: Date,
  withdrawalDialogStep: WithdrawalDialogSteps,
  useUSB: boolean,
  signTxRequest: ?HaskellShelleyTxSignRequest,
  withdrawals: ?Array<{|
    address: string,
    amount: BigNumber,
  |}>,
  deregistrations: ?Array<{|
    rewardAddress: string,
    refund: BigNumber,
  |}>,
  balance: BigNumber,
  finalBalance: BigNumber,
  fees: BigNumber,
  errorMessage: ?string,
  errorLogs: ?string,
|}

class StakingDashboard extends React.Component<Props, State> {
  state = {
    currentTime: new Date(),
    withdrawalDialogStep: WITHDRAWAL_DIALOG_STEPS.CLOSED,
    useUSB: false,
    signTxRequest: null,
    withdrawals: null,
    deregistrations: null,
    balance: new BigNumber(0),
    finalBalance: new BigNumber(0),
    fees: new BigNumber(0),
    errorMessage: null,
    errorLogs: null,
  }

  _firstFocus: boolean = true

  _shouldDeregister: boolean = false

  _intervalId: void | IntervalID = undefined

  componentDidMount() {
    this._intervalId = setInterval(
      () =>
        this.setState({
          currentTime: new Date(),
        }),
      1000,
    )
    this.props.checkForFlawedWallets()
  }

  async componentDidUpdate(prevProps) {
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
      await this.props.fetchPoolInfo()
    }
  }

  componentWillUnmount() {
    if (this._intervalId != null) clearInterval(this._intervalId)
  }

  navigateToStakingCenter: (void) => Promise<void> = async () => {
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

  handleDidFocus: (void) => void = () => {
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

  openWithdrawalDialog: () => void = () =>
    this.setState({
      withdrawalDialogStep: WITHDRAWAL_DIALOG_STEPS.WARNING,
    })

  onKeepOrDeregisterKey: (Object, boolean) => Promise<void> = async (
    event,
    shouldDeregister,
  ) => {
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
  createWithdrawalTx: () => Promise<void> = async () => {
    const {intl, utxos} = this.props
    if (utxos == null) return // should never happen
    try {
      this.setState({withdrawalDialogStep: WITHDRAWAL_DIALOG_STEPS.WAITING})
      const signTxRequest = await walletManager.createWithdrawalTx(
        utxos,
        this._shouldDeregister,
      )
      if (signTxRequest instanceof HaskellShelleyTxSignRequest) {
        const withdrawals = await signTxRequest.withdrawals()
        const deregistrations = await signTxRequest.keyDeregistrations()
        const balance = withdrawals.reduce(
          (sum, curr) => (curr.amount == null ? sum : sum.plus(curr.amount)),
          new BigNumber(0),
        )
        const fees = await signTxRequest.fee(false)
        const finalBalance = balance
          .plus(
            deregistrations.reduce(
              (sum, curr) =>
                curr.refund == null ? sum : sum.plus(curr.refund),
              new BigNumber(0),
            ),
          )
          .minus(fees)
        this.setState({
          signTxRequest,
          withdrawals,
          deregistrations,
          balance,
          finalBalance,
          fees,
          withdrawalDialogStep: WITHDRAWAL_DIALOG_STEPS.CONFIRM,
        })
      } else {
        throw new Error('unexpected withdrawal tx type')
      }
    } catch (e) {
      if (e instanceof LocalizableError) {
        this.setState({
          withdrawalDialogStep: WITHDRAWAL_DIALOG_STEPS.CLOSED,
          errorMessage: intl.formatMessage({
            id: e.id,
            defaultMessage: e.defaultMessage,
          }),
        })
      } else {
        this.setState({
          withdrawalDialogStep: WITHDRAWAL_DIALOG_STEPS.CLOSED,
          errorMessage: intl.formatMessage(errorMessages.generalError.message, {
            message: e.message,
          }),
        })
      }
    }
  }

  openLedgerConnect: () => void = () =>
    this.setState({
      withdrawalDialogStep: WITHDRAWAL_DIALOG_STEPS.LEDGER_CONNECT,
    })

  onChooseTransport: (Object, boolean) => Promise<void> = async (
    event,
    useUSB,
  ) => {
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

  onConnectUSB: (DeviceObj) => Promise<void> = async (deviceObj) => {
    await this.props.setLedgerDeviceObj(deviceObj)
    await this.createWithdrawalTx()
  }

  onConnectBLE: (DeviceId) => Promise<void> = async (deviceId) => {
    await this.props.setLedgerDeviceId(deviceId)
    await this.createWithdrawalTx()
  }

  // TODO: this code has been copy-pasted from the tx confirmation page.
  // Ideally, all this logic should be moved away and perhaps written as a
  // redux action that can be reused in all components with tx signing and sending
  onConfirm: (Object, string) => Promise<void> = async (event, password) => {
    const {signTxRequest, useUSB} = this.state
    const {
      intl,
      navigation,
      isHW,
      isEasyConfirmationEnabled,
      submitDelegationTx,
      submitSignedTx,
    } = this.props
    if (signTxRequest == null) throw new Error('no tx data')
    const signRequest = signTxRequest.signRequest

    const submitTx = async <T>(
      tx: string | BaseSignRequest<T>,
      decryptedKey: ?string,
    ) => {
      try {
        if (
          decryptedKey == null &&
          (typeof tx === 'string' || tx instanceof String)
        ) {
          await submitSignedTx(tx)
        } else if (
          decryptedKey != null &&
          !(typeof tx === 'string' || tx instanceof String)
        ) {
          await submitDelegationTx(decryptedKey, tx)
        }
        navigation.navigate(WALLET_ROUTES.TX_HISTORY)
      } catch (e) {
        if (e instanceof NetworkError) {
          this.setState({
            errorMessage: intl.formatMessage(
              errorMessages.networkError.message,
            ),
          })
        } else if (e instanceof ApiError) {
          this.setState({
            errorMessage: intl.formatMessage(errorMessages.apiError.message),
            errorLogs: JSON.stringify(e.request),
          })
        } else {
          throw e
        }
      }
    }

    if (isHW) {
      try {
        this.setState({
          withdrawalDialogStep: WITHDRAWAL_DIALOG_STEPS.WAITING_HW_RESPONSE,
        })
        if (signTxRequest == null) throw new Error('no tx data')
        const signedTx = await walletManager.signTxWithLedger(
          signTxRequest,
          useUSB,
        )
        this.setState({withdrawalDialogStep: WITHDRAWAL_DIALOG_STEPS.WAITING})
        await submitTx(Buffer.from(signedTx.encodedTx).toString('base64'))
      } catch (e) {
        if (e instanceof LocalizableError) {
          this.setState({
            errorMessage: intl.formatMessage({
              id: e.id,
              defaultMessage: e.defaultMessage,
            }),
          })
        } else {
          this.setState({
            errorMessage: intl.formatMessage(
              errorMessages.generalTxError.message,
            ),
            errorLogs: String(e.message),
          })
        }
      } finally {
        this.closeWithdrawalDialog()
      }
      return
    }

    if (isEasyConfirmationEnabled) {
      try {
        await walletManager.ensureKeysValidity()
        navigation.navigate(SEND_ROUTES.BIOMETRICS_SIGNING, {
          keyId: walletManager._id,
          onSuccess: async (decryptedKey) => {
            navigation.navigate(DELEGATION_ROUTES.STAKING_DASHBOARD)

            await submitTx(signRequest, decryptedKey)
          },
          onFail: () => navigation.goBack(),
        })
      } catch (e) {
        if (e instanceof SystemAuthDisabled) {
          await walletManager.closeWallet()
          await showErrorDialog(errorMessages.enableSystemAuthFirst, intl)
          navigation.navigate(WALLET_INIT_ROUTES.WALLET_SELECTION)

          return
        } else {
          this.setState({
            errorMessage: intl.formatMessage(
              errorMessages.generalTxError.message,
            ),
            errorLogs: String(e.message),
          })
        }
      } finally {
        this.closeWithdrawalDialog()
      }
      return
    }

    try {
      this.setState({withdrawalDialogStep: WITHDRAWAL_DIALOG_STEPS.WAITING})
      const decryptedData = await KeyStore.getData(
        walletManager._id,
        'MASTER_PASSWORD',
        '',
        password,
        intl,
      )

      await submitTx(signRequest, decryptedData)
    } catch (e) {
      if (e instanceof WrongPassword) {
        await showErrorDialog(errorMessages.incorrectPassword, intl)
      } else {
        this.setState({
          errorMessage: intl.formatMessage(
            errorMessages.generalTxError.message,
          ),
          errorLogs: String(e.message),
        })
      }
    } finally {
      this.closeWithdrawalDialog()
    }
  }

  closeWithdrawalDialog: () => void = () =>
    this.setState({
      withdrawalDialogStep: WITHDRAWAL_DIALOG_STEPS.CLOSED,
    })

  render() {
    const {
      intl,
      isOnline,
      utxoBalance,
      isDelegating,
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
            {!isDelegating && <NotDelegatedInfo />}
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
              totalAdaSum={utxoBalance}
              totalRewards={accountBalance}
              totalDelegated={totalDelegated}
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
          withdrawals={this.state.withdrawals}
          deregistrations={this.state.deregistrations}
          balance={this.state.balance}
          finalBalance={this.state.finalBalance}
          fees={this.state.fees}
          onConfirm={this.onConfirm}
          onRequestClose={this.closeWithdrawalDialog}
        />

        <ErrorModal
          visible={this.state.errorMessage != null}
          title={intl.formatMessage(
            errorMessages.generalLocalizableError.title,
          )}
          message={this.state.errorMessage}
          errorMessage={this.state.errorLogs}
          onRequestClose={() => this.setState({errorMessage: null})}
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
        isDelegating: isDelegatingSelector(state),
        isFetchingAccountState: isFetchingAccountStateSelector(state),
        lastAccountStateSyncError: lastAccountStateFetchErrorSelector(state),
        poolOperator: poolOperatorSelector(state),
        poolInfo: poolInfoSelector(state),
        isFetchingPoolInfo: isFetchingPoolInfoSelector(state),
        totalDelegated: totalDelegatedSelector(state),
        isOnline: isOnlineSelector(state),
        walletName: walletNameSelector(state),
        isFlawedWallet: isFlawedWalletSelector(state),
        isEasyConfirmationEnabled: easyConfirmationSelector(state),
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
        submitDelegationTx,
        submitSignedTx,
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
