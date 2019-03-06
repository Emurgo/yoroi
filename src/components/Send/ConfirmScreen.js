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
  OfflineBanner,
  ValidatedTextInput,
  StatusBar,
  Banner,
  PleaseWaitModal,
} from '../UiKit'
import {easyConfirmationSelector} from '../../selectors'
import globalMessages from '../../i18n/global-messages'
import walletManager, {SystemAuthDisabled} from '../../crypto/wallet'
import {SEND_ROUTES, WALLET_ROUTES, WALLET_INIT_ROUTES} from '../../RoutesList'
import {CONFIG} from '../../config'
import KeyStore from '../../crypto/KeyStore'
import {
  showErrorDialog,
  handleGeneralError,
  submitTransaction,
} from '../../actions'
import {withNavigationTitle} from '../../utils/renderUtils'
import {formatAdaWithSymbol, formatAdaWithText} from '../../utils/format'
import {NetworkError} from '../../api/errors'

import styles from './styles/ConfirmScreen.style'

import {WrongPassword} from '../../crypto/errors'
import {ignoreConcurrentAsyncHandler} from '../../utils/utils'

const messages = defineMessages({
  title: {
    id: 'components.send.confirmscreen.title',
    defaultMessage: '!!!Send',
    description: 'some desc',
  },
  amount: {
    id: 'components.send.confirmscreen.amount',
    defaultMessage: '!!!Amount',
    description: 'some desc',
  },
  balanceAfterTx: {
    id: 'components.send.confirmscreen.balanceAfterTx',
    defaultMessage: '!!!Balance after transaction',
    description: 'some desc',
  },
  fees: {
    id: 'components.send.confirmscreen.fees',
    defaultMessage: '!!!Fees',
    description: 'some desc',
  },
  password: {
    id: 'components.send.confirmscreen.password',
    defaultMessage: '!!!Wallet password',
    description: 'some desc',
  },
  receiver: {
    id: 'components.send.confirmscreen.receiver',
    defaultMessage: '!!!Receiver',
    description: 'some desc',
  },
  confirmButton: {
    id: 'components.send.confirmscreen.confirmButton',
    defaultMessage: '!!!Confirm',
    description: 'some desc',
  },
  sendingModalTitle: {
    id: 'components.send.confirmscreen.sendingModalTitle',
    defaultMessage: '!!!Submitting transaction',
    description: 'some desc',
  },

})

const handleOnConfirm = async (
  navigation,
  isEasyConfirmationEnabled,
  password,
  submitTransaction,
  setSendingTransaction,
  intl
) => {
  const transactionData = navigation.getParam('transactionData')

  const submitTx = async (decryptedKey) => {
    try {
      setSendingTransaction(true)
      await submitTransaction(decryptedKey, transactionData)

      navigation.navigate(WALLET_ROUTES.TX_HISTORY)
    } catch (e) {
      if (e instanceof NetworkError) {
        await showErrorDialog((dialogs) => dialogs.networkError)
      } else {
        throw e
      }
    } finally {
      setSendingTransaction(false)
    }
  }

  if (isEasyConfirmationEnabled) {
    try {
      await walletManager.ensureKeysValidity()
      navigation.navigate(SEND_ROUTES.BIOMETRICS_SIGNING, {
        keyId: walletManager._id,
        onSuccess: (decryptedKey) => {
          navigation.navigate(SEND_ROUTES.CONFIRM)

          submitTx(decryptedKey)
        },
        onFail: () => navigation.goBack(),
      })
    } catch (e) {
      if (e instanceof SystemAuthDisabled) {
        await walletManager.closeWallet()
        await showErrorDialog((dialogs) => dialogs.enableSystemAuthFirst)
        navigation.navigate(WALLET_INIT_ROUTES.WALLET_SELECTION)

        return
      } else {
        throw e
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

    submitTx(decryptedData)
  } catch (e) {
    if (e instanceof WrongPassword) {
      await showErrorDialog((dialogs) => dialogs.incorrectPassword)
    } else {
      handleGeneralError('Could not submit transaction', e)
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
  sendingTransaction,
}) => {
  const amount = navigation.getParam('amount')
  const address = navigation.getParam('address')
  const transactionData = navigation.getParam('transactionData')
  const balanceAfterTx = navigation.getParam('balanceAfterTx')
  const availableAmount = navigation.getParam('availableAmount')

  const isConfirmationDisabled = !isEasyConfirmationEnabled && !password

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
            {intl.formatMessage(messages.fees)}: {formatAdaWithSymbol(transactionData.fee)}
          </Text>
          <Text small>
            {intl.formatMessage(messages.balanceAfterTx)}: {formatAdaWithSymbol(balanceAfterTx)}
          </Text>

          <Text style={styles.heading} small>
            {intl.formatMessage(messages.receiver)}
          </Text>
          <Text>{address}</Text>
          <Text style={styles.heading} small>
            {intl.formatMessage(messages.amount)}
          </Text>
          <Text>{formatAdaWithSymbol(amount)}</Text>

          {!isEasyConfirmationEnabled && (
            <View style={styles.input}>
              <ValidatedTextInput
                secureTextEntry
                value={password}
                label={intl.formatMessage(messages.password)}
                onChangeText={setPassword}
              />
            </View>
          )}
        </ScrollView>
        <View style={styles.actions}>
          <Button
            onPress={onConfirm}
            title={intl.formatMessage(messages.confirmButton)}
            disabled={isConfirmationDisabled}
          />
        </View>
      </View>

      <PleaseWaitModal
        title={intl.formatMessage(messages.sendingModalTitle)}
        spinnerText={intl.formatMessage(globalMessages.pleaseWait)}
        visible={sendingTransaction}
      />
    </SafeAreaView>
  )
}

export default injectIntl(compose(
  connect(
    (state) => ({
      isEasyConfirmationEnabled: easyConfirmationSelector(state),
    }),
    {
      submitTransaction,
    },
  ),
  withStateHandlers(
    {
      password: CONFIG.DEBUG.PREFILL_FORMS ? CONFIG.DEBUG.PASSWORD : '',
      sendingTransaction: false,
    },
    {
      setPassword: (state) => (value) => ({password: value}),
      setSendingTransaction: () => (sendingTransaction) => ({
        sendingTransaction,
      }),
    },
  ),
  withNavigationTitle(({intl}) => intl.formatMessage(messages.title)),
  withHandlers({
    onConfirm: ignoreConcurrentAsyncHandler(
      ({
        navigation,
        isEasyConfirmationEnabled,
        password,
        submitTransaction,
        setSendingTransaction,
        intl,
      }) => async (event) => {
        await handleOnConfirm(
          navigation,
          isEasyConfirmationEnabled,
          password,
          submitTransaction,
          setSendingTransaction,
          intl,
        )
      },
      1000,
    ),
  }),
)(ConfirmScreen))
