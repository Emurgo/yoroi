// @flow

import React from 'react'
import type {ComponentType} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {
  ActivityIndicator,
  View,
  ScrollView,
  RefreshControl,
  Platform,
} from 'react-native'
import SafeAreaView from 'react-native-safe-area-view'
import {BigNumber} from 'bignumber.js'
import {injectIntl, type IntlShape} from 'react-intl'

import {Banner, OfflineBanner, StatusBar} from '../UiKit'
import {
  EpochProgress,
  UserSummary,
  DelegatedStakepoolInfo,
  NotDelegatedInfo,
} from './dashboard'
import WithdrawalDialog from './WithdrawalDialog'
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
  isReadOnlySelector,
  easyConfirmationSelector,
  hwDeviceInfoSelector,
  defaultNetworkAssetSelector,
  serverStatusSelector,
  walletMetaSelector,
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
  submitTransaction,
  submitSignedTx,
  showErrorDialog,
} from '../../actions'
import {
  DELEGATION_ROUTES,
  SEND_ROUTES,
  WALLET_ROOT_ROUTES,
  WALLET_ROUTES,
} from '../../RoutesList'
import {NetworkError, ApiError} from '../../api/errors'
import {WrongPassword} from '../../crypto/errors'
import walletManager, {SystemAuthDisabled} from '../../crypto/walletManager'
import globalMessages, {errorMessages} from '../../i18n/global-messages'
import FlawedWalletScreen from './FlawedWalletScreen'
import {CONFIG, getCardanoBaseConfig} from '../../config/config'
import {getCardanoNetworkConfigById} from '../../config/networks'
import {WITHDRAWAL_DIALOG_STEPS, type WithdrawalDialogSteps} from './types'
import {HaskellShelleyTxSignRequest} from '../../crypto/shelley/HaskellShelleyTxSignRequest'
import KeyStore from '../../crypto/KeyStore'
import {MultiToken} from '../../crypto/MultiToken'
import {ISignRequest} from '../../crypto/ISignRequest'

import styles from './styles/DelegationSummary.style'

import type {ServerStatusCache, WalletMeta} from '../../state'
import type {Navigation} from '../../types/navigation'
import type {DefaultAsset} from '../../types/HistoryTransaction'
import type {RemotePoolMetaSuccess, RawUtxo} from '../../api/types'
import type {
  HWDeviceInfo,
  DeviceObj,
  DeviceId,
} from '../../crypto/shelley/ledgerUtils'

const SyncErrorBanner = injectIntl(
  ({intl, showRefresh}: {intl: IntlShape} & Object /* TODO: type */) => (
    <Banner
      error
      text={
        showRefresh
          ? intl.formatMessage(globalMessages.syncErrorBannerTextWithRefresh)
          : intl.formatMessage(globalMessages.syncErrorBannerTextWithoutRefresh)
      }
    />
  ),
)

type Props = {|
  intl: IntlShape,
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
  isReadOnly: boolean,
  isEasyConfirmationEnabled: boolean,
  hwDeviceInfo: HWDeviceInfo,
  submitTransaction: <T>(ISignRequest<T>, string) => Promise<void>,
  submitSignedTx: (string) => Promise<void>,
  defaultAsset: DefaultAsset,
  serverStatus: ServerStatusCache,
  walletMeta: $Diff<WalletMeta, {id: string}>,
|}

type State = {|
  +currentTime: Date,
  withdrawalDialogStep: WithdrawalDialogSteps,
  useUSB: boolean,
  signTxRequest: ?HaskellShelleyTxSignRequest,
  withdrawals: ?Array<{|
    address: string,
    amount: MultiToken,
  |}>,
  deregistrations: ?Array<{|
    rewardAddress: string,
    refund: MultiToken,
  |}>,
  balance: BigNumber,
  finalBalance: BigNumber,
  fees: BigNumber,
  error: {
    errorMessage: ?string,
    errorLogs?: ?string,
  },
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
    error: {
      errorMessage: null,
      errorLogs: null,
    },
  }

  _firstFocus: boolean = true

  _shouldDeregister: boolean = false

  _intervalId: void | IntervalID = undefined

  _unsubscribe: void | (() => mixed) = undefined

  componentDidMount() {
    this._intervalId = setInterval(
      () =>
        this.setState({
          currentTime: new Date(),
        }),
      1000,
    )
    this.props.checkForFlawedWallets()
    this._unsubscribe = this.props.navigation.addListener('focus', () =>
      this.handleDidFocus(),
    )
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
    if (this._unsubscribe != null) this._unsubscribe()
  }

  navigateToStakingCenter: (void) => void = () => {
    const {navigation} = this.props
    navigation.navigate(DELEGATION_ROUTES.STAKING_CENTER)
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
    const {intl, utxos, defaultAsset, serverStatus} = this.props
    try {
      if (utxos == null) throw new Error('cannot get utxos') // should never happen
      this.setState({withdrawalDialogStep: WITHDRAWAL_DIALOG_STEPS.WAITING})
      const signTxRequest = await walletManager.createWithdrawalTx(
        utxos,
        this._shouldDeregister,
        serverStatus.serverTime,
      )
      if (signTxRequest instanceof HaskellShelleyTxSignRequest) {
        const withdrawals = await signTxRequest.withdrawals()
        const deregistrations = await signTxRequest.keyDeregistrations()
        const balance = withdrawals.reduce(
          (sum, curr) =>
            curr.amount == null ? sum : sum.joinAddCopy(curr.amount),
          new MultiToken([], {
            defaultNetworkId: defaultAsset.networkId,
            defaultIdentifier: defaultAsset.identifier,
          }),
        )
        const fees = await signTxRequest.fee()
        const finalBalance = balance
          .joinAddMutable(
            deregistrations.reduce(
              (sum, curr) =>
                curr.refund == null ? sum : sum.joinAddCopy(curr.refund),
              new MultiToken([], {
                defaultNetworkId: defaultAsset.networkId,
                defaultIdentifier: defaultAsset.identifier,
              }),
            ),
          )
          .joinSubtractMutable(fees)
        this.setState({
          signTxRequest,
          withdrawals,
          deregistrations,
          balance: balance.getDefault(),
          finalBalance: finalBalance.getDefault(),
          fees: fees.getDefault(),
          withdrawalDialogStep: WITHDRAWAL_DIALOG_STEPS.CONFIRM,
        })
      } else {
        throw new Error('unexpected withdrawal tx type')
      }
    } catch (e) {
      if (e instanceof LocalizableError) {
        this.setState({
          withdrawalDialogStep: WITHDRAWAL_DIALOG_STEPS.ERROR,
          error: {
            errorMessage: intl.formatMessage({
              id: e.id,
              defaultMessage: e.defaultMessage,
            }),
          },
        })
      } else {
        this.setState({
          withdrawalDialogStep: WITHDRAWAL_DIALOG_STEPS.ERROR,
          error: {
            errorMessage: intl.formatMessage(
              errorMessages.generalError.message,
              {message: e.message},
            ),
          },
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
      submitTransaction,
      submitSignedTx,
    } = this.props
    if (signTxRequest == null) throw new Error('no tx data')

    const submitTx = async <T>(
      tx: string | ISignRequest<T>,
      decryptedKey: ?string,
    ) => {
      try {
        if (decryptedKey == null && typeof tx === 'string') {
          await submitSignedTx(tx)
        } else if (
          decryptedKey != null &&
          !(typeof tx === 'string' || tx instanceof String)
        ) {
          await submitTransaction(tx, decryptedKey)
        }
        navigation.navigate(WALLET_ROUTES.TX_HISTORY)
      } catch (e) {
        if (e instanceof NetworkError) {
          this.setState({
            error: {
              errorMessage: intl.formatMessage(
                errorMessages.networkError.message,
              ),
            },
          })
        } else if (e instanceof ApiError) {
          this.setState({
            error: {
              errorMessage: intl.formatMessage(errorMessages.apiError.message),
              errorLogs: JSON.stringify(e.request),
            },
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
        this.closeWithdrawalDialog()
      } catch (e) {
        if (e instanceof LocalizableError) {
          this.setState({
            withdrawalDialogStep: WITHDRAWAL_DIALOG_STEPS.ERROR,
            error: {
              errorMessage: intl.formatMessage({
                id: e.id,
                defaultMessage: e.defaultMessage,
              }),
            },
          })
        } else {
          this.setState({
            withdrawalDialogStep: WITHDRAWAL_DIALOG_STEPS.ERROR,
            error: {
              errorMessage: intl.formatMessage(
                errorMessages.generalTxError.message,
              ),
              errorLogs: String(e.message),
            },
          })
        }
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

            await submitTx(signTxRequest, decryptedKey)
          },
          onFail: () => navigation.goBack(),
        })
      } catch (e) {
        if (e instanceof SystemAuthDisabled) {
          this.closeWithdrawalDialog()
          await walletManager.closeWallet()
          await showErrorDialog(errorMessages.enableSystemAuthFirst, intl)
          navigation.navigate(WALLET_ROOT_ROUTES.WALLET_SELECTION)

          return
        } else {
          this.setState({
            withdrawalDialogStep: WITHDRAWAL_DIALOG_STEPS.ERROR,
            error: {
              errorMessage: intl.formatMessage(
                errorMessages.generalTxError.message,
              ),
              errorLogs: String(e.message),
            },
          })
        }
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

      await submitTx(signTxRequest, decryptedData)
      this.closeWithdrawalDialog()
    } catch (e) {
      if (e instanceof WrongPassword) {
        this.setState({
          withdrawalDialogStep: WITHDRAWAL_DIALOG_STEPS.ERROR,
          error: {
            errorMessage: intl.formatMessage(
              errorMessages.incorrectPassword.message,
            ),
          },
        })
      } else {
        this.setState({
          withdrawalDialogStep: WITHDRAWAL_DIALOG_STEPS.ERROR,
          error: {
            errorMessage: intl.formatMessage(
              errorMessages.generalTxError.message,
            ),
            errorLogs: String(e.message),
          },
        })
      }
    }
  }

  closeWithdrawalDialog: () => void = () =>
    this.setState({
      withdrawalDialogStep: WITHDRAWAL_DIALOG_STEPS.CLOSED,
    })

  render() {
    const {
      isOnline,
      utxoBalance,
      isDelegating,
      accountBalance,
      poolOperator,
      poolInfo,
      totalDelegated,
      fetchAccountState,
      isFetchingAccountState,
      lastAccountStateSyncError,
      fetchUTXOs,
      isFetchingUtxos,
      isFlawedWallet,
      navigation,
      walletMeta,
    } = this.props

    const config = getCardanoBaseConfig(
      getCardanoNetworkConfigById(walletMeta.networkId),
    )

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
            navigation.navigate(WALLET_ROOT_ROUTES.WALLET_SELECTION)
          }
        />
      )
    }

    return (
      <SafeAreaView style={styles.safeAreaView}>
        <StatusBar type="dark" />

        <UtxoAutoRefresher />
        <AccountAutoRefresher />

        <View style={[styles.container]}>
          <OfflineBanner />
          {
            /* eslint-disable indent */
            isOnline && lastAccountStateSyncError && (
              <SyncErrorBanner
                showRefresh={!(isFetchingAccountState || isFetchingUtxos)}
              />
            )
            /* eslint-enable indent */
          }

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.contentContainer}
            refreshControl={
              <RefreshControl
                onRefresh={() => {
                  fetchUTXOs()
                  fetchAccountState()
                }}
                refreshing={false}
              />
            }
          >
            {!isDelegating && <NotDelegatedInfo />}

            <View style={styles.row}>
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
            </View>
            {
              // TODO(v-almonacid): prefer computing balance from tx cache
              // instead of utxo set
            }

            <View style={styles.row}>
              <UserSummary
                totalAdaSum={utxoBalance}
                totalRewards={accountBalance}
                totalDelegated={totalDelegated}
                onWithdraw={this.openWithdrawalDialog}
                disableWithdraw={this.props.isReadOnly}
              />
            </View>

            {
              /* eslint-disable indent */

              poolInfo != null && !!poolOperator ? (
                <View style={styles.row}>
                  <DelegatedStakepoolInfo
                    // $FlowFixMe TODO: null or undefined is not compatible with string
                    poolTicker={poolInfo.info?.ticker}
                    // $FlowFixMe TODO: null or undefined is not compatible with string
                    poolName={poolInfo.info?.name}
                    poolHash={poolOperator != null ? poolOperator : ''}
                    // $FlowFixMe TODO: null or undefined is not compatible with string
                    poolURL={poolInfo.info?.homepage}
                  />
                </View>
              ) : isDelegating ? (
                <View style={styles.activityIndicator}>
                  <ActivityIndicator size={'large'} color={'black'} />
                </View>
              ) : null

              /* eslint-enable indent */
            }
          </ScrollView>

          <DelegationNavigationButtons
            onPress={this.navigateToStakingCenter}
            disabled={this.props.isReadOnly}
          />
        </View>

        <WithdrawalDialog
          step={this.state.withdrawalDialogStep}
          onKeepKey={(event) => this.onKeepOrDeregisterKey(event, false)}
          onDeregisterKey={(event) => this.onKeepOrDeregisterKey(event, true)}
          onChooseTransport={this.onChooseTransport}
          useUSB={this.state.useUSB}
          // $FlowFixMe
          onConnectBLE={this.onConnectBLE}
          // $FlowFixMe
          onConnectUSB={this.onConnectUSB}
          // $FlowFixMe
          withdrawals={this.state.withdrawals}
          // $FlowFixMe
          deregistrations={this.state.deregistrations}
          balance={this.state.balance}
          finalBalance={this.state.finalBalance}
          fees={this.state.fees}
          // $FlowFixMe
          onConfirm={this.onConfirm}
          onRequestClose={this.closeWithdrawalDialog}
          error={this.state.error}
        />
      </SafeAreaView>
    )
  }
}

type ExternalProps = {|
  navigation: Navigation,
  route: any,
  intl: IntlShape,
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
        isReadOnly: isReadOnlySelector(state),
        hwDeviceInfo: hwDeviceInfoSelector(state),
        defaultAsset: defaultNetworkAssetSelector(state),
        serverStatus: serverStatusSelector(state),
        walletMeta: walletMetaSelector(state),
      }),
      {
        fetchPoolInfo,
        fetchAccountState,
        fetchUTXOs,
        checkForFlawedWallets,
        setLedgerDeviceId,
        setLedgerDeviceObj,
        submitTransaction,
        submitSignedTx,
      },
      (state, dispatchProps, ownProps) => ({
        ...state,
        ...dispatchProps,
        ...ownProps,
      }),
    ),
    withNavigationTitle(({walletName}) => walletName),
  )(StakingDashboard): ComponentType<ExternalProps>),
)
