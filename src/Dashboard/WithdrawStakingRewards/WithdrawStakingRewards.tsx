/* eslint-disable @typescript-eslint/no-explicit-any */
import {NavigationProp} from '@react-navigation/native'
import {BigNumber} from 'bignumber.js'
import React from 'react'
import {IntlShape} from 'react-intl'
import {Platform} from 'react-native'

import {errorMessages} from '../../i18n/global-messages'
import LocalizableError from '../../i18n/LocalizableError'
import {showErrorDialog} from '../../legacy/actions'
import {CONFIG} from '../../legacy/config'
import {ensureKeysValidity} from '../../legacy/deviceSettings'
import {WrongPassword} from '../../legacy/errors'
import {ISignRequest} from '../../legacy/ISignRequest'
import KeyStore from '../../legacy/KeyStore'
import type {DeviceId, DeviceObj, HWDeviceInfo} from '../../legacy/ledgerUtils'
import {RawUtxo} from '../../legacy/types'
import {DefaultAsset} from '../../types'
import {
  HaskellShelleyTxSignRequest,
  MultiToken,
  ServerStatus,
  SystemAuthDisabled,
  walletManager,
} from '../../yoroi-wallets'
import {WithdrawalDialog} from './WithdrawalDialog'

export enum WithdrawalDialogSteps {
  CLOSED = 'CLOSED',
  WARNING = 'WARNING',
  CHOOSE_TRANSPORT = 'CHOOSE_TRANSPORT',
  LEDGER_CONNECT = 'LEDGER_CONNECT',
  CONFIRM = 'CONFIRM',
  WAITING_HW_RESPONSE = 'WAITING_HW_RESPONSE',
  WAITING = 'WAITING',
  ERROR = 'ERROR',
}

type Props = {
  intl: IntlShape
  navigation: NavigationProp<any>
  utxos: Array<RawUtxo> | undefined | null
  setLedgerDeviceId: (deviceID: DeviceId) => Promise<void>
  setLedgerDeviceObj: (deviceObj: DeviceObj) => Promise<void>
  isHW: boolean
  isEasyConfirmationEnabled: boolean
  hwDeviceInfo: HWDeviceInfo
  submitTransaction: (request: ISignRequest, text: string) => Promise<void>
  submitSignedTx: (text: string) => Promise<void>
  defaultAsset: DefaultAsset
  serverStatus: ServerStatus
  onDone: () => void
}

type State = {
  withdrawalDialogStep: WithdrawalDialogSteps
  useUSB: boolean
  signTxRequest: HaskellShelleyTxSignRequest | null
  withdrawals: Array<{
    address: string
    amount: MultiToken
  }> | null
  deregistrations: Array<{
    rewardAddress: string
    refund: MultiToken
  }> | null
  balance: BigNumber
  finalBalance: BigNumber
  fees: BigNumber
  error:
    | undefined
    | {
        errorMessage: string
        errorLogs?: string | null
      }
}

// eslint-disable-next-line react-prefer-function-component/react-prefer-function-component
export class WithdrawStakingRewards extends React.Component<Props, State> {
  state = {
    withdrawalDialogStep: WithdrawalDialogSteps.WARNING,
    useUSB: false,
    signTxRequest: null,
    withdrawals: null,
    deregistrations: null,
    balance: new BigNumber(0),
    finalBalance: new BigNumber(0),
    fees: new BigNumber(0),
    error: undefined,
  }

  _shouldDeregister = false

  /* withdrawal logic */

  openWithdrawalDialog = () =>
    this.setState({
      withdrawalDialogStep: WithdrawalDialogSteps.WARNING,
    })

  onKeepOrDeregisterKey = async (shouldDeregister: boolean): Promise<void> => {
    this._shouldDeregister = shouldDeregister
    if (this.props.isHW && Platform.OS === 'android' && CONFIG.HARDWARE_WALLETS.LEDGER_NANO.ENABLE_USB_TRANSPORT) {
      // toggle ledger transport switch modal
      this.setState({
        withdrawalDialogStep: WithdrawalDialogSteps.CHOOSE_TRANSPORT,
      })
    } else {
      await this.createWithdrawalTx()
    }
  }

  /* create withdrawal tx and move to confirm */
  createWithdrawalTx = async (): Promise<void> => {
    const {intl, utxos, defaultAsset, serverStatus} = this.props
    try {
      if (utxos == null) throw new Error('cannot get utxos') // should never happen
      this.setState({withdrawalDialogStep: WithdrawalDialogSteps.WAITING})
      const signTxRequest = await walletManager.createWithdrawalTx(
        utxos,
        this._shouldDeregister,
        serverStatus.serverTime,
      )
      if (signTxRequest instanceof HaskellShelleyTxSignRequest) {
        const withdrawals = await signTxRequest.withdrawals()
        const deregistrations = await signTxRequest.keyDeregistrations()
        const balance = withdrawals.reduce(
          (sum, curr) => (curr.amount == null ? sum : sum.joinAddCopy(curr.amount)),
          new MultiToken([], {
            defaultNetworkId: defaultAsset.networkId,
            defaultIdentifier: defaultAsset.identifier,
          }),
        )
        const fees = await signTxRequest.fee()
        const finalBalance = balance
          .joinAddMutable(
            deregistrations.reduce(
              (sum, curr) => (curr.refund == null ? sum : sum.joinAddCopy(curr.refund)),
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
          withdrawalDialogStep: WithdrawalDialogSteps.CONFIRM,
        })
      } else {
        throw new Error('unexpected withdrawal tx type')
      }
    } catch (e) {
      if (e instanceof LocalizableError) {
        this.setState({
          withdrawalDialogStep: WithdrawalDialogSteps.ERROR,
          error: {
            errorMessage: intl.formatMessage({
              id: (e as any).id,
              defaultMessage: (e as any).defaultMessage,
            }),
          },
        })
      } else {
        this.setState({
          withdrawalDialogStep: WithdrawalDialogSteps.ERROR,
          error: {
            errorMessage: intl.formatMessage(errorMessages.generalError.message, {message: (e as any).message}),
          },
        })
      }
    }
  }

  openLedgerConnect = () =>
    this.setState({
      withdrawalDialogStep: WithdrawalDialogSteps.LEDGER_CONNECT,
    })

  onChooseTransport = async (useUSB: boolean): Promise<void> => {
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

  onConnectUSB = async (deviceObj: DeviceObj): Promise<void> => {
    await this.props.setLedgerDeviceObj(deviceObj)
    await this.createWithdrawalTx()
  }

  onConnectBLE = async (deviceId: DeviceId): Promise<void> => {
    await this.props.setLedgerDeviceId(deviceId)
    await this.createWithdrawalTx()
  }

  // TODO: this code has been copy-pasted from the tx confirmation page.
  // Ideally, all this logic should be moved away and perhaps written as a
  // redux action that can be reused in all components with tx signing and sending
  onConfirm = async (password: string | undefined): Promise<void> => {
    const {signTxRequest, useUSB} = this.state
    const {intl, navigation, isHW, isEasyConfirmationEnabled, submitTransaction, submitSignedTx} = this.props
    if (signTxRequest == null) throw new Error('no tx data')

    const submitTx = async (tx: string | ISignRequest, decryptedKey?: string) => {
      if (decryptedKey == null && typeof tx === 'string') {
        await submitSignedTx(tx)
      } else if (decryptedKey != null && !(typeof tx === 'string' || tx instanceof String)) {
        await submitTransaction(tx, decryptedKey)
      }
      navigation.reset({
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
      })
    }

    try {
      if (isHW) {
        this.setState({
          withdrawalDialogStep: WithdrawalDialogSteps.WAITING_HW_RESPONSE,
        })
        if (signTxRequest == null) throw new Error('no tx data')
        const signedTx = await walletManager.signTxWithLedger(signTxRequest, useUSB)
        this.setState({withdrawalDialogStep: WithdrawalDialogSteps.WAITING})
        await submitTx(Buffer.from(signedTx.encodedTx).toString('base64'))
        this.closeWithdrawalDialog()
        return
      }

      if (isEasyConfirmationEnabled) {
        try {
          await ensureKeysValidity(walletManager._id)
          navigation.navigate('', {
            keyId: walletManager._id,
            onSuccess: async (decryptedKey) => {
              await submitTx(signTxRequest, decryptedKey)
            },
            onFail: () => navigation.goBack(),
          })
        } catch (e) {
          if (e instanceof SystemAuthDisabled) {
            this.closeWithdrawalDialog()
            await walletManager.closeWallet()
            await showErrorDialog(errorMessages.enableSystemAuthFirst, intl)
            navigation.navigate('app-root', {
              screen: 'wallet-selection',
            })

            return
          } else {
            throw e
          }
        }
        return
      }

      try {
        this.setState({withdrawalDialogStep: WithdrawalDialogSteps.WAITING})
        const decryptedData = await KeyStore.getData(walletManager._id, 'MASTER_PASSWORD', '', password, intl)

        await submitTx(signTxRequest, decryptedData)
        this.closeWithdrawalDialog()
      } catch (e) {
        if (e instanceof WrongPassword) {
          this.setState({
            withdrawalDialogStep: WithdrawalDialogSteps.ERROR,
            error: {
              errorMessage: intl.formatMessage(errorMessages.incorrectPassword.message),
              errorLogs: null,
            },
          })
        } else {
          throw e
        }
      }
    } catch (e) {
      if (e instanceof LocalizableError) {
        this.setState({
          withdrawalDialogStep: WithdrawalDialogSteps.ERROR,
          error: {
            errorMessage: intl.formatMessage(
              {id: (e as any).id, defaultMessage: (e as any).defaultMessage},
              (e as any).values,
            ),
            errorLogs: (e as any).values.response || null,
          },
        })
      } else {
        this.setState({
          withdrawalDialogStep: WithdrawalDialogSteps.ERROR,
          error: {
            errorMessage: intl.formatMessage(errorMessages.generalTxError.message),
            errorLogs: (e as any).message || null,
          },
        })
      }
    }
  }

  closeWithdrawalDialog = () => this.setState({withdrawalDialogStep: WithdrawalDialogSteps.CLOSED}, this.props.onDone)

  render() {
    return (
      <WithdrawalDialog
        step={this.state.withdrawalDialogStep}
        onKeepKey={() => this.onKeepOrDeregisterKey(false)}
        onDeregisterKey={() => this.onKeepOrDeregisterKey(true)}
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
        error={this.state.error}
      />
    )
  }
}
