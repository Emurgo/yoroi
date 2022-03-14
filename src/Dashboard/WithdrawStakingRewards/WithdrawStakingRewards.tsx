/* eslint-disable @typescript-eslint/no-explicit-any */
import {useNavigation} from '@react-navigation/native'
import {BigNumber} from 'bignumber.js'
import React from 'react'
import {useIntl} from 'react-intl'
import {Platform} from 'react-native'

import {showErrorDialog} from '../../../legacy/actions'
import {CONFIG, getDefaultAssetByNetworkId} from '../../../legacy/config/config'
import {WrongPassword} from '../../../legacy/crypto/errors'
import {ISignRequest} from '../../../legacy/crypto/ISignRequest'
import KeyStore from '../../../legacy/crypto/KeyStore'
import {MultiToken} from '../../../legacy/crypto/MultiToken'
import {HaskellShelleyTxSignRequest} from '../../../legacy/crypto/shelley/HaskellShelleyTxSignRequest'
import type {DeviceId, DeviceObj, HWDeviceInfo} from '../../../legacy/crypto/shelley/ledgerUtils'
import walletManager, {SystemAuthDisabled} from '../../../legacy/crypto/walletManager'
import {ensureKeysValidity} from '../../../legacy/helpers/deviceSettings'
import {errorMessages} from '../../../legacy/i18n/global-messages'
import LocalizableError from '../../../legacy/i18n/LocalizableError'
import {DELEGATION_ROUTES, SEND_ROUTES, WALLET_ROOT_ROUTES, WALLET_ROUTES} from '../../../legacy/RoutesList'
import {ErrorData} from '../../components'
import {useSelectedWallet} from '../../SelectedWallet'
import {RawUtxo, SignRequestDeregistration, SignRequestWithdrawal} from '../../types'
import {Steps, WithdrawalDialog} from './WithdrawalDialog'

type Props = {
  utxos: Array<RawUtxo> | null
  setLedgerDeviceId: (deviceID: DeviceId) => Promise<void>
  setLedgerDeviceObj: (deviceObj: DeviceObj) => Promise<void>
  hwDeviceInfo: HWDeviceInfo
  submitTransaction: (request: ISignRequest, text: string) => Promise<void>
  submitSignedTx: (text: string) => Promise<void>
  onDone: () => void
}

export const WithdrawStakingRewards = (props: Props) => {
  const navigation = useNavigation()
  const intl = useIntl()
  const wallet = useSelectedWallet()
  const defaultAsset = getDefaultAssetByNetworkId(wallet.networkId)

  const [withdrawalDialogStep, setWithdrawalDialogStep] = React.useState(Steps.Warning)
  const [useUSB, setUseUSB] = React.useState(false)

  const [signTxRequest, setSignTxRequest] = React.useState<HaskellShelleyTxSignRequest | null>(null)
  const [withdrawals, setWithdrawals] = React.useState<Array<SignRequestWithdrawal> | null>(null)
  const [deregistrations, setDeregistrations] = React.useState<Array<SignRequestDeregistration> | null>(null)
  const [fees, setFees] = React.useState(new BigNumber(0))

  const [balance, setBalance] = React.useState(new BigNumber(0))
  const [finalBalance, setFinalBalance] = React.useState(new BigNumber(0))
  const [errorData, setErrorData] = React.useState<ErrorData | undefined>(undefined)
  const [shouldDeregister, setShouldDeregister] = React.useState(false)

  const onDeregisterKey = async () => {
    setShouldDeregister(true)
    if (wallet.isHW && Platform.OS === 'android' && CONFIG.HARDWARE_WALLETS.LEDGER_NANO.ENABLE_USB_TRANSPORT) {
      // toggle ledger transport switch modal

      setWithdrawalDialogStep(Steps.ChooseTransport)
    } else {
      await createWithdrawalTx()
    }
  }

  const onKeepKey = async () => {
    if (wallet.isHW && Platform.OS === 'android' && CONFIG.HARDWARE_WALLETS.LEDGER_NANO.ENABLE_USB_TRANSPORT) {
      // toggle ledger transport switch modal

      setWithdrawalDialogStep(Steps.ChooseTransport)
    } else {
      await createWithdrawalTx()
    }
  }

  const onChooseTransport = async (useUSB: boolean) => {
    const {hwDeviceInfo} = props
    setUseUSB(useUSB)
    if (
      (useUSB && hwDeviceInfo.hwFeatures.deviceObj == null) ||
      (!useUSB && hwDeviceInfo.hwFeatures.deviceId == null)
    ) {
      openLedgerConnect()
    } else {
      await createWithdrawalTx()
    }
  }

  const openLedgerConnect = () => setWithdrawalDialogStep(Steps.LedgerConnect)

  const onConnectUSB = async (deviceObj: DeviceObj): Promise<void> => {
    await props.setLedgerDeviceObj(deviceObj)
    await createWithdrawalTx()
  }

  const onConnectBLE = async (deviceId: DeviceId): Promise<void> => {
    await props.setLedgerDeviceId(deviceId)
    await createWithdrawalTx()
  }

  /* create withdrawal tx and move to confirm */
  const createWithdrawalTx = async (): Promise<void> => {
    const {utxos} = props
    try {
      if (utxos == null) throw new Error('cannot get utxos') // should never happen
      setWithdrawalDialogStep(Steps.Waiting)

      const {serverTime} = await wallet.checkServerStatus()
      const signTxRequest = await wallet.createWithdrawalTx(utxos, shouldDeregister, new Date(serverTime))
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

        setSignTxRequest(signTxRequest)
        setWithdrawals(withdrawals)
        setDeregistrations(deregistrations)
        setBalance(balance.getDefault())
        setFinalBalance(finalBalance.getDefault())
        setFees(fees.getDefault())
        setWithdrawalDialogStep(Steps.Confirm)
      } else {
        throw new Error('unexpected withdrawal tx type')
      }
    } catch (e) {
      if (e instanceof LocalizableError) {
        setErrorData({
          errorMessage: intl.formatMessage({
            id: (e as any).id,
            defaultMessage: (e as any).defaultMessage,
          }),
        })
        setWithdrawalDialogStep(Steps.Error)
      } else {
        setErrorData({
          errorMessage: intl.formatMessage(errorMessages.generalError.message, {message: (e as any).message}),
        })
        setWithdrawalDialogStep(Steps.Error)
      }
    }
  }

  // TODO: this code has been copy-pasted from the tx confirmation page.
  // Ideally, all this logic should be moved away and perhaps written as a
  // redux action that can be reused in all components with tx signing and sending
  const onConfirm = async (password: string | void): Promise<void> => {
    const {submitTransaction, submitSignedTx} = props
    if (signTxRequest == null) throw new Error('no tx data')

    const submitTx = async (tx: string | ISignRequest, decryptedKey?: string) => {
      if (decryptedKey == null && typeof tx === 'string') {
        await submitSignedTx(tx)
      } else if (decryptedKey != null && !(typeof tx === 'string' || tx instanceof String)) {
        await submitTransaction(tx, decryptedKey)
      }
      navigation.navigate(WALLET_ROUTES.TX_HISTORY)
    }

    try {
      if (wallet.isHW) {
        setWithdrawalDialogStep(Steps.WaitingHwResponse)

        if (signTxRequest == null) throw new Error('no tx data')
        const signedTx = await walletManager.signTxWithLedger(signTxRequest, useUSB)
        setWithdrawalDialogStep(Steps.Waiting)
        await submitTx(Buffer.from(signedTx.encodedTx).toString('base64'))
        closeWithdrawalDialog()
        return
      }

      if (wallet.isEasyConfirmationEnabled) {
        try {
          await ensureKeysValidity(walletManager._id)
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
            closeWithdrawalDialog()
            await walletManager.closeWallet()
            await showErrorDialog(errorMessages.enableSystemAuthFirst, intl)
            navigation.navigate(WALLET_ROOT_ROUTES.WALLET_SELECTION)

            return
          } else {
            throw e
          }
        }
        return
      }

      try {
        setWithdrawalDialogStep(Steps.Waiting)
        const decryptedData = await KeyStore.getData(walletManager._id, 'MASTER_PASSWORD', '', password, intl)

        await submitTx(signTxRequest, decryptedData)
        closeWithdrawalDialog()
      } catch (e) {
        if (e instanceof WrongPassword) {
          setErrorData({
            errorMessage: intl.formatMessage(errorMessages.incorrectPassword.message),
            errorLogs: null,
          })
          setWithdrawalDialogStep(Steps.Error)
        } else {
          throw e
        }
      }
    } catch (e) {
      if (e instanceof LocalizableError) {
        setErrorData({
          errorMessage: intl.formatMessage(
            {id: (e as any).id, defaultMessage: (e as any).defaultMessage},
            (e as any).values,
          ),
          errorLogs: (e as any).values.response || null,
        })
        setWithdrawalDialogStep(Steps.Error)
      } else {
        setErrorData({
          errorMessage: intl.formatMessage(errorMessages.generalTxError.message),
          errorLogs: (e as any).message || null,
        })
        setWithdrawalDialogStep(Steps.Error)
      }
    }
  }

  const closeWithdrawalDialog = () => {
    setWithdrawalDialogStep(Steps.Closed)
    props.onDone()
  }

  return (
    <WithdrawalDialog
      step={withdrawalDialogStep}
      onKeepKey={() => onKeepKey()}
      onDeregisterKey={() => onDeregisterKey()}
      onChooseTransport={onChooseTransport}
      useUSB={useUSB}
      onConnectBLE={onConnectBLE}
      onConnectUSB={onConnectUSB}
      withdrawals={withdrawals}
      deregistrations={deregistrations}
      balance={balance}
      finalBalance={finalBalance}
      fees={fees}
      onConfirm={onConfirm}
      onRequestClose={closeWithdrawalDialog}
      error={errorData}
    />
  )
}
