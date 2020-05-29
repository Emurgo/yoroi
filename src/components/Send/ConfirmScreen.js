// @flow

import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {ScrollView, View, Platform} from 'react-native'
import {withHandlers, withStateHandlers} from 'recompose'
import {SafeAreaView} from 'react-navigation'
import {injectIntl, defineMessages} from 'react-intl'
import {ErrorCodes} from '@cardano-foundation/ledgerjs-hw-app-cardano'

import {
  Text,
  Button,
  OfflineBanner,
  ValidatedTextInput,
  StatusBar,
  Banner,
  PleaseWaitModal,
} from '../UiKit'
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
import walletManager, {SystemAuthDisabled} from '../../crypto/wallet'
import {
  createLedgerSignTxPayload,
  signTxWithLedger,
  GeneralConnectionError,
  LedgerUserError,
} from '../../crypto/byron/ledgerUtils'
import {SEND_ROUTES, WALLET_ROUTES, WALLET_INIT_ROUTES} from '../../RoutesList'
import {CONFIG} from '../../config'
import KeyStore from '../../crypto/KeyStore'
import {
  showErrorDialog,
  handleGeneralError,
  submitTransaction,
  submitSignedTx,
} from '../../actions'
import {withNavigationTitle} from '../../utils/renderUtils'
import {formatAdaWithSymbol, formatAdaWithText} from '../../utils/format'
import {NetworkError, ApiError} from '../../api/errors'
import {WrongPassword} from '../../crypto/errors'
import {ignoreConcurrentAsyncHandler} from '../../utils/utils'
import LedgerTransportSwitchModal from '../Ledger/LedgerTransportSwitchModal'
import HWInstructions from '../Ledger/HWInstructions'

import styles from './styles/ConfirmScreen.style'

import type {PreparedTransactionData} from '../../types/HistoryTransaction'

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
) => {
  const transactionData = navigation.getParam('transactionData')

  const submitTx = async (
    tx: string | PreparedTransactionData,
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
          await showErrorDialog(errorMessages.networkError, intl)
        } else if (e instanceof ApiError) {
          await showErrorDialog(errorMessages.apiError, intl)
        } else {
          throw e
        }
      }
    })
  }

  if (isHW) {
    withDisabledButton(async () => {
      try {
        // Map inputs to UNIQUE tx hashes (there might be multiple inputs from the same tx)
        const txsHashes = [
          ...new Set(transactionData.inputs.map((x) => x.ptr.id)),
        ]
        const txsBodiesMap = await walletManager.getTxsBodiesForUTXOs({
          txsHashes,
        })
        const addressedChange = {
          address: transactionData.changeAddress,
          addressing: walletManager.getAddressingInfo(
            transactionData.changeAddress,
          ),
        }
        const {
          ledgerSignTxPayload,
          partialTx,
        } = await createLedgerSignTxPayload(
          transactionData,
          txsBodiesMap,
          addressedChange,
        )

        const tx = await signTxWithLedger(
          ledgerSignTxPayload,
          partialTx,
          hwDeviceInfo,
          useUSB,
        )

        await submitTx(
          Buffer.from(tx.cbor_encoded_tx, 'hex').toString('base64'),
        )
      } catch (e) {
        if (e.statusCode === ErrorCodes.ERR_REJECTED_BY_USER) {
          return
        } else if (
          e instanceof GeneralConnectionError ||
          e instanceof LedgerUserError
        ) {
          await showErrorDialog(errorMessages.hwConnectionError, intl)
        } else {
          handleGeneralError('Could not submit transaction', e, intl)
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

          submitTx(transactionData, decryptedKey)
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
        handleGeneralError('Could not submit transaction', e, intl)
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

    submitTx(transactionData, decryptedData)
  } catch (e) {
    if (e instanceof WrongPassword) {
      await showErrorDialog(errorMessages.incorrectPassword, intl)
    } else {
      handleGeneralError('Could not submit transaction', e, intl)
    }
  }
}

const LEDGER_DIALOG_STEPS = {
  CLOSED: 'CLOSED',
  CHOOSE_TRANSPORT: 'CHOOSE_TRANSPORT',
  // PAIR_DEVICE: 'PAIR_DEVICE', // we may consider adding an additional screen
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
  setTransport,
  useUSB,
}) => {
  const amount = navigation.getParam('amount')
  const address = navigation.getParam('address')
  const transactionData = navigation.getParam('transactionData')
  const balanceAfterTx = navigation.getParam('balanceAfterTx')
  const availableAmount = navigation.getParam('availableAmount')

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
            {intl.formatMessage(txLabels.fees)}:{' '}
            {formatAdaWithSymbol(transactionData.fee)}
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
        Platform.OS === 'android' && (
          <LedgerTransportSwitchModal
            visible={ledgerDialogStep === LEDGER_DIALOG_STEPS.CHOOSE_TRANSPORT}
            onRequestClose={closeLedgerDialog}
            onSelectUSB={(event) => setTransport(event, true)}
            onSelectBLE={(event) => setTransport(event, false)}
            showCloseIcon
          />
        )
      /* eslint-enable indent */
      }

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
      },
    ),
    withStateHandlers(
      {
        password: CONFIG.DEBUG.PREFILL_FORMS ? CONFIG.DEBUG.PASSWORD : '',
        sendingTransaction: false,
        buttonDisabled: false,
        useUSB: false,
        ledgerDialogStep: LEDGER_DIALOG_STEPS.CHOOSE_TRANSPORT,
      },
      {
        setPassword: (state) => (value) => ({password: value}),
        setSendingTransaction: () => (sendingTransaction) => ({
          sendingTransaction,
        }),
        setButtonDisabled: () => (buttonDisabled) => ({buttonDisabled}),
        closeLedgerDialog: (state) => () => ({
          ledgerDialogStep: LEDGER_DIALOG_STEPS.CLOSED,
        }),
        setTransport: (state) => (event, useUSB) => ({
          ledgerDialogStep: LEDGER_DIALOG_STEPS.CLOSED,
          useUSB,
        }),
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
          )
        },
        1000,
      ),
    }),
  )(ConfirmScreen),
)
