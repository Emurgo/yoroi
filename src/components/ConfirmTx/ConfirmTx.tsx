/* eslint-disable @typescript-eslint/no-explicit-any */
import {useNavigation} from '@react-navigation/native'
import {delay} from 'bluebird'
import React, {useEffect, useState} from 'react'
import {useIntl} from 'react-intl'
import {Platform, StyleSheet, View} from 'react-native'
import {useDispatch, useSelector} from 'react-redux'

import {useSubmitTx} from '../../hooks'
import {confirmationMessages, errorMessages, txLabels} from '../../i18n/global-messages'
import LocalizableError from '../../i18n/LocalizableError'
import {showErrorDialog} from '../../legacy/actions'
import {CONFIG} from '../../legacy/config'
import {ensureKeysValidity} from '../../legacy/deviceSettings'
import {WrongPassword} from '../../legacy/errors'
import {setLedgerDeviceId as _setLedgerDeviceId, setLedgerDeviceObj as _setLedgerDeviceObj} from '../../legacy/hwWallet'
import KeyStore from '../../legacy/KeyStore'
import {hwDeviceInfoSelector} from '../../legacy/selectors'
import {useSelectedWallet} from '../../SelectedWallet'
import {COLORS} from '../../theme'
import {HaskellShelleyTxSignRequest, SignedTx, SystemAuthDisabled, walletManager} from '../../yoroi-wallets'
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
  txDataSignRequest: HaskellShelleyTxSignRequest
  useUSB: boolean
  setUseUSB: (useUSB: boolean) => void
  isProvidingPassword?: boolean
  providedPassword?: string
  disabled?: boolean
}

type SignAndSubmitProps = {
  process: 'signAndSubmit'
  autoSignIfEasyConfirmation?: boolean
  chooseTransportOnConfirmation?: boolean
  biometricInstructions?: Array<string>
} & ConfirmTxProps

type OnlySignProps = {
  process: 'onlySign'
  autoSignIfEasyConfirmation?: boolean
  chooseTransportOnConfirmation?: boolean
  biometricInstructions?: Array<string>
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

  const {submitTx, isLoading: sendingTransaction} = useSubmitTx({wallet})

  const onConfirm = () => {
    setDialogStep(DialogStep.Submitting)
    submitTx(signedTx, {
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
  autoSignIfEasyConfirmation,
  chooseTransportOnConfirmation,
  biometricInstructions,
}) => {
  const intl = useIntl()
  const strings = useStrings()
  const navigation = useNavigation()
  const dispatch = useDispatch()

  const hwDeviceInfo = useSelector(hwDeviceInfoSelector)

  const wallet = useSelectedWallet()

  const {mutateAsync: submitTx} = useSubmitTx({wallet})

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

  const onConfirmationChooseTransport = (useUSB: boolean) => {
    if (!hwDeviceInfo) throw new Error('No device info')
    setUseUSB(useUSB)
    setDialogStep(DialogStep.LedgerConnect)
  }

  const onMountChooseTransport = (useUSB: boolean) => {
    if (!hwDeviceInfo) throw new Error('No device info')
    setUseUSB(useUSB)
    if (
      (useUSB && hwDeviceInfo.hwFeatures.deviceObj == null) ||
      (!useUSB && hwDeviceInfo.hwFeatures.deviceId == null)
    ) {
      setDialogStep(DialogStep.LedgerConnect)
    } else {
      setDialogStep(DialogStep.Closed)
    }
  }

  const onConnectUSB = async (deviceObj) => {
    await setLedgerDeviceObj(deviceObj)
    if (chooseTransportOnConfirmation) {
      await delay(1000)
      onConfirm()
    } else {
      setDialogStep(DialogStep.Closed)
    }
  }

  const onConnectBLE = async (deviceId) => {
    await setLedgerDeviceId(deviceId)
    if (chooseTransportOnConfirmation) {
      await delay(1000)
      onConfirm()
    } else {
      setDialogStep(DialogStep.Closed)
    }
  }

  const onConfirm = React.useCallback(
    async (easyConfirmDecryptKey?: string) => {
      try {
        setIsProcessing(true)

        let signedTx
        if (wallet.isEasyConfirmationEnabled) {
          if (easyConfirmDecryptKey) {
            setDialogStep(DialogStep.Signing)
            signedTx = await smoothModalNotification(wallet.signTx(txDataSignRequest, easyConfirmDecryptKey))
          }
        } else {
          if (wallet.isHW) {
            setDialogStep(DialogStep.WaitingHwResponse)
            signedTx = await wallet.signTxWithLedger(txDataSignRequest, useUSB)
          } else {
            const decryptedKey = await KeyStore.getData(walletManager._id, 'MASTER_PASSWORD', '', password, intl)
            setDialogStep(DialogStep.Signing)
            signedTx = await smoothModalNotification(wallet.signTx(txDataSignRequest, decryptedKey))
          }
        }

        if (process === 'onlySign') {
          onSuccess(signedTx)
        } else {
          setDialogStep(DialogStep.Submitting)
          try {
            await smoothModalNotification(submitTx(signedTx))
            setDialogStep(DialogStep.Closed)
            onSuccess(signedTx)
          } catch (err) {
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
            onError?.(err as Error)
          }
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
    },
    [intl, onError, onSuccess, password, process, submitTx, strings, txDataSignRequest, useUSB, wallet],
  )

  const _onConfirm = React.useCallback(async () => {
    if (
      wallet.isHW &&
      Platform.OS === 'android' &&
      CONFIG.HARDWARE_WALLETS.LEDGER_NANO.ENABLE_USB_TRANSPORT &&
      chooseTransportOnConfirmation
    ) {
      setDialogStep(DialogStep.ChooseTransport)
    } else if (wallet.isEasyConfirmationEnabled) {
      try {
        await ensureKeysValidity(wallet.id)
        navigation.navigate('biometrics', {
          keyId: wallet.id,
          onSuccess: (decryptedKey) => {
            navigation.goBack()
            onConfirm(decryptedKey)
          },
          onFail: () => navigation.goBack(),
          addWelcomeMessage: false,
          instructions: biometricInstructions,
        })
      } catch (err) {
        if (err instanceof SystemAuthDisabled) {
          await showErrorDialog(errorMessages.enableSystemAuthFirst, intl)
          navigation.goBack()
          return
        } else {
          throw err
        }
      }
      return
    } else {
      return onConfirm()
    }
  }, [
    intl,
    wallet.isHW,
    navigation,
    onConfirm,
    wallet.id,
    wallet.isEasyConfirmationEnabled,
    chooseTransportOnConfirmation,
    biometricInstructions,
  ])

  const isConfirmationDisabled = !wallet.isEasyConfirmationEnabled && !password && !wallet.isHW

  useEffect(() => {
    if (wallet.isEasyConfirmationEnabled && autoSignIfEasyConfirmation) {
      _onConfirm()
    }
  }, [autoSignIfEasyConfirmation, wallet.isEasyConfirmationEnabled, _onConfirm])

  useEffect(() => {
    if (
      wallet.isHW &&
      Platform.OS === 'android' &&
      CONFIG.HARDWARE_WALLETS.LEDGER_NANO.ENABLE_USB_TRANSPORT &&
      !chooseTransportOnConfirmation
    ) {
      setDialogStep(DialogStep.ChooseTransport)
    }
  }, [chooseTransportOnConfirmation, wallet.isHW])

  return (
    <View style={styles.root}>
      <View style={styles.actionContainer}>
        {!wallet.isEasyConfirmationEnabled && !wallet.isHW && !isProvidingPassword && (
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
          if (dialogStep === DialogStep.WaitingHwResponse) {
            navigation.goBack()
          }
        }}
        onChooseTransport={chooseTransportOnConfirmation ? onConfirmationChooseTransport : onMountChooseTransport}
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
      intl.formatMessage({id: error.id, defaultMessage: error.defaultMessage}, (error as any).values),
    password: intl.formatMessage(txLabels.password),
    confirmButton: intl.formatMessage(confirmationMessages.commonButtons.confirmButton),
    generalTxErrorMessage: intl.formatMessage(errorMessages.generalTxError.message),
    incorrectPasswordTitle: intl.formatMessage(errorMessages.incorrectPassword.title),
    incorrectPasswordMessage: intl.formatMessage(errorMessages.incorrectPassword.message),
  }
}

const minDisplayTime = 2000
// to avoid flicking from one message to another
async function smoothModalNotification<T = unknown>(promise: Promise<T>) {
  const [result] = await Promise.all([promise, delay(minDisplayTime)])
  return result
}
