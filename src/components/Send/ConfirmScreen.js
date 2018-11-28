// @flow

import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {ScrollView, View} from 'react-native'
import {withHandlers, withState} from 'recompose'

import Amount from './Amount'
import {Text, Button, OfflineBanner, ValidatedTextInput} from '../UiKit'
import {utxoBalanceSelector, easyConfirmationSelector} from '../../selectors'
import walletManager from '../../crypto/wallet'
import {SEND_ROUTES} from '../../RoutesList'
import {formatAda} from '../../utils/format'
import {CONFIG} from '../../config'
import KeyStore from '../../crypto/KeyStore'
import {
  showErrorDialog,
  handleGeneralError,
  DIALOG_BUTTONS,
} from '../../actions'
import assert from '../../utils/assert'
import {withNavigationTitle} from '../../utils/renderUtils'

import styles from './styles/ConfirmScreen.style'

import {WrongPassword} from '../../crypto/errors'
import {ignoreConcurrentAsyncHandler} from '../../utils/utils'

const getTranslations = (state) => state.trans.ConfirmSendAdaScreen

const handleOnConfirm = async (
  navigation,
  isEasyConfirmationEnabled,
  password,
) => {
  const transactionData = navigation.getParam('transactionData')

  const submitTx = (decryptedKey) =>
    navigation.navigate(SEND_ROUTES.SENDING_MODAL, {
      decryptedKey,
      transactionData,
    })

  if (isEasyConfirmationEnabled) {
    navigation.navigate(SEND_ROUTES.BIOMETRICS_SIGNING, {
      keyId: walletManager._id,
      onSuccess: submitTx,
    })
    return
  }

  try {
    const decryptedData = await KeyStore.getData(
      walletManager._id,
      'MASTER_PASSWORD',
      '',
      password,
    )

    submitTx(decryptedData)
  } catch (e) {
    if (e instanceof WrongPassword) {
      const result = await showErrorDialog(
        (dialogs) => dialogs.incorrectPassword,
      )
      assert.assert(
        result === DIALOG_BUTTONS.YES,
        'User should have tapped yes',
      )

      navigation.navigate(SEND_ROUTES.CONFIRM)
    } else {
      handleGeneralError('Could not submit transaction', e)
    }
  }
}

const ConfirmScreen = ({
  onConfirm,
  availableAmount,
  translations,
  navigation,
  password,
  setPassword,
  isEasyConfirmationEnabled,
}) => {
  const amount = navigation.getParam('amount')
  const address = navigation.getParam('address')
  const transactionData = navigation.getParam('transactionData')
  const balanceAfterTx = navigation.getParam('balanceAfterTx')

  return (
    <View style={styles.root}>
      <OfflineBanner />
      <ScrollView style={styles.container}>
        <View style={styles.balance}>
          <Text style={styles.balanceLabel}>{translations.availableFunds}</Text>
          <Amount
            value={formatAda(availableAmount)}
            style={styles.balanceValue}
          />
        </View>

        <View style={styles.transactionSummary}>
          <View style={styles.fees}>
            <Text style={styles.label}>{translations.fees}</Text>
            <Amount value={formatAda(transactionData.fee)} />
          </View>
          <View style={styles.remainingBalance}>
            <Text style={styles.label}>{translations.balanceAfterTx}</Text>
            <Amount value={formatAda(balanceAfterTx)} />
          </View>
        </View>

        <View style={styles.item}>
          <Text style={styles.label}>{translations.receiver}</Text>
          <Text style={styles.receiver}>{address}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>{translations.amount}</Text>
          <Amount value={formatAda(amount)} />
        </View>

        {!isEasyConfirmationEnabled ? (
          <View style={styles.item}>
            <ValidatedTextInput
              secureTextEntry
              value={password}
              label={translations.password}
              onChange={setPassword}
            />
          </View>
        ) : null}

        <View style={styles.item}>
          <Button onPress={onConfirm} title={translations.confirmButton} />
        </View>
      </ScrollView>
    </View>
  )
}

export default compose(
  connect((state) => ({
    translations: getTranslations(state),
    availableAmount: utxoBalanceSelector(state),
    isEasyConfirmationEnabled: easyConfirmationSelector(state),
  })),
  withState(
    'password',
    'setPassword',
    CONFIG.DEBUG.PREFILL_FORMS ? CONFIG.DEBUG.PASSWORD : '',
  ),
  withNavigationTitle(({translations}) => translations.title),
  withHandlers({
    onConfirm: ignoreConcurrentAsyncHandler(
      ({
        navigation,
        isEasyConfirmationEnabled,
        password,
        canBiometricPromptBeUsed,
      }) => async (event) => {
        await handleOnConfirm(navigation, isEasyConfirmationEnabled, password)
      },
      1000,
    ),
  }),
)(ConfirmScreen)
