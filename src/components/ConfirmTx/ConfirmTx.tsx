/* eslint-disable @typescript-eslint/no-explicit-any */
import {useNavigation} from '@react-navigation/native'
import {delay} from 'bluebird'
import React, {useEffect, useState} from 'react'
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
import {confirmationMessages, errorMessages, txLabels} from '../../../legacy/i18n/global-messages'
import LocalizableError from '../../../legacy/i18n/LocalizableError'
import {SEND_ROUTES, WALLET_ROOT_ROUTES} from '../../../legacy/RoutesList'
import {hwDeviceInfoSelector} from '../../../legacy/selectors'
import {COLORS} from '../../../legacy/styles/config'
import {useCloseWallet, useSaveAndSubmitSignedTx} from '../../hooks'
import {useSelectedWallet, useSetSelectedWallet, useSetSelectedWalletMeta} from '../../SelectedWallet'
import {SignedTx} from '../../types'
import {Button, ButtonProps, ValidatedTextInput} from '..'
import {Dialog, Step as DialogStep} from './Dialog'

type ErrorData = {
  errorMessage: string
  errorLogs?: string
}

type ConfirmTxProps = {
  buttonProps?: Omit<Partial<ButtonProps>, 'disabled' | 'onPress'>
  onSuccess: (signedTx: SignedTx) => void
  onError?: (err: Error) => void
  txDataSignRequest: CreateUnsignedTxResponse
  useUSB: boolean
  setUseUSB: (useUSB: boolean) => void
  isProvidingPassword: boolean
  providedPassword?: string
  disabled?: boolean
}

type SignAndSubmitProps = {
  process: 'signAndSubmit'
} & ConfirmTxProps

type OnlySignProps = {
  process: 'onlySign'
} & ConfirmTxProps

type OnlySubmitProps = {
  process: 'onlySubmit'
  signedTx: SignedTx
  onError: (err: Error) => void
} & Pick<ConfirmTxProps, 'onSuccess' | 'buttonProps' | 'disabled'>

export const ConfirmTx: React.FC<SignAndSubmitProps | OnlySignProps | OnlySubmitProps> = (props) => {
  if (props.process === 'onlySign' || props.process === 'signAndSubmit') {
    return <ConfirmWithSignature {...props} />
  } else {
    return <ConfirmSubmit {...props} />
  }
}

export const ConfirmSubmit: React.FC<OnlySubmitProps> = ({signedTx, onError, onSuccess, buttonProps, disabled}) => {
  const strings = useStrings()
  const wallet = useSelectedWallet()

  const [dialogStep, setDialogStep] = useState<DialogStep.Closed | DialogStep.Error | DialogStep.Submitting>(
    DialogStep.Closed,
  )

  const [errorData, setErrorData] = useState<ErrorData>({
    errorMessage: '',
    errorLogs: '',
  })
  const showError = ({errorMessage, errorLogs}: ErrorData) => {
    setErrorData({
      errorMessage,
      errorLogs,
    })
    setDialogStep(DialogStep.Error)
  }

  const {saveAndSubmitTx, isLoading: sendingTransaction} = useSaveAndSubmitSignedTx({wallet})

  const onConfirm = () => {
    setDialogStep(DialogStep.Submitting)
    saveAndSubmitTx(signedTx, {
      onSuccess: () => onSuccess(signedTx),
      onError: (err) => {
        if (err instanceof LocalizableError) {
          showError({
            errorMessage: strings.errorMessage(err),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            errorLogs: (err as any).values.response || null,
          })
        } else {
          showError({
            errorMessage: strings.generalTxErrorMessage,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            errorLogs: (err as any).message || null,
          })
        }
        onError?.(err)
      },
    })
  }

  return (
    <View style={styles.root}>
      <View style={styles.actionContainer}>
        <Button
          onPress={onConfirm}
          title={strings.confirmButton}
          {...buttonProps}
          disabled={sendingTransaction || disabled}
        />
      </View>

      <Dialog
        process="withoutLedger"
        step={dialogStep}
        onRequestClose={() => setDialogStep(DialogStep.Closed)}
        errorData={errorData}
      />
    </View>
  )
}

export const ConfirmWithSignature: React.FC<SignAndSubmitProps | OnlySignProps> = ({
  txDataSignRequest,
  onError,
  onSuccess,
  buttonProps,
  setUseUSB,
  useUSB,
  isProvidingPassword,
  providedPassword = '',
  process,
  disabled,
}) => {
  const intl = useIntl()
  const strings = useStrings()
  const navigation = useNavigation()
  const dispatch = useDispatch()

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

  const {saveAndSubmitTx} = useSaveAndSubmitSignedTx({wallet})

  const [password, setPassword] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [dialogStep, setDialogStep] = useState(DialogStep.Closed)
  const [errorData, setErrorData] = useState<ErrorData>({
    errorMessage: '',
    errorLogs: '',
  })

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

  const showError = ({errorMessage, errorLogs}: ErrorData) => {
    setErrorData({
      errorMessage,
      errorLogs,
    })
    setDialogStep(DialogStep.Error)
  }

  const setLedgerDeviceId = (deviceId) => dispatch(_setLedgerDeviceId(deviceId))
  const setLedgerDeviceObj = (deviceObj) => dispatch(_setLedgerDeviceObj(deviceObj))

  const onChooseTransport = (useUSB: boolean) => {
    if (!hwDeviceInfo) throw new Error('No device info')
    setUseUSB(useUSB)
    setDialogStep(DialogStep.LedgerConnect)
  }

  const onConnectUSB = async (deviceObj) => {
    await setLedgerDeviceObj(deviceObj)
    await delay(1000)
    onConfirm()
  }

  const onConnectBLE = async (deviceId) => {
    await setLedgerDeviceId(deviceId)
    await delay(1000)
    onConfirm()
  }

  const _onConfirm = async () => {
    if (isHW && Platform.OS === 'android' && CONFIG.HARDWARE_WALLETS.LEDGER_NANO.ENABLE_USB_TRANSPORT) {
      setDialogStep(DialogStep.ChooseTransport)
    } else if (wallet.isEasyConfirmationEnabled) {
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
      setIsProcessing(true)

      let signedTx
      if (isEasyConfirmationEnabled) {
        if (easyConfirmDecryptKey) {
          setDialogStep(DialogStep.Signing)
          signedTx = await wallet.signTx(txDataSignRequest, easyConfirmDecryptKey)
        }
      } else {
        if (wallet.isHW) {
          setDialogStep(DialogStep.WaitingHwResponse)
          signedTx = await wallet.signTxWithLedger(txDataSignRequest, useUSB)
        } else {
          const decryptedKey = await KeyStore.getData(walletManager._id, 'MASTER_PASSWORD', '', password, intl)
          setDialogStep(DialogStep.Signing)
          signedTx = await wallet.signTx(txDataSignRequest, decryptedKey)
        }
      }

      if (process === 'onlySign') {
        onSuccess(signedTx)
      } else {
        setDialogStep(DialogStep.Submitting)
        saveAndSubmitTx(signedTx, {
          onSuccess: () => {
            setDialogStep(DialogStep.Closed)
            onSuccess(signedTx)
          },
          onError: (err) => {
            if (err instanceof LocalizableError) {
              showError({
                errorMessage: strings.errorMessage(err),
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                errorLogs: (err as any).values.response || null,
              })
            } else {
              showError({
                errorMessage: strings.generalTxErrorMessage,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                errorLogs: (err as any).message || null,
              })
            }
            onError?.(err)
          },
        })
      }
    } catch (err) {
      if (err instanceof WrongPassword) {
        showError({
          errorMessage: strings.incorrectPasswordTitle,
          errorLogs: strings.incorrectPasswordMessage,
        })
      } else {
        showError({
          errorMessage: strings.generalTxErrorMessage,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          errorLogs: (err as any).message || null,
        })
      }
    } finally {
      setIsProcessing(false)
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
          {...buttonProps}
          disabled={isConfirmationDisabled || isProcessing || disabled}
        />
      </View>

      <Dialog
        process="withLedger"
        step={dialogStep}
        onRequestClose={() => {
          setIsProcessing(false)
          setDialogStep(DialogStep.Closed)
        }}
        onChooseTransport={onChooseTransport}
        onConnectUSB={onConnectUSB}
        onConnectBLE={onConnectBLE}
        useUSB={useUSB}
        errorData={errorData}
      />
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

const useStrings = () => {
  const intl = useIntl()

  return {
    errorMessage: (error: LocalizableError) =>
      intl.formatMessage({id: error.id, defaultMessage: error.defaultMessage}, error.values),
    password: intl.formatMessage(txLabels.password),
    confirmButton: intl.formatMessage(confirmationMessages.commonButtons.confirmButton),
    generalTxErrorMessage: intl.formatMessage(errorMessages.generalTxError.message),
    incorrectPasswordTitle: intl.formatMessage(errorMessages.incorrectPassword.title),
    incorrectPasswordMessage: intl.formatMessage(errorMessages.incorrectPassword.message),
  }
}
