/* eslint-disable @typescript-eslint/no-explicit-any */
import {NavigationProp} from '@react-navigation/native'
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
import type {DeviceId, DeviceObj} from '../../legacy/ledgerUtils'
import {RawUtxo} from '../../legacy/types'
import {DefaultAsset} from '../../types'
import {ServerStatus, SystemAuthDisabled, walletManager, YoroiUnsignedTx, YoroiWallet} from '../../yoroi-wallets'
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
  wallet: YoroiWallet
  utxos: Array<RawUtxo> | undefined | null
  setLedgerDeviceId: (deviceID: DeviceId) => Promise<void>
  setLedgerDeviceObj: (deviceObj: DeviceObj) => Promise<void>
  submitTransaction: (request: ISignRequest, text: string) => Promise<void>
  submitSignedTx: (text: string) => Promise<void>
  defaultAsset: DefaultAsset
  serverStatus: ServerStatus
  onDone: () => void
}

type State = {
  withdrawalDialogStep: WithdrawalDialogSteps
  useUSB: boolean
  unsignedTx: YoroiUnsignedTx | null
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
    unsignedTx: null,
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
    if (
      this.props.wallet.isHW &&
      Platform.OS === 'android' &&
      CONFIG.HARDWARE_WALLETS.LEDGER_NANO.ENABLE_USB_TRANSPORT
    ) {
      // toggle ledger transport switch modal
      this.setState({
        withdrawalDialogStep: WithdrawalDialogSteps.CHOOSE_TRANSPORT,
      })
    } else {
      await this.createWithdrawalTx()
    }
  }

  /* create withdrawal tx and move to confirm */
  createWithdrawalTx = async () => {
    const {intl, utxos, serverStatus, wallet} = this.props
    try {
      if (utxos == null) throw new Error('cannot get utxos') // should never happen
      this.setState({withdrawalDialogStep: WithdrawalDialogSteps.WAITING})
      const unsignedTx = await wallet.createWithdrawalTx(utxos, this._shouldDeregister, serverStatus.serverTime)

      this.setState({
        unsignedTx,
        withdrawalDialogStep: WithdrawalDialogSteps.CONFIRM,
      })
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
    const {wallet} = this.props
    if (!wallet.hwDeviceInfo) throw new Error('Invalid wallet state')
    this.setState({useUSB})
    if (
      (useUSB && wallet.hwDeviceInfo.hwFeatures.deviceObj == null) ||
      (!useUSB && wallet.hwDeviceInfo.hwFeatures.deviceId == null)
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
    const {unsignedTx, useUSB} = this.state
    const {intl, navigation, wallet, submitTransaction, submitSignedTx} = this.props
    if (unsignedTx == null) throw new Error('no tx data')

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
      if (wallet.isHW) {
        this.setState({
          withdrawalDialogStep: WithdrawalDialogSteps.WAITING_HW_RESPONSE,
        })
        if (unsignedTx == null) throw new Error('no tx data')
        const signedTx = await wallet.signTxWithLedger(unsignedTx, useUSB)
        this.setState({withdrawalDialogStep: WithdrawalDialogSteps.WAITING})
        await submitTx(Buffer.from(signedTx.encodedTx).toString('base64'))
        this.closeWithdrawalDialog()
        return
      }

      if (wallet.isEasyConfirmationEnabled) {
        try {
          await ensureKeysValidity(wallet.id)
          navigation.navigate('', {
            keyId: wallet.id,
            onSuccess: async (decryptedKey) => {
              await submitTx(unsignedTx, decryptedKey)
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
        const decryptedData = await KeyStore.getData(wallet.id, 'MASTER_PASSWORD', '', password, intl)

        await submitTx(unsignedTx, decryptedData)
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
        onConfirm={this.onConfirm}
        onRequestClose={this.closeWithdrawalDialog}
        error={this.state.error}
        unsignedTx={this.state.unsignedTx}
      />
    )
  }
}
