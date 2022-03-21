import {useNavigation} from '@react-navigation/native'
import React, {useEffect, useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Platform} from 'react-native'
import {ScrollView, StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useDispatch, useSelector} from 'react-redux'

import {showErrorDialog, submitSignedTx, submitTransaction} from '../../legacy/actions'
import {setLedgerDeviceId, setLedgerDeviceObj} from '../../legacy/actions/hwWallet'
import {generateVotingTransaction} from '../../legacy/actions/voting'
import HWInstructions from '../../legacy/components/Ledger/HWInstructions'
import {Button, OfflineBanner, ProgressStep} from '../../legacy/components/UiKit'
import {TextInput} from '../../legacy/components/UiKit'
import {CONFIG} from '../../legacy/config/config'
import {WrongPassword} from '../../legacy/crypto/errors'
import KeyStore from '../../legacy/crypto/KeyStore'
import type {DeviceId, DeviceObj} from '../../legacy/crypto/shelley/ledgerUtils'
import walletManager, {SystemAuthDisabled} from '../../legacy/crypto/walletManager'
import {confirmationMessages, errorMessages, txLabels} from '../../legacy/i18n/global-messages'
import LocalizableError from '../../legacy/i18n/LocalizableError'
import {CATALYST_ROUTES, WALLET_ROOT_ROUTES} from '../../legacy/RoutesList'
import {
  defaultNetworkAssetSelector,
  easyConfirmationSelector,
  hwDeviceInfoSelector,
  isHWSelector,
  unsignedTxSelector,
} from '../../legacy/selectors'
import assert from '../../legacy/utils/assert'
import {formatTokenWithSymbol} from '../../legacy/utils/format'
import {Spacer} from '../components'
import {Actions, Description, Title} from './components'
import type {DialogStep} from './Dialog'
import {Dialog, DIALOG_STEPS} from './Dialog'

type ErrorData = {
  errorMessage: string
  errorLogs?: string
}

export const Step5 = () => {
  const intl = useIntl()
  const strings = useStrings()
  const navigation = useNavigation()
  const isEasyConfirmationEnabled = useSelector(easyConfirmationSelector)
  const unsignedTx = useSelector(unsignedTxSelector)
  const defaultAsset = useSelector(defaultNetworkAssetSelector)
  const isHW = useSelector(isHWSelector)
  const hwDeviceInfo = useSelector(hwDeviceInfoSelector)
  const dispatch = useDispatch()
  const [password, setPassword] = useState(CONFIG.DEBUG.PREFILL_FORMS ? CONFIG.DEBUG.PASSWORD : '')

  const [dialogStep, setDialogStep] = useState<DialogStep>(DIALOG_STEPS.CLOSED)
  const [errorData, setErrorData] = useState<ErrorData>({
    errorMessage: '',
    errorLogs: '',
  })
  const [fees, setFees] = useState(null)
  const [useUSB, setUseUSB] = useState<boolean>(false)

  const onChooseTransport = (_, shouldUseUSB: boolean) => {
    setUseUSB(shouldUseUSB)
    if (
      (shouldUseUSB && hwDeviceInfo?.hwFeatures.deviceObj == null) ||
      (!shouldUseUSB && hwDeviceInfo?.hwFeatures.deviceId == null)
    ) {
      setDialogStep(DIALOG_STEPS.LEDGER_CONNECT)
    } else {
      setDialogStep(DIALOG_STEPS.CLOSED)
    }
  }

  const onConnectUSB = async (deviceObj: DeviceObj) => {
    await dispatch(setLedgerDeviceObj(deviceObj))
    setDialogStep(DIALOG_STEPS.CLOSED)
  }

  const onConnectBLE = async (deviceId: DeviceId) => {
    await dispatch(setLedgerDeviceId(deviceId))
    setDialogStep(DIALOG_STEPS.CLOSED)
  }

  useEffect(() => {
    const generateTx = () => {
      dispatch(generateVotingTransaction())
    }

    if (unsignedTx != null) {
      unsignedTx.fee().then((o) => {
        setFees(o.getDefault())
      })
    } else if (isHW) {
      generateTx()
    }
  }, [unsignedTx, isHW, dispatch])

  useEffect(() => {
    if (isHW && Platform.OS === 'android' && CONFIG.HARDWARE_WALLETS.LEDGER_NANO.ENABLE_USB_TRANSPORT) {
      setDialogStep(DIALOG_STEPS.CHOOSE_TRANSPORT)
    }
  }, [isHW])

  const isConfirmationDisabled = !isEasyConfirmationEnabled && !isHW && !password

  const submitTx = async (decryptedKey: string | void) => {
    try {
      if (unsignedTx == null) {
        // note: should never happen
        throw new Error('Catalyst::submitTx: Could not retrieve transaction data')
      }
      if (decryptedKey !== undefined) {
        assert.assert(typeof decryptedKey === 'string', 'Catalyst::submitTx: Invalid decryption key')
        setDialogStep(DIALOG_STEPS.SUBMITTING)
        await dispatch(submitTransaction(unsignedTx, decryptedKey))
      } else {
        // if no decryption key is given, we are signing with a HW
        assert.assert(isHW, 'Catalyst::submitTx: expected a HW wallet')
        setDialogStep(DIALOG_STEPS.WAITING_HW_RESPONSE)
        const signedTx = await walletManager.signTxWithLedger(unsignedTx, useUSB)
        setDialogStep(DIALOG_STEPS.SUBMITTING)
        await dispatch(submitSignedTx(Buffer.from(signedTx.encodedTx).toString('base64')))
      }
      navigation.navigate(CATALYST_ROUTES.STEP6)
    } finally {
      setDialogStep(DIALOG_STEPS.CLOSED)
    }
  }

  const onContinue = async () => {
    try {
      if (isHW) {
        await submitTx()
        return
      }

      if (isEasyConfirmationEnabled) {
        try {
          await walletManager.ensureKeysValidity()
          navigation.navigate(CATALYST_ROUTES.BIOMETRICS_SIGNING, {
            keyId: walletManager._id,
            onSuccess: async (decryptedKey) => {
              await submitTx(decryptedKey)
            },
            addWelcomeMessage: false,
            onFail: () => navigation.goBack(),
          })
        } catch (error) {
          if (error instanceof SystemAuthDisabled) {
            await walletManager.closeWallet()
            await showErrorDialog(errorMessages.enableSystemAuthFirst, intl)
            navigation.navigate(WALLET_ROOT_ROUTES.WALLET_SELECTION)

            return
          } else {
            throw error
          }
        }
        return
      }

      try {
        const decryptedKey = await KeyStore.getData(walletManager._id, 'MASTER_PASSWORD', '', password, intl)

        await submitTx(decryptedKey)
      } catch (error) {
        if (error instanceof WrongPassword) {
          await showErrorDialog(errorMessages.incorrectPassword, intl)
        } else {
          throw error
        }
      }
    } catch (error) {
      if (error instanceof LocalizableError) {
        setErrorData({
          errorMessage: strings.errorMessage(error),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          errorLogs: (error as any).values.response || null,
        })
      } else {
        setErrorData({
          errorMessage: strings.generalTxErrorMessage,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          errorLogs: (error as any).message || null,
        })
      }
      setDialogStep(DIALOG_STEPS.ERROR)
    }
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <ProgressStep currentStep={5} totalSteps={6} />

      <OfflineBanner />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Spacer height={48} />

        <Title>{strings.subTitle}</Title>

        <Spacer height={16} />

        {isHW ? (
          <HWInstructions useUSB={useUSB} />
        ) : (
          <Description>{isEasyConfirmationEnabled ? strings.bioAuthDescription : strings.description}</Description>
        )}

        <Spacer height={48} />

        <TextInput
          value={fees ? formatTokenWithSymbol(fees, defaultAsset) : ''}
          label={strings.fees}
          editable={false}
        />

        {!isEasyConfirmationEnabled && !isHW && (
          <TextInput secureTextEntry value={password} label={strings.password} onChangeText={setPassword} />
        )}
      </ScrollView>

      <Spacer fill />

      <Actions>
        <Button onPress={onContinue} title={strings.confirmButton} disabled={isConfirmationDisabled} />
      </Actions>

      <Dialog
        step={dialogStep}
        onRequestClose={() => setDialogStep(DIALOG_STEPS.CLOSED)}
        onChooseTransport={onChooseTransport}
        onConnectUSB={onConnectUSB}
        onConnectBLE={onConnectBLE}
        useUSB={useUSB}
        errorData={errorData}
      />
    </SafeAreaView>
  )
}

const messages = defineMessages({
  subTitle: {
    id: 'components.catalyst.step5.subTitle',
    defaultMessage: '!!!Confirm Registration',
  },
  description: {
    id: 'components.catalyst.step5.description',
    defaultMessage:
      '!!!Please enter your spending password again to confirm your voting ' +
      'registration and submit the certificate generated in the previous ' +
      'step.',
  },
  bioAuthDescription: {
    id: 'components.catalyst.step5.bioAuthDescription',
    defaultMessage:
      '!!!Please confirm your voting registration. You will be asked to ' +
      'authenticate once again to sign and submit the certificate generated ' +
      'in the previous step.',
  },
})

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    errorMessage: (error: LocalizableError) =>
      intl.formatMessage({id: error.id, defaultMessage: error.defaultMessage}, error.values),
    fees: intl.formatMessage(txLabels.fees),
    generalTxErrorMessage: intl.formatMessage(errorMessages.generalTxError.message),
    subTitle: intl.formatMessage(messages.subTitle),
    description: intl.formatMessage(messages.description),
    bioAuthDescription: intl.formatMessage(messages.bioAuthDescription),
    password: intl.formatMessage(txLabels.password),
    confirmButton: intl.formatMessage(confirmationMessages.commonButtons.confirmButton),
  }
}
