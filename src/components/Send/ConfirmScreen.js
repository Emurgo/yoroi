// @flow

import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {ScrollView, Alert, TextInput, View, Platform} from 'react-native'
import {withHandlers, withState} from 'recompose'

import Amount from './Amount'
import {Text, Button, OfflineBanner} from '../UiKit'
import {utxoBalanceSelector, easyConfirmationSelector} from '../../selectors'
import walletManager from '../../crypto/wallet'
import {SEND_ROUTES} from '../../RoutesList'
import {formatAda} from '../../utils/format'
import {CONFIG} from '../../config'

import styles from './styles/ConfirmScreen.style'

import {WrongPassword} from '../../crypto/errors'

import l10n from '../../l10n'

const getTranslations = (state) => state.trans.ConfirmScreen.Confirmation

const handleOnConfirm = async (
  navigation,
  isEasyConfirmationEnabled,
  password,
) => {
  const translations = l10n.translations.ConfirmScreen.ErrorDialogs
  const transactionData = navigation.getParam('transactionData')

  if (isEasyConfirmationEnabled && Platform.OS === 'android') {
    navigation.navigate(SEND_ROUTES.ANDROID_FINGERPRINT_SIGNING, {
      transactionData,
    })
    return
  }

  try {
    const signedTx = await walletManager.signTx(
      transactionData,
      'MASTER_PASSWORD',
      password,
    )

    navigation.navigate(SEND_ROUTES.SENDING_MODAL, {signedTx})
  } catch (e) {
    if (e instanceof WrongPassword) {
      Alert.alert(
        translations.WrongPassword.title,
        translations.WrongPassword.text,
        [
          {
            text: translations.okTextButton,
            onPress: () => navigation.navigate(SEND_ROUTES.CONFIRM),
          },
        ],
      )
    } else {
      throw e
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
            <Text style={styles.label}>{translations.password}</Text>
            <TextInput
              secureTextEntry
              value={password}
              style={styles.password}
              onChangeText={setPassword}
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
  withHandlers({
    // TODO(ppershing): this should validate only on confirm
    onConfirm: ({navigation, isEasyConfirmationEnabled, password}) => (event) =>
      handleOnConfirm(navigation, isEasyConfirmationEnabled, password),
    // authenticate().then((success) => (success? navigation.popToTop() : null))
  }),
)(ConfirmScreen)
