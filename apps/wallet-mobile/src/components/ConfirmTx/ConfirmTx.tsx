/* eslint-disable @typescript-eslint/no-explicit-any */
import {useNavigation} from '@react-navigation/native'
import React, {useEffect, useState} from 'react'
import {useIntl} from 'react-intl'
import {StyleSheet, View} from 'react-native'

import {debugWalletInfo, features} from '../../features'
import {useSelectedWallet} from '../../features/AddWallet/common/Context'
import {confirmationMessages, errorMessages, txLabels} from '../../i18n/global-messages'
import LocalizableError from '../../i18n/LocalizableError'
import {COLORS} from '../../theme'
import {isEmptyString} from '../../utils/utils'
import {walletManager} from '../../wallet-manager/walletManager'
import {useAuthOsWithEasyConfirmation} from '../../yoroi-wallets/auth'
import {WrongPassword} from '../../yoroi-wallets/cardano/errors'
import {useSubmitTx} from '../../yoroi-wallets/hooks'
import {DeviceId, DeviceObj, withBLE, withUSB} from '../../yoroi-wallets/hw'
import {YoroiSignedTx, YoroiUnsignedTx} from '../../yoroi-wallets/types'
import {delay} from '../../yoroi-wallets/utils/timeUtils'
import {Button, ButtonProps, ValidatedTextInput} from '..'
import {Dialog, Step as DialogStep} from './Dialog'

type ErrorData = {
  errorMessage: string
  errorLogs?: string
}

type Props = {
  buttonProps?: Omit<Partial<ButtonProps>, 'disabled' | 'onPress'>
  onSuccess: (signedTx: YoroiSignedTx) => void
  onError?: (err: Error) => void
  yoroiUnsignedTx: YoroiUnsignedTx
  useUSB: boolean
  setUseUSB: (useUSB: boolean) => void
  supportsCIP36?: boolean
  onCIP36SupportChange?: (isSupported: boolean) => void
  isProvidingPassword?: boolean
  providedPassword?: string
  disabled?: boolean
  autoSignIfEasyConfirmation?: boolean
  chooseTransportOnConfirmation?: boolean
  biometricInstructions?: Array<string>
  autoConfirm?: boolean
}

export const ConfirmTx = ({
  yoroiUnsignedTx,
  onError,
  onSuccess,
  buttonProps,
  setUseUSB,
  useUSB,
  isProvidingPassword,
  providedPassword = '',
  disabled,
  autoSignIfEasyConfirmation,
  chooseTransportOnConfirmation,
  supportsCIP36,
  onCIP36SupportChange,
  autoConfirm,
}: Props) => {
  const strings = useStrings()
  const navigation = useNavigation()

  const wallet = useSelectedWallet()

  const {mutateAsync: submitTx} = useSubmitTx({wallet})

  const [password, setPassword] = useState('')
  const [isProcessed, setIsProcessed] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [dialogStep, setDialogStep] = useState(DialogStep.Closed)
  const [errorData, setErrorData] = useState<ErrorData>({
    errorMessage: '',
    errorLogs: '',
  })
  useEffect(() => {
    if (!isProvidingPassword && __DEV__) {
      setPassword(features.prefillWalletInfo ? debugWalletInfo.PASSWORD : '')
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

  const onConfirmationChooseTransport = (useUSB: boolean) => {
    if (!wallet.hwDeviceInfo) throw new Error('No device info')
    setUseUSB(useUSB)

    setDialogStep(DialogStep.LedgerConnect)
  }

  const onMountChooseTransport = (useUSB: boolean) => {
    if (!wallet.hwDeviceInfo) throw new Error('No device info')
    setUseUSB(useUSB)

    const hwFeatures = wallet.hwDeviceInfo.hwFeatures

    if ((useUSB && hwFeatures.deviceObj == null) || (!useUSB && hwFeatures.deviceId == null)) {
      setDialogStep(DialogStep.LedgerConnect)
    } else {
      setDialogStep(DialogStep.Closed)
    }
  }

  const onConnectUSB = async (deviceObj: DeviceObj) => {
    await walletManager.updateHWDeviceInfo(wallet, withUSB(wallet, deviceObj))

    if (yoroiUnsignedTx.unsignedTx.catalystRegistrationData && onCIP36SupportChange) {
      const isCIP36Supported = await wallet.ledgerSupportsCIP36(useUSB)
      if (supportsCIP36 !== isCIP36Supported) {
        onCIP36SupportChange(isCIP36Supported)
        return
      }
    }

    if (chooseTransportOnConfirmation) {
      await delay(1000)
      onConfirm()
    } else {
      setDialogStep(DialogStep.Closed)
    }
  }

  const onConnectBLE = async (deviceId: DeviceId) => {
    await walletManager.updateHWDeviceInfo(wallet, withBLE(wallet, deviceId))

    if (yoroiUnsignedTx.unsignedTx.catalystRegistrationData && onCIP36SupportChange) {
      const isCIP36Supported = await wallet.ledgerSupportsCIP36(useUSB)
      if (supportsCIP36 !== isCIP36Supported) {
        onCIP36SupportChange(isCIP36Supported)
        return
      }
    }

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

        let signedTx: YoroiSignedTx
        if (wallet.isEasyConfirmationEnabled) {
          if (!isEmptyString(easyConfirmDecryptKey)) {
            setDialogStep(DialogStep.Signing)
            signedTx = await smoothModalNotification(wallet.signTx(yoroiUnsignedTx, easyConfirmDecryptKey))
          } else {
            throw new Error('Empty decrypt key')
          }
        } else {
          if (wallet.isHW) {
            setDialogStep(DialogStep.WaitingHwResponse)
            signedTx = await wallet.signTxWithLedger(yoroiUnsignedTx, useUSB)
          } else {
            const rootKey = await wallet.encryptedStorage.rootKey.read(password)
            setDialogStep(DialogStep.Signing)
            signedTx = await smoothModalNotification(wallet.signTx(yoroiUnsignedTx, rootKey))
          }
        }

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
              errorLogs: (err as any).values?.response,
            })
          } else {
            showError({
              errorMessage: strings.generalTxErrorMessage,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              errorLogs: (err as any).message,
            })
          }
          onError?.(err as Error)
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
            errorLogs: (err as any).message,
          })
          onError?.(err as Error)
        }
      } finally {
        setIsProcessed(true)
        setIsProcessing(false)
      }
    },
    [onError, onSuccess, password, strings, submitTx, useUSB, wallet, yoroiUnsignedTx],
  )

  const {authWithOs} = useAuthOsWithEasyConfirmation({id: wallet.id}, {onSuccess: onConfirm})

  const _onConfirm = React.useCallback(async () => {
    if (wallet.isHW && chooseTransportOnConfirmation) {
      setDialogStep(DialogStep.ChooseTransport)
    } else if (wallet.isEasyConfirmationEnabled) {
      return authWithOs()
    } else {
      return onConfirm()
    }
  }, [wallet.isHW, wallet.isEasyConfirmationEnabled, chooseTransportOnConfirmation, authWithOs, onConfirm])

  const isConfirmationDisabled = !wallet.isEasyConfirmationEnabled && isEmptyString(password) && !wallet.isHW

  useEffect(() => {
    if (wallet.isEasyConfirmationEnabled && autoSignIfEasyConfirmation) {
      _onConfirm()
    }
  }, [autoSignIfEasyConfirmation, wallet.isEasyConfirmationEnabled, _onConfirm])

  useEffect(() => {
    if (!autoConfirm || isProcessing || isProcessed) return
    onConfirm()
  }, [autoConfirm, onConfirm, isProcessing, isProcessed])

  useEffect(() => {
    if (wallet.isHW && !chooseTransportOnConfirmation) {
      setDialogStep(DialogStep.ChooseTransport)
    }
  }, [chooseTransportOnConfirmation, wallet.isHW])

  return (
    <View style={styles.root}>
      <View style={styles.actionContainer}>
        {!wallet.isEasyConfirmationEnabled && !wallet.isHW && !isProvidingPassword && (
          <ValidatedTextInput
            secureTextEntry
            value={password ?? ''}
            label={strings.password}
            onChangeText={setPassword}
          />
        )}

        <Button
          onPress={_onConfirm}
          title={strings.confirmButton}
          {...buttonProps}
          disabled={isConfirmationDisabled || isProcessing || disabled}
          testID="confirmTxButton"
          shelleyTheme
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
