// @flow

import React from 'react'
import {BigNumber} from 'bignumber.js'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {ScrollView, View, Platform} from 'react-native'
import {withHandlers, withStateHandlers} from 'recompose'
import SafeAreaView from 'react-native-safe-area-view'
import {injectIntl, type IntlShape} from 'react-intl'
import {CommonActions} from '@react-navigation/routers'

import {Text, Button, OfflineBanner, ValidatedTextInput, StatusBar, Banner, PleaseWaitModal, Modal} from '../UiKit'
import ErrorModal from '../Common/ErrorModal'
import {
  easyConfirmationSelector,
  isHWSelector,
  hwDeviceInfoSelector,
  defaultNetworkAssetSelector,
  tokenInfoSelector,
} from '../../selectors'
import globalMessages, {errorMessages, txLabels, confirmationMessages} from '../../i18n/global-messages'
import walletManager, {SystemAuthDisabled} from '../../crypto/walletManager'
import {SEND_ROUTES, WALLET_ROUTES, WALLET_ROOT_ROUTES} from '../../RoutesList'
import {CONFIG} from '../../config/config'
import KeyStore from '../../crypto/KeyStore'
import {showErrorDialog, submitTransaction, submitSignedTx} from '../../actions'
import {setLedgerDeviceId, setLedgerDeviceObj} from '../../actions/hwWallet'
import {formatTokenWithSymbol, formatTokenWithText} from '../../utils/format'
import {WrongPassword} from '../../crypto/errors'
import {ignoreConcurrentAsyncHandler} from '../../utils/utils'
import LedgerTransportSwitchModal from '../Ledger/LedgerTransportSwitchModal'
import LedgerConnect from '../Ledger/LedgerConnect'
import HWInstructions from '../Ledger/HWInstructions'
import LocalizableError from '../../i18n/LocalizableError'
import {ISignRequest} from '../../crypto/ISignRequest'

import type {CreateUnsignedTxResponse} from '../../crypto/shelley/transactionUtils'
import type {TokenEntry} from '../../crypto/MultiToken'

import styles from './styles/ConfirmScreen.style'

const handleOnConfirm = async (
  navigation,
  route,
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
  const signRequest: CreateUnsignedTxResponse = route.params.transactionData

  const submitTx = async <T>(tx: string | ISignRequest<T>, decryptedKey: ?string) => {
    await withPleaseWaitModal(async () => {
      if (decryptedKey != null) {
        await submitTransaction(tx, decryptedKey)
      } else {
        await submitSignedTx(tx)
      }
      navigation.dispatch(
        CommonActions.reset({
          key: null,
          index: 0,
          routes: [{name: SEND_ROUTES.MAIN}],
        }),
      )
      navigation.navigate(WALLET_ROUTES.TX_HISTORY)
    })
  }

  try {
    if (isHW) {
      await withDisabledButton(async () => {
        const signedTx = await walletManager.signTxWithLedger(signRequest, useUSB)
        await submitTx(Buffer.from(signedTx.encodedTx).toString('base64'))
      })
      return
    }

    if (isEasyConfirmationEnabled) {
      try {
        await walletManager.ensureKeysValidity()
        navigation.navigate(SEND_ROUTES.BIOMETRICS_SIGNING, {
          keyId: walletManager._id,
          onSuccess: async (decryptedKey) => {
            navigation.navigate(SEND_ROUTES.CONFIRM)

            await submitTx(signRequest, decryptedKey)
          },
          onFail: () => navigation.goBack(),
        })
      } catch (e) {
        if (e instanceof SystemAuthDisabled) {
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
      const decryptedData = await KeyStore.getData(walletManager._id, 'MASTER_PASSWORD', '', password, intl)

      await submitTx(signRequest, decryptedData)
    } catch (e) {
      if (e instanceof WrongPassword) {
        await showErrorDialog(errorMessages.incorrectPassword, intl)
      } else {
        throw e
      }
    }
  } catch (e) {
    if (e instanceof LocalizableError) {
      setErrorData(
        true,
        intl.formatMessage({id: e.id, defaultMessage: e.defaultMessage}, e.values),
        e.values.response || null, // API errors should include a response
      )
    } else {
      setErrorData(true, intl.formatMessage(errorMessages.generalTxError.message), e.message || null)
    }
  }
}

const LEDGER_DIALOG_STEPS = {
  CLOSED: 'CLOSED',
  CHOOSE_TRANSPORT: 'CHOOSE_TRANSPORT',
  LEDGER_CONNECT: 'LEDGER_CONNECT',
}

const ConfirmScreen = (
  {
    onConfirm,
    intl,
    route,
    password,
    setPassword,
    isEasyConfirmationEnabled,
    isHW,
    defaultAsset,
    tokenMetadata,
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
    errorMessage,
    errorLogs,
  }: {intl: IntlShape} & Object /* TODO: type */,
) => {
  const {
    defaultAssetAmount,
    address,
    balanceAfterTx,
    availableAmount,
    fee,
    tokens,
  }: {|
    defaultAssetAmount: BigNumber,
    address: string,
    balanceAfterTx: BigNumber,
    availableAmount: BigNumber,
    fee: BigNumber,
    tokens: Array<TokenEntry>,
  |} = route.params

  const isConfirmationDisabled = !isEasyConfirmationEnabled && !password && !isHW

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <View style={styles.root}>
        <StatusBar type="dark" />

        <OfflineBanner />
        <Banner
          label={intl.formatMessage(globalMessages.availableFunds)}
          text={formatTokenWithText(availableAmount, defaultAsset)}
          boldText
        />

        <ScrollView style={styles.container}>
          <Text small>
            {intl.formatMessage(txLabels.fees)}: {formatTokenWithSymbol(fee, defaultAsset)}
          </Text>
          <Text small>
            {intl.formatMessage(txLabels.balanceAfterTx)}: {formatTokenWithSymbol(balanceAfterTx, defaultAsset)}
          </Text>

          <Text style={styles.heading}>{intl.formatMessage(txLabels.receiver)}</Text>
          <Text>{address}</Text>
          <Text style={styles.heading}>{intl.formatMessage(globalMessages.total)}</Text>
          <Text style={styles.amount}>{formatTokenWithSymbol(defaultAssetAmount, defaultAsset)}</Text>
          {tokens.map((t, i) => (
            <Text style={styles.amount} key={i}>
              {formatTokenWithText(t.amount, tokenMetadata[t.identifier])}
            </Text>
          ))}

          {
            /* eslint-disable indent */
            !isEasyConfirmationEnabled && !isHW && (
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
            title={intl.formatMessage(confirmationMessages.commonButtons.confirmButton)}
            disabled={isConfirmationDisabled || buttonDisabled}
          />
        </View>
      </View>

      {
        /* eslint-disable indent */
        isHW && Platform.OS === 'android' && CONFIG.HARDWARE_WALLETS.LEDGER_NANO.ENABLE_USB_TRANSPORT && (
          <>
            <LedgerTransportSwitchModal
              visible={ledgerDialogStep === LEDGER_DIALOG_STEPS.CHOOSE_TRANSPORT}
              onRequestClose={closeLedgerDialog}
              onSelectUSB={(event) => onChooseTransport(event, true)}
              onSelectBLE={(event) => onChooseTransport(event, false)}
              showCloseIcon
            />
            <Modal visible={ledgerDialogStep === LEDGER_DIALOG_STEPS.LEDGER_CONNECT} onRequestClose={closeLedgerDialog}>
              <LedgerConnect onConnectBLE={onConnectBLE} onConnectUSB={onConnectUSB} useUSB={useUSB} />
            </Modal>
          </>
        )
        /* eslint-enable indent */
      }
      <ErrorModal
        visible={showErrorModal}
        title={intl.formatMessage(errorMessages.generalTxError.title)}
        errorMessage={errorMessage}
        errorLogs={errorLogs}
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
        defaultAsset: defaultNetworkAssetSelector(state),
        tokenMetadata: tokenInfoSelector(state),
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
        errorMessage: '',
        errorLogs: '',
      },
      {
        setPassword: () => (value) => ({password: value}),
        setSendingTransaction: () => (sendingTransaction) => ({
          sendingTransaction,
        }),
        setButtonDisabled: () => (buttonDisabled) => ({buttonDisabled}),
        openLedgerConnect: () => () => ({
          ledgerDialogStep: LEDGER_DIALOG_STEPS.LEDGER_CONNECT,
        }),
        closeLedgerDialog: () => () => ({
          ledgerDialogStep: LEDGER_DIALOG_STEPS.CLOSED,
        }),
        setUseUSB: () => (useUSB) => ({useUSB}),
        closeErrorModal: () => () => ({showErrorModal: false}),
        setErrorData: () => (showErrorModal, errorMessage, errorLogs) => ({
          showErrorModal,
          errorMessage,
          errorLogs,
        }),
      },
    ),
    withHandlers({
      withPleaseWaitModal:
        ({setSendingTransaction}) =>
        async (func: () => Promise<void>): Promise<void> => {
          setSendingTransaction(true)
          try {
            await func()
          } finally {
            setSendingTransaction(false)
          }
        },
      withDisabledButton:
        ({setButtonDisabled}) =>
        async (func: () => Promise<void>): Promise<void> => {
          setButtonDisabled(true)
          try {
            await func()
          } finally {
            setButtonDisabled(false)
          }
        },
    }),
    withHandlers({
      onChooseTransport:
        ({hwDeviceInfo, setUseUSB, openLedgerConnect, closeLedgerDialog}) =>
        (event, useUSB) => {
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
      onConnectUSB:
        ({setLedgerDeviceObj, closeLedgerDialog}) =>
        async (deviceObj) => {
          await setLedgerDeviceObj(deviceObj)
          closeLedgerDialog()
        },
      onConnectBLE:
        ({setLedgerDeviceId, closeLedgerDialog}) =>
        async (deviceId) => {
          await setLedgerDeviceId(deviceId)
          closeLedgerDialog()
        },
      onConfirm: ignoreConcurrentAsyncHandler(
        (
            {
              navigation,
              route,
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
            }: {intl: IntlShape} & Object /* TODO: type */,
          ) =>
          async (_event) => {
            await handleOnConfirm(
              navigation,
              route,
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
