/* eslint-disable @typescript-eslint/no-explicit-any */
import {useNavigation} from '@react-navigation/native'
import {CommonActions} from '@react-navigation/routers'
import {BigNumber} from 'bignumber.js'
import React from 'react'
import {useIntl} from 'react-intl'
import {Platform, ScrollView, StyleSheet, View, ViewProps} from 'react-native'
import SafeAreaView from 'react-native-safe-area-view'
import {useDispatch, useSelector} from 'react-redux'

import {
  showErrorDialog,
  submitSignedTx as _submitSignedTx,
  submitTransaction as _submitTransaction,
} from '../../../legacy/actions'
import {
  setLedgerDeviceId as _setLedgerDeviceId,
  setLedgerDeviceObj as _setLedgerDeviceObj,
} from '../../../legacy/actions/hwWallet'
import {CONFIG, UI_V2} from '../../../legacy/config/config'
import {WrongPassword} from '../../../legacy/crypto/errors'
import {ISignRequest} from '../../../legacy/crypto/ISignRequest'
import KeyStore from '../../../legacy/crypto/KeyStore'
import type {CreateUnsignedTxResponse} from '../../../legacy/crypto/shelley/transactionUtils'
import walletManager, {SystemAuthDisabled} from '../../../legacy/crypto/walletManager'
import globalMessages, {confirmationMessages, errorMessages, txLabels} from '../../../legacy/i18n/global-messages'
import LocalizableError from '../../../legacy/i18n/LocalizableError'
import {SEND_ROUTES, WALLET_ROOT_ROUTES, WALLET_ROUTES} from '../../../legacy/RoutesList'
import {
  defaultNetworkAssetSelector,
  easyConfirmationSelector,
  hwDeviceInfoSelector,
  isHWSelector,
} from '../../../legacy/selectors'
import {COLORS} from '../../../legacy/styles/config'
import {formatTokenWithSymbol, formatTokenWithText} from '../../../legacy/utils/format'
import {
  Banner,
  Boundary,
  Button,
  Modal,
  OfflineBanner,
  PleaseWaitModal,
  Spacer,
  StatusBar,
  Text,
  ValidatedTextInput,
} from '../../components'
import {ErrorModal} from '../../components'
import {useTokenInfo} from '../../hooks'
import {Instructions as HWInstructions, LedgerTransportSwitchModal} from '../../HW'
import {LedgerConnect} from '../../HW'
import {useParams} from '../../navigation'
import {useSelectedWallet} from '../../SelectedWallet'
import {TokenEntry} from '../../types/cardano'

export type Params = {
  transactionData: CreateUnsignedTxResponse
  defaultAssetAmount: BigNumber
  address: string
  balanceAfterTx: BigNumber
  availableAmount: BigNumber
  fee: BigNumber
  tokens: TokenEntry[]
}

const isParams = (params?: Params | object | undefined): params is Params => {
  return (
    !!params &&
    'transactionData' in params &&
    typeof params.transactionData === 'object' &&
    'defaultAssetAmount' in params &&
    params.defaultAssetAmount instanceof BigNumber &&
    'address' in params &&
    typeof params.address === 'string' &&
    'balanceAfterTx' in params &&
    params.balanceAfterTx instanceof BigNumber &&
    'availableAmount' in params &&
    params.availableAmount instanceof BigNumber &&
    'fee' in params &&
    params.fee instanceof BigNumber &&
    'tokens' in params &&
    Array.isArray(params.tokens)
  )
}

export const ConfirmScreen = () => {
  const intl = useIntl()
  const strings = useStrings()
  const {
    defaultAssetAmount,
    address,
    balanceAfterTx,
    availableAmount,
    fee,
    tokens: tokenEntries,
    transactionData: signRequest,
  } = useParams(isParams)
  const isEasyConfirmationEnabled = useSelector(easyConfirmationSelector)
  const isHW = useSelector(isHWSelector)
  const defaultAsset = useSelector(defaultNetworkAssetSelector)
  const hwDeviceInfo = useSelector(hwDeviceInfoSelector)

  const [password, setPassword] = React.useState(CONFIG.DEBUG.PREFILL_FORMS ? CONFIG.DEBUG.PASSWORD : '')
  const [sendingTransaction, setSendingTransaction] = React.useState(false)
  const [buttonDisabled, setButtonDisabled] = React.useState(false)
  const [useUSB, setUseUSB] = React.useState(false)
  const [ledgerDialogStep, setLedgerDialogStep] = React.useState(LEDGER_DIALOG_STEPS.CHOOSE_TRANSPORT)
  const [showErrorModal, setShowErrorModal] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState('')
  const [errorLogs, setErrorLogs] = React.useState('')

  const openLedgerConnect = () => setLedgerDialogStep(LEDGER_DIALOG_STEPS.LEDGER_CONNECT)
  const closeLedgerDialog = () => setLedgerDialogStep(LEDGER_DIALOG_STEPS.CLOSED)

  const closeErrorModal = () => setShowErrorModal(false)
  const setErrorData = (showErrorModal, errorMessage, errorLogs) => {
    setShowErrorModal(showErrorModal)
    setErrorMessage(errorMessage)
    setErrorLogs(errorLogs)
  }

  const withPleaseWaitModal = async (func: () => Promise<void>) => {
    setSendingTransaction(true)
    try {
      await func()
    } finally {
      setSendingTransaction(false)
    }
  }

  const withDisabledButton = async (func: () => Promise<void>) => {
    setButtonDisabled(true)
    try {
      await func()
    } finally {
      setButtonDisabled(false)
    }
  }

  const dispatch = useDispatch()
  const submitTransaction = (...args) => dispatch(_submitTransaction(...args))
  const submitSignedTx = (...args) => dispatch(_submitSignedTx(...args))
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
  const onConfirm = async () => {
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
            routes: [{name: UI_V2 ? 'history' : SEND_ROUTES.MAIN}],
          } as any),
        )
        if (!UI_V2) {
          navigation.navigate(WALLET_ROUTES.TX_HISTORY)
        }
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
              navigation.navigate(UI_V2 ? 'send-confirm' : SEND_ROUTES.CONFIRM)

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
        setErrorData(true, strings.generalTxError.message, (e as any).message || null)
      }
    }
  }

  const isConfirmationDisabled = !isEasyConfirmationEnabled && !password && !isHW

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <View style={styles.root}>
        <StatusBar type="dark" />

        <OfflineBanner />

        <Banner label={strings.availableFunds} text={formatTokenWithText(availableAmount, defaultAsset)} boldText />

        <ScrollView style={styles.container} contentContainerStyle={{padding: 16}}>
          <Text small>
            {strings.fees}: {formatTokenWithSymbol(fee, defaultAsset)}
          </Text>

          <Text small>
            {strings.balanceAfterTx}: {formatTokenWithSymbol(balanceAfterTx, defaultAsset)}
          </Text>

          <Spacer height={16} />

          <Text>{strings.receiver}</Text>
          <Text>{address}</Text>

          <Spacer height={16} />

          <Text>{strings.total}</Text>
          <Text style={styles.amount}>{formatTokenWithSymbol(defaultAssetAmount, defaultAsset)}</Text>

          {tokenEntries.map((entry) => (
            <Boundary key={entry.identifier}>
              <Entry tokenEntry={entry} />
            </Boundary>
          ))}

          {!isEasyConfirmationEnabled && !isHW && (
            <>
              <Spacer height={16} />
              <ValidatedTextInput
                secureTextEntry
                value={password}
                label={strings.password}
                onChangeText={setPassword}
              />
            </>
          )}

          {isHW && <HWInstructions useUSB={useUSB} addMargin />}
        </ScrollView>

        <Actions>
          <Button
            onPress={onConfirm}
            title={strings.confirmButton}
            disabled={isConfirmationDisabled || buttonDisabled}
          />
        </Actions>
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
    </SafeAreaView>
  )
}

const Entry = ({tokenEntry}: {tokenEntry: TokenEntry}) => {
  const wallet = useSelectedWallet()
  const tokenInfo = useTokenInfo({wallet, tokenId: tokenEntry.identifier})

  return <Text style={styles.amount}>{formatTokenWithText(tokenEntry.amount, tokenInfo)}</Text>
}

const Actions = (props: ViewProps) => <View {...props} style={{padding: 16}} />

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
  },
  amount: {
    color: COLORS.POSITIVE_AMOUNT,
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
    availableFunds: intl.formatMessage(globalMessages.availableFunds),
    fees: intl.formatMessage(txLabels.fees),
    balanceAfterTx: intl.formatMessage(txLabels.balanceAfterTx),
    receiver: intl.formatMessage(txLabels.receiver),
    total: intl.formatMessage(globalMessages.total),
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
