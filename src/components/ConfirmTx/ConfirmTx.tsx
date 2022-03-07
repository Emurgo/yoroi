/* eslint-disable @typescript-eslint/no-explicit-any */
import {useNavigation} from '@react-navigation/native'
import React, {useEffect} from 'react'
import {useIntl} from 'react-intl'
import {Platform, StyleSheet, View} from 'react-native'
import {useDispatch, useSelector} from 'react-redux'

import {showErrorDialog} from '../../../legacy/actions'
import {
  setLedgerDeviceId as _setLedgerDeviceId,
  setLedgerDeviceObj as _setLedgerDeviceObj,
} from '../../../legacy/actions/hwWallet'
import {CONFIG} from '../../../legacy/config/config'
import {WrongPassword} from '../../../legacy/crypto/errors'
import KeyStore from '../../../legacy/crypto/KeyStore'
import type {CreateUnsignedTxResponse} from '../../../legacy/crypto/shelley/transactionUtils'
import walletManager, {SystemAuthDisabled} from '../../../legacy/crypto/walletManager'
import {ensureKeysValidity} from '../../../legacy/helpers/deviceSettings'
import globalMessages, {confirmationMessages, errorMessages, txLabels} from '../../../legacy/i18n/global-messages'
import LocalizableError from '../../../legacy/i18n/LocalizableError'
import {SEND_ROUTES, WALLET_ROOT_ROUTES} from '../../../legacy/RoutesList'
import {hwDeviceInfoSelector} from '../../../legacy/selectors'
import {COLORS} from '../../../legacy/styles/config'
import {useCloseWallet, useSaveAndSubmitSignedTx} from '../../hooks'
import {LedgerTransportSwitchModal} from '../../HW'
import {LedgerConnect} from '../../HW'
import {useSelectedWallet, useSetSelectedWallet, useSetSelectedWalletMeta} from '../../SelectedWallet'
import {Button, ButtonProps, Modal, PleaseWaitModal, ValidatedTextInput} from '..'
import {ErrorModal} from '..'

type ConfirmTxProps = {
  txDataSignRequest: CreateUnsignedTxResponse
  onSuccess: () => void
  onError?: (err: Error) => void
  buttonProps?: Omit<Partial<ButtonProps>, 'disabled' | 'onPress'>
  useUSB: boolean
  setUseUSB: (useUSB: boolean) => void
  isProvidingPassword: boolean
  providedPassword?: string
}

export const ConfirmTx: React.FC<ConfirmTxProps> = ({
  txDataSignRequest,
  onError,
  onSuccess,
  buttonProps,
  setUseUSB,
  useUSB,
  isProvidingPassword,
  providedPassword = '',
}) => {
  const intl = useIntl()
  const strings = useStrings()
  const hwDeviceInfo = useSelector(hwDeviceInfoSelector)
  const setSelectedWallet = useSetSelectedWallet()
  const setSelectedWalletMeta = useSetSelectedWalletMeta()
  const {closeWallet} = useCloseWallet({
    onSuccess: () => {
      setSelectedWallet(undefined)
      setSelectedWalletMeta(undefined)
    },
  })
  const wallet = useSelectedWallet()
  const {isHW, isEasyConfirmationEnabled} = wallet
  const {saveAndSubmitTx, isLoading: sendingTransaction} = useSaveAndSubmitSignedTx({wallet})

  const [password, setPassword] = React.useState('')
  const [buttonDisabled, setButtonDisabled] = React.useState(false)
  const [ledgerDialogStep, setLedgerDialogStep] = React.useState(LEDGER_DIALOG_STEPS.CHOOSE_TRANSPORT)
  const [showErrorModal, setShowErrorModal] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState('')
  const [errorLogs, setErrorLogs] = React.useState('')

  useEffect(() => {
    if (!isProvidingPassword && __DEV__) {
      CONFIG.DEBUG.PREFILL_FORMS ? CONFIG.DEBUG.PASSWORD : ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (isProvidingPassword) {
      setPassword(providedPassword)
    }
  }, [providedPassword, isProvidingPassword])

  const openLedgerConnect = () => setLedgerDialogStep(LEDGER_DIALOG_STEPS.LEDGER_CONNECT)
  const closeLedgerDialog = () => setLedgerDialogStep(LEDGER_DIALOG_STEPS.CLOSED)

  const closeErrorModal = () => setShowErrorModal(false)
  const setErrorData = (showErrorModal, errorMessage, errorLogs) => {
    setShowErrorModal(showErrorModal)
    setErrorMessage(errorMessage)
    setErrorLogs(errorLogs)
  }

  const dispatch = useDispatch()
  const setLedgerDeviceId = (deviceId) => dispatch(_setLedgerDeviceId(deviceId))
  const setLedgerDeviceObj = (deviceObj) => dispatch(_setLedgerDeviceObj(deviceObj))

  const onChooseTransport = (useUSB: boolean) => {
    if (!hwDeviceInfo) throw new Error('No device info')

    setUseUSB(useUSB)
    if (
      (useUSB && hwDeviceInfo.hwFeatures.deviceObj == null) ||
      (!useUSB && hwDeviceInfo.hwFeatures.deviceId == null)
    ) {
      openLedgerConnect()
    } else {
      closeLedgerDialog()
    }
  }

  const onConnectUSB = async (deviceObj) => {
    await setLedgerDeviceObj(deviceObj)
    closeLedgerDialog()
  }

  const onConnectBLE = async (deviceId) => {
    await setLedgerDeviceId(deviceId)
    closeLedgerDialog()
  }

  const navigation = useNavigation()
  const _onConfirm = async () => {
    if (wallet.isEasyConfirmationEnabled) {
      try {
        await ensureKeysValidity(wallet.id)
        navigation.navigate(SEND_ROUTES.BIOMETRICS_SIGNING, {
          keyId: wallet.id,
          pop: true,
          onSuccess: (decryptedKey) => {
            onConfirm(decryptedKey)
          },
          onFail: () => navigation.goBack(),
        })
      } catch (err) {
        if (err instanceof SystemAuthDisabled) {
          await showErrorDialog(errorMessages.enableSystemAuthFirst, intl)
          navigation.navigate(WALLET_ROOT_ROUTES.WALLET_SELECTION)
          setTimeout(() => closeWallet(), 1000)
          return
        } else {
          throw err
        }
      }
      return
    } else {
      return onConfirm()
    }
  }

  const onConfirm = async (easyConfirmDecryptKey?: string) => {
    try {
      setButtonDisabled(true)
      let signedTx
      if (isEasyConfirmationEnabled) {
        if (easyConfirmDecryptKey) {
          signedTx = await wallet.signTx(txDataSignRequest, easyConfirmDecryptKey)
        }
      } else {
        if (wallet.isHW) {
          signedTx = await wallet.signTxWithLedger(txDataSignRequest, useUSB)
        } else {
          const decryptedKey = await KeyStore.getData(walletManager._id, 'MASTER_PASSWORD', '', password, intl)
          signedTx = await wallet.signTx(txDataSignRequest, decryptedKey)
        }
      }
      saveAndSubmitTx(signedTx, {
        onSuccess: () => onSuccess(),
        onError: (err) => {
          setTimeout(() => {
            if (err instanceof LocalizableError) {
              const localizableError: any = err
              setErrorData(
                true,
                intl.formatMessage(
                  {id: localizableError.id, defaultMessage: localizableError.defaultMessage},
                  localizableError.values,
                ),
                localizableError.values.response || null, // API errors should include a response
              )
            } else {
              setErrorData(true, strings.generalTxError.message, (err as any).message || null)
            }
            onError?.(err)
          }, 500) // RNModal issue
        },
      })
    } catch (err) {
      if (err instanceof WrongPassword) {
        await showErrorDialog(errorMessages.incorrectPassword, intl)
      } else {
        setErrorData(true, strings.generalTxError.message, (err as any).message || null)
      }
    } finally {
      setButtonDisabled(false)
    }
  }

  const isConfirmationDisabled = !isEasyConfirmationEnabled && !password && !isHW

  return (
    <View style={styles.root}>
      <View style={styles.actionContainer}>
        {!isEasyConfirmationEnabled && !isHW && !isProvidingPassword && (
          <ValidatedTextInput
            secureTextEntry
            value={password || ''}
            label={strings.password}
            onChangeText={setPassword}
          />
        )}
        <Button
          onPress={_onConfirm}
          title={strings.confirmButton}
          disabled={isConfirmationDisabled || buttonDisabled}
          {...buttonProps}
        />
      </View>

      {isHW && Platform.OS === 'android' && CONFIG.HARDWARE_WALLETS.LEDGER_NANO.ENABLE_USB_TRANSPORT && (
        <>
          <LedgerTransportSwitchModal
            visible={ledgerDialogStep === LEDGER_DIALOG_STEPS.CHOOSE_TRANSPORT}
            onRequestClose={closeLedgerDialog}
            onSelectUSB={() => onChooseTransport(true)}
            onSelectBLE={() => onChooseTransport(false)}
            showCloseIcon
          />

          <Modal visible={ledgerDialogStep === LEDGER_DIALOG_STEPS.LEDGER_CONNECT} onRequestClose={closeLedgerDialog}>
            <LedgerConnect onConnectBLE={onConnectBLE} onConnectUSB={onConnectUSB} useUSB={useUSB} />
          </Modal>
        </>
      )}

      <ErrorModal
        visible={showErrorModal}
        title={strings.generalTxError.title}
        errorMessage={errorMessage}
        errorLogs={errorLogs}
        onRequestClose={closeErrorModal}
      />

      <PleaseWaitModal title={strings.submittingTx} spinnerText={strings.pleaseWait} visible={sendingTransaction} />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: COLORS.WHITE,
  },
  actionContainer: {
    justifyContent: 'space-between',
  },
})

const LEDGER_DIALOG_STEPS = {
  CLOSED: 'CLOSED',
  CHOOSE_TRANSPORT: 'CHOOSE_TRANSPORT',
  LEDGER_CONNECT: 'LEDGER_CONNECT',
}

const useStrings = () => {
  const intl = useIntl()

  return {
    password: intl.formatMessage(txLabels.password),
    confirmButton: intl.formatMessage(confirmationMessages.commonButtons.confirmButton),
    submittingTx: intl.formatMessage(txLabels.submittingTx),
    pleaseWait: intl.formatMessage(globalMessages.pleaseWait),
    generalTxError: {
      title: intl.formatMessage(errorMessages.generalTxError.title),
      message: intl.formatMessage(errorMessages.generalTxError.message),
    },
  }
}
