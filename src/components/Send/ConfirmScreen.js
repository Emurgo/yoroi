// @flow

import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {ScrollView, View, Platform} from 'react-native'
import {withHandlers, withStateHandlers} from 'recompose'
import {SafeAreaView} from 'react-navigation'
import {injectIntl, defineMessages} from 'react-intl'

import {
  Text,
  Button,
  OfflineBanner,
  ValidatedTextInput,
  StatusBar,
  Banner,
  PleaseWaitModal,
  Modal,
} from '../UiKit'
import ErrorModal from '../Common/ErrorModal'
import {
  easyConfirmationSelector,
  isHWSelector,
  hwDeviceInfoSelector,
} from '../../selectors'
import globalMessages, {
  errorMessages,
  txLabels,
  confirmationMessages,
} from '../../i18n/global-messages'
import walletManager, {SystemAuthDisabled} from '../../crypto/walletManager'
import {SEND_ROUTES, WALLET_ROUTES, WALLET_INIT_ROUTES} from '../../RoutesList'
import {CONFIG} from '../../config/config'
import KeyStore from '../../crypto/KeyStore'
import {showErrorDialog, submitTransaction, submitSignedTx} from '../../actions'
import {setLedgerDeviceId, setLedgerDeviceObj} from '../../actions/hwWallet'
import {withNavigationTitle} from '../../utils/renderUtils'
import {formatAdaWithSymbol, formatAdaWithText} from '../../utils/format'
import {NetworkError, ApiError} from '../../api/errors'
import {WrongPassword} from '../../crypto/errors'
import {ignoreConcurrentAsyncHandler} from '../../utils/utils'
import LedgerTransportSwitchModal from '../Ledger/LedgerTransportSwitchModal'
import LedgerConnect from '../Ledger/LedgerConnect'
import HWInstructions from '../Ledger/HWInstructions'
import LocalizableError from '../../i18n/LocalizableError'

import type {BaseSignRequest} from '../../crypto/types'

import styles from './styles/ConfirmScreen.style'

const messages = defineMessages({
  title: {
    id: 'components.send.confirmscreen.title',
    defaultMessage: '!!!Send',
    description: 'some desc',
  },
  confirmWithLedger: {
    id: 'components.send.confirmscreen.confirmWithLedger',
    defaultMessage: '!!!Confirm with Ledger',
  },
})

const handleOnConfirm = async (
  navigation,
  isHW,
  hwDeviceInfo,
  isEasyConfirmationEnabled,
  password,
  submitTransaction,
  submitSignedTx,
  withPleaseWaitModal,
  withDisabledButton,
  intl,
  useUSB,
  setErrorData,
) => {
  const transactionData = navigation.getParam('transactionData') // ISignRequest
  const signRequest = transactionData.signRequest

  const submitTx = async <T>(
    tx: string | BaseSignRequest<T>,
    decryptedKey: ?string,
  ) => {
    await withPleaseWaitModal(async () => {
      try {
        if (decryptedKey != null) {
          await submitTransaction(decryptedKey, tx)
        } else {
          await submitSignedTx(tx)
        }

        navigation.navigate(WALLET_ROUTES.TX_HISTORY)
      } catch (e) {
        if (e instanceof NetworkError) {
          // trigger error modal
          setErrorData(
            true,
            intl.formatMessage(errorMessages.networkError.message),
            null,
          )
        } else if (e instanceof ApiError) {
          setErrorData(
            true,
            intl.formatMessage(errorMessages.apiError.message),
            JSON.stringify(e.request),
          )
        } else {
          throw e
        }
      }
    })
  }

  if (isHW) {
    withDisabledButton(async () => {
      try {
        const signedTx = await walletManager.signTxWithLedger(
          transactionData,
          useUSB,
        )
        await submitTx(Buffer.from(signedTx.encodedTx).toString('base64'))
      } catch (e) {
        if (e instanceof LocalizableError) {
          setErrorData(
            true,
            intl.formatMessage({id: e.id, defaultMessage: e.defaultMessage}),
            null,
          )
        } else {
          setErrorData(
            true,
            intl.formatMessage(errorMessages.generalTxError.message),
            String(e.message),
          )
        }
      }
    })
    return
  }

  if (isEasyConfirmationEnabled) {
    try {
      await walletManager.ensureKeysValidity()
      navigation.navigate(SEND_ROUTES.BIOMETRICS_SIGNING, {
        keyId: walletManager._id,
        onSuccess: (decryptedKey) => {
          navigation.navigate(SEND_ROUTES.CONFIRM)

          submitTx(signRequest, decryptedKey)
        },
        onFail: () => navigation.goBack(),
      })
    } catch (e) {
      if (e instanceof SystemAuthDisabled) {
        await walletManager.closeWallet()
        await showErrorDialog(errorMessages.enableSystemAuthFirst, intl)
        navigation.navigate(WALLET_INIT_ROUTES.WALLET_SELECTION)

        return
      } else {
        setErrorData(
          true,
          intl.formatMessage(errorMessages.generalTxError.message),
          String(e.message),
        )
      }
    }

    return
  }

  try {
    const decryptedData = await KeyStore.getData(
      walletManager._id,
      'MASTER_PASSWORD',
      '',
      password,
      intl,
    )

    await submitTx(signRequest, decryptedData)
  } catch (e) {
    if (e instanceof WrongPassword) {
      await showErrorDialog(errorMessages.incorrectPassword, intl)
    } else {
      setErrorData(
        true,
        intl.formatMessage(errorMessages.generalTxError.message),
        String(e.message),
      )
    }
  }
}

const LEDGER_DIALOG_STEPS = {
  CLOSED: 'CLOSED',
  CHOOSE_TRANSPORT: 'CHOOSE_TRANSPORT',
  LEDGER_CONNECT: 'LEDGER_CONNECT',
}

const ConfirmScreen = ({
  onConfirm,
  intl,
  navigation,
  password,
  setPassword,
  isEasyConfirmationEnabled,
  isHW,
  sendingTransaction,
  buttonDisabled,
  ledgerDialogStep,
  closeLedgerDialog,
  useUSB,
  onChooseTransport,
  onConnectBLE,
  onConnectUSB,
  closeErrorModal,
  showErrorModal,
  errorMessageHeader,
  errorMessage,
}) => {
  const amount = navigation.getParam('amount')
  const address = navigation.getParam('address')
  const balanceAfterTx = navigation.getParam('balanceAfterTx')
  const availableAmount = navigation.getParam('availableAmount')
  const fee = navigation.getParam('fee')

  const isConfirmationDisabled =
    !isEasyConfirmationEnabled && !password && !isHW

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <View style={styles.root}>
        <StatusBar type="dark" />

        <OfflineBanner />
        <Banner
          label={intl.formatMessage(globalMessages.availableFunds)}
          text={formatAdaWithText(availableAmount)}
          boldText
        />

        <ScrollView style={styles.container}>
          <Text small>
            {intl.formatMessage(txLabels.fees)}: {formatAdaWithSymbol(fee)}
          </Text>
          <Text small>
            {intl.formatMessage(txLabels.balanceAfterTx)}:{' '}
            {formatAdaWithSymbol(balanceAfterTx)}
          </Text>

          <Text style={styles.heading} small>
            {intl.formatMessage(txLabels.receiver)}
          </Text>
          <Text>{address}</Text>
          <Text style={styles.heading} small>
            {intl.formatMessage(txLabels.amount)}
          </Text>
          <Text>{formatAdaWithSymbol(amount)}</Text>

          {/* eslint-disable indent */
          !isEasyConfirmationEnabled &&
            !isHW && (
              <View style={styles.input}>
                <ValidatedTextInput
                  secureTextEntry
                  value={password}
                  label={intl.formatMessage(txLabels.password)}
                  onChangeText={setPassword}
                />
              </View>
            )
          /* eslint-enable indent */
          }
          {isHW && <HWInstructions useUSB={useUSB} addMargin />}
        </ScrollView>
        <View style={styles.actions}>
          <Button
            onPress={onConfirm}
            title={intl.formatMessage(
              confirmationMessages.commonButtons.confirmButton,
            )}
            disabled={isConfirmationDisabled || buttonDisabled}
          />
        </View>
      </View>

      {/* eslint-disable indent */
      isHW &&
        Platform.OS === 'android' &&
        CONFIG.HARDWARE_WALLETS.LEDGER_NANO.ENABLE_USB_TRANSPORT && (
          <>
            <LedgerTransportSwitchModal
              visible={
                ledgerDialogStep === LEDGER_DIALOG_STEPS.CHOOSE_TRANSPORT
              }
              onRequestClose={closeLedgerDialog}
              onSelectUSB={(event) => onChooseTransport(event, true)}
              onSelectBLE={(event) => onChooseTransport(event, false)}
              showCloseIcon
            />
            <Modal
              visible={ledgerDialogStep === LEDGER_DIALOG_STEPS.LEDGER_CONNECT}
              onRequestClose={closeLedgerDialog}
            >
              <LedgerConnect
                onConnectBLE={onConnectBLE}
                onConnectUSB={onConnectUSB}
                useUSB={useUSB}
              />
            </Modal>
          </>
        )
      /* eslint-enable indent */
      }
      <ErrorModal
        visible={showErrorModal}
        title={intl.formatMessage(errorMessages.generalTxError.title)}
        message={errorMessageHeader}
        errorMessage={errorMessage}
        onRequestClose={closeErrorModal}
      />

      <PleaseWaitModal
        title={intl.formatMessage(txLabels.submittingTx)}
        spinnerText={intl.formatMessage(globalMessages.pleaseWait)}
        visible={sendingTransaction}
      />
    </SafeAreaView>
  )
}

export default injectIntl(
  compose(
    connect(
      (state) => ({
        isEasyConfirmationEnabled: easyConfirmationSelector(state),
        isHW: isHWSelector(state),
        hwDeviceInfo: hwDeviceInfoSelector(state),
      }),
      {
        submitTransaction,
        submitSignedTx,
        setLedgerDeviceId,
        setLedgerDeviceObj,
      },
    ),
    withStateHandlers(
      {
        password: CONFIG.DEBUG.PREFILL_FORMS ? CONFIG.DEBUG.PASSWORD : '',
        sendingTransaction: false,
        buttonDisabled: false,
        useUSB: false,
        ledgerDialogStep: LEDGER_DIALOG_STEPS.CHOOSE_TRANSPORT,
        showErrorModal: false,
        errorMessageHeader: '',
        errorMessage: '',
      },
      {
        setPassword: (state) => (value) => ({password: value}),
        setSendingTransaction: () => (sendingTransaction) => ({
          sendingTransaction,
        }),
        setButtonDisabled: () => (buttonDisabled) => ({buttonDisabled}),
        openLedgerConnect: (state) => () => ({
          ledgerDialogStep: LEDGER_DIALOG_STEPS.LEDGER_CONNECT,
        }),
        closeLedgerDialog: (state) => () => ({
          ledgerDialogStep: LEDGER_DIALOG_STEPS.CLOSED,
        }),
        setUseUSB: (state) => (useUSB) => ({useUSB}),
        closeErrorModal: (state) => () => ({showErrorModal: false}),
        setErrorData: () => (
          showErrorModal,
          errorMessageHeader,
          errorMessage,
        ) => ({showErrorModal, errorMessageHeader, errorMessage}),
      },
    ),
    withNavigationTitle(({intl}) => intl.formatMessage(messages.title)),
    withHandlers({
      withPleaseWaitModal: ({setSendingTransaction}) => async (
        func: () => Promise<void>,
      ): Promise<void> => {
        setSendingTransaction(true)
        try {
          await func()
        } finally {
          setSendingTransaction(false)
        }
      },
      withDisabledButton: ({setButtonDisabled}) => async (
        func: () => Promise<void>,
      ): Promise<void> => {
        setButtonDisabled(true)
        try {
          await func()
        } finally {
          setButtonDisabled(false)
        }
      },
    }),
    withHandlers({
      onChooseTransport: ({
        hwDeviceInfo,
        setUseUSB,
        openLedgerConnect,
        closeLedgerDialog,
      }) => (event, useUSB) => {
        setUseUSB(useUSB)
        if (
          (useUSB && hwDeviceInfo.hwFeatures.deviceObj == null) ||
          (!useUSB && hwDeviceInfo.hwFeatures.deviceId == null)
        ) {
          openLedgerConnect()
        } else {
          closeLedgerDialog()
        }
      },
      onConnectUSB: ({setLedgerDeviceObj, closeLedgerDialog}) => (
        deviceObj,
      ) => {
        setLedgerDeviceObj(deviceObj)
        closeLedgerDialog()
      },
      onConnectBLE: ({setLedgerDeviceId, closeLedgerDialog}) => (deviceId) => {
        setLedgerDeviceId(deviceId)
        closeLedgerDialog()
      },
      onConfirm: ignoreConcurrentAsyncHandler(
        ({
          navigation,
          isHW,
          hwDeviceInfo,
          isEasyConfirmationEnabled,
          password,
          submitTransaction,
          submitSignedTx,
          withPleaseWaitModal,
          withDisabledButton,
          intl,
          useUSB,
          setErrorData,
        }) => async (event) => {
          await handleOnConfirm(
            navigation,
            isHW,
            hwDeviceInfo,
            isEasyConfirmationEnabled,
            password,
            submitTransaction,
            submitSignedTx,
            withPleaseWaitModal,
            withDisabledButton,
            intl,
            useUSB,
            setErrorData,
          )
        },
        1000,
      ),
    }),
  )(ConfirmScreen),
)
