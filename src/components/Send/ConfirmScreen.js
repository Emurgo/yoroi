// @flow

import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {ScrollView, View} from 'react-native'
import {withHandlers, withStateHandlers} from 'recompose'
import {SafeAreaView} from 'react-navigation'
import {injectIntl, defineMessages} from 'react-intl'

import {
  Text,
  Button,
  BulletPointItem,
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
  ledgerMessages,
} from '../../i18n/global-messages'
import walletManager, {SystemAuthDisabled} from '../../crypto/wallet'
import {
  createLedgerSignTxPayload,
  signTxWithLedger,
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
  beforeConfirm: {
    id: 'components.send.confirmscreen.beforeConfirm',
    defaultMessage:
      '!!!Before tapping on confirm, please follow these instructions:',
  },
})

const RenderHWInstructions = ({intl}) => {
  const rows = [
    intl.formatMessage(ledgerMessages.enterPin),
    intl.formatMessage(ledgerMessages.openApp),
  ]
  return (
    <View style={styles.instructionsBlock}>
      <Text styles={styles.paragraphText}>
        {intl.formatMessage(messages.beforeConfirm)}
      </Text>
      {rows.map((row, i) => (
        <BulletPointItem textRow={row} key={i} style={styles.item} />
      ))}
    </View>
  )
}

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
        )

        await submitTx(
          Buffer.from(tx.cbor_encoded_tx, 'hex').toString('base64'),
        )
      } catch (e) {
        // TODO(v-almonacid): there are a couple of common exceptions that
        // should be handled before throwing a general error
        handleGeneralError('Could not submit transaction', e, intl)
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
          {isHW && <RenderHWInstructions intl={intl} />}
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
      },
      {
        setPassword: (state) => (value) => ({password: value}),
        setSendingTransaction: () => (sendingTransaction) => ({
          sendingTransaction,
        }),
        setButtonDisabled: () => (buttonDisabled) => ({buttonDisabled}),
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
          )
        },
        1000,
      ),
    }),
  )(ConfirmScreen),
)
