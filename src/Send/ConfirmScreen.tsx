/* eslint-disable @typescript-eslint/no-explicit-any */
import {CommonActions} from '@react-navigation/routers'
import {BigNumber} from 'bignumber.js'
import React from 'react'
import type {IntlShape} from 'react-intl'
import {injectIntl} from 'react-intl'
import {Platform, ScrollView, StyleSheet, View} from 'react-native'
import SafeAreaView from 'react-native-safe-area-view'
import {connect} from 'react-redux'
import {withHandlers, withStateHandlers} from 'recompose'
import {compose} from 'redux'

import {showErrorDialog, submitSignedTx, submitTransaction} from '../../legacy/actions'
import {setLedgerDeviceId, setLedgerDeviceObj} from '../../legacy/actions/hwWallet'
import ErrorModal from '../../legacy/components/Common/ErrorModal'
import HWInstructions from '../../legacy/components/Ledger/HWInstructions'
import LedgerConnect from '../../legacy/components/Ledger/LedgerConnect'
import LedgerTransportSwitchModal from '../../legacy/components/Ledger/LedgerTransportSwitchModal'
import {
  Banner,
  Button,
  Modal,
  OfflineBanner,
  PleaseWaitModal,
  StatusBar,
  Text,
  ValidatedTextInput,
} from '../../legacy/components/UiKit'
import {CONFIG} from '../../legacy/config/config'
import {WrongPassword} from '../../legacy/crypto/errors'
import {ISignRequest} from '../../legacy/crypto/ISignRequest'
import KeyStore from '../../legacy/crypto/KeyStore'
import type {TokenEntry} from '../../legacy/crypto/MultiToken'
import type {CreateUnsignedTxResponse} from '../../legacy/crypto/shelley/transactionUtils'
import walletManager, {SystemAuthDisabled} from '../../legacy/crypto/walletManager'
import globalMessages, {confirmationMessages, errorMessages, txLabels} from '../../legacy/i18n/global-messages'
import LocalizableError from '../../legacy/i18n/LocalizableError'
import {SEND_ROUTES, WALLET_ROOT_ROUTES, WALLET_ROUTES} from '../../legacy/RoutesList'
import {
  defaultNetworkAssetSelector,
  easyConfirmationSelector,
  hwDeviceInfoSelector,
  isHWSelector,
  tokenInfoSelector,
} from '../../legacy/selectors'
import {State} from '../../legacy/state'
import {COLORS} from '../../legacy/styles/config'
import {formatTokenWithSymbol, formatTokenWithText} from '../../legacy/utils/format'
import {ignoreConcurrentAsyncHandler} from '../../legacy/utils/utils'

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

  const submitTx = async (tx: string | ISignRequest, decryptedKey?: string) => {
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
        } as any),
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
      const localizableError: any = e
      setErrorData(
        true,
        intl.formatMessage(
          {id: localizableError.id, defaultMessage: localizableError.defaultMessage},
          localizableError.values,
        ),
        localizableError.values.response || null, // API errors should include a response
      )
    } else {
      setErrorData(true, intl.formatMessage(errorMessages.generalTxError.message), (e as any).message || null)
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
  }: {intl: IntlShape} & Record<string, unknown> /* TODO: type */,
) => {
  const {
    defaultAssetAmount,
    address,
    balanceAfterTx,
    availableAmount,
    fee,
    tokens,
  }: {
    defaultAssetAmount: BigNumber
    address: string
    balanceAfterTx: BigNumber
    availableAmount: BigNumber
    fee: BigNumber
    tokens: Array<TokenEntry>
  } = (route as any).params

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
              {formatTokenWithText(t.amount, (tokenMetadata as any)[t.identifier])}
            </Text>
          ))}

          {!isEasyConfirmationEnabled && !isHW && (
            <View style={styles.input}>
              <ValidatedTextInput
                secureTextEntry
                value={password}
                label={intl.formatMessage(txLabels.password)}
                onChangeText={setPassword}
              />
            </View>
          )}
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

      {isHW && Platform.OS === 'android' && CONFIG.HARDWARE_WALLETS.LEDGER_NANO.ENABLE_USB_TRANSPORT && (
        <>
          <LedgerTransportSwitchModal
            visible={ledgerDialogStep === LEDGER_DIALOG_STEPS.CHOOSE_TRANSPORT}
            onRequestClose={closeLedgerDialog}
            onSelectUSB={(event) => (onChooseTransport as any)(event, true)}
            onSelectBLE={(event) => (onChooseTransport as any)(event, false)}
            showCloseIcon
          />
          <Modal visible={ledgerDialogStep === LEDGER_DIALOG_STEPS.LEDGER_CONNECT} onRequestClose={closeLedgerDialog}>
            <LedgerConnect onConnectBLE={onConnectBLE} onConnectUSB={onConnectUSB} useUSB={useUSB} />
          </Modal>
        </>
      )}
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
  (
    compose(
      connect(
        (state: State) => ({
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
              }: {intl: IntlShape} & Record<string, unknown> /* TODO: type */,
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
    ) as any
  )(ConfirmScreen),
)

const styles = StyleSheet.create({
  safeAreaView: {
    backgroundColor: COLORS.WHITE,
    flex: 1,
  },
  root: {
    flex: 1,
  },
  container: {
    backgroundColor: COLORS.WHITE,
    flex: 1,
    padding: 16,
  },
  heading: {
    marginTop: 16,
  },
  actions: {
    padding: 16,
  },
  input: {
    marginTop: 16,
  },
  amount: {
    color: COLORS.POSITIVE_AMOUNT,
  },
})
