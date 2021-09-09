// @flow

/**
 * Step 5 for the Catalyst registration
 * Ask password used for signing transaction or sign with HW wallet
 * submit the transaction
 */

import React, {useEffect, useState} from 'react'
import {ScrollView, Platform, StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {injectIntl, defineMessages} from 'react-intl'
import {useDispatch, useSelector} from 'react-redux'
import {useNavigation} from '@react-navigation/native'

import {CONFIG} from '../../config/config'
import KeyStore from '../../crypto/KeyStore'
import {formatTokenWithSymbol} from '../../utils/format'
import assert from '../../utils/assert'
import {showErrorDialog, submitTransaction, submitSignedTx} from '../../actions'
import {generateVotingTransaction} from '../../actions/voting'
import {setLedgerDeviceId, setLedgerDeviceObj} from '../../actions/hwWallet'
import {
  easyConfirmationSelector,
  defaultNetworkAssetSelector,
  isHWSelector,
  hwDeviceInfoSelector,
  unsignedTxSelector,
} from '../../selectors'
import {ProgressStep, Button, OfflineBanner, TextInput, Spacer} from '../UiKit'
import HWInstructions from '../Ledger/HWInstructions'
import LocalizableError from '../../i18n/LocalizableError'
import {CATALYST_ROUTES, WALLET_ROOT_ROUTES} from '../../RoutesList'
import walletManager, {SystemAuthDisabled} from '../../crypto/walletManager'
import {errorMessages, confirmationMessages, txLabels} from '../../i18n/global-messages'
import {WrongPassword} from '../../crypto/errors'
import Dialog, {DIALOG_STEPS} from './Dialog'
import {Actions, Description, Title} from './components'

import type {DialogStep} from './Dialog'

import type {IntlShape} from 'react-intl'
import type {DeviceId, DeviceObj} from '../../crypto/shelley/ledgerUtils'

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

type ErrorData = {|
  errorMessage: string,
  errorLogs: ?string,
|}

type Props = {intl: IntlShape}
const Step5 = ({intl}: Props) => {
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
          errorMessage: intl.formatMessage({id: error.id, defaultMessage: error.defaultMessage}, error.values),
          errorLogs: error.values.response || null,
        })
      } else {
        setErrorData({
          errorMessage: intl.formatMessage(errorMessages.generalTxError.message),
          errorLogs: error.message || null,
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

        <Title>{intl.formatMessage(messages.subTitle)}</Title>

        <Spacer height={16} />

        {isHW ? (
          <HWInstructions useUSB={useUSB} />
        ) : (
          <Description>
            {isEasyConfirmationEnabled
              ? intl.formatMessage(messages.bioAuthDescription)
              : intl.formatMessage(messages.description)}
          </Description>
        )}

        <Spacer height={48} />

        <TextInput
          value={fees ? formatTokenWithSymbol(fees, defaultAsset) : ''}
          label={intl.formatMessage(txLabels.fees)}
          editable={false}
        />

        {!isEasyConfirmationEnabled && !isHW && (
          <TextInput
            secureTextEntry
            value={password}
            label={intl.formatMessage(txLabels.password)}
            onChangeText={setPassword}
          />
        )}
      </ScrollView>

      <Spacer fill />

      <Actions>
        <Button
          onPress={onContinue}
          title={intl.formatMessage(confirmationMessages.commonButtons.confirmButton)}
          disabled={isConfirmationDisabled}
        />
      </Actions>

      <Dialog
        step={dialogStep}
        onRequestClose={() => setDialogStep(DIALOG_STEPS.CLOSED)}
        onChooseTransport={onChooseTransport}
        onConnectUSB={onConnectUSB}
        onConnectBLE={onConnectBLE}
        useUSB={useUSB}
        errorData={errorData}
        intl={intl}
      />
    </SafeAreaView>
  )
}

export default injectIntl(Step5)
