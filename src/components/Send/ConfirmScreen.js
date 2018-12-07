// @flow

import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {ScrollView, View} from 'react-native'
import {withHandlers, withStateHandlers} from 'recompose'
import {SafeAreaView} from 'react-navigation'

import {
  Text,
  Button,
  OfflineBanner,
  ValidatedTextInput,
  StatusBar,
  Banner,
} from '../UiKit'
import {utxoBalanceSelector, easyConfirmationSelector} from '../../selectors'
import walletManager from '../../crypto/wallet'
import {SEND_ROUTES} from '../../RoutesList'
import {CONFIG} from '../../config'
import KeyStore from '../../crypto/KeyStore'
import {
  showErrorDialog,
  handleGeneralError,
  DIALOG_BUTTONS,
} from '../../actions'
import assert from '../../utils/assert'
import {withNavigationTitle} from '../../utils/renderUtils'
import {formatAdaWithSymbol} from '../../utils/format'

import styles from './styles/ConfirmScreen.style'

import {WrongPassword} from '../../crypto/errors'
import {ignoreConcurrentAsyncHandler} from '../../utils/utils'

const getTranslations = (state) => state.trans.ConfirmSendAdaScreen

const onFail = (navigation) => (reason) => {
  if (reason === KeyStore.REJECTIONS.CANCELED) {
    navigation.navigate(SEND_ROUTES.CONFIRM)
  } else {
    throw new Error(`Failed confirming transaction because: ${reason}`)
  }
}

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
      onFail: onFail(navigation),
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

  const isConfirmationDisabled = !isEasyConfirmationEnabled && !password

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <View style={styles.root}>
        <StatusBar type="dark" />

        <OfflineBanner />
        <Banner
          text={formatAdaWithSymbol(availableAmount)}
          label={translations.availableFunds}
        />

        <ScrollView style={styles.container}>
          <Text small>
            {translations.fees}: {formatAdaWithSymbol(transactionData.fee)}
          </Text>
          <Text small>
            {translations.balanceAfterTx}: {formatAdaWithSymbol(balanceAfterTx)}
          </Text>

          <Text style={styles.heading} small>
            {translations.receiver}
          </Text>
          <Text>{address}</Text>
          <Text style={styles.heading} small>
            {translations.amount}
          </Text>
          <Text>{formatAdaWithSymbol(amount)}</Text>

          {!isEasyConfirmationEnabled && (
            <View style={styles.input}>
              <ValidatedTextInput
                secureTextEntry
                value={password}
                label={translations.password}
                onChangeText={setPassword}
              />
            </View>
          )}
        </ScrollView>
        <View style={styles.actions}>
          <Button
            onPress={onConfirm}
            title={translations.confirmButton}
            disabled={isConfirmationDisabled}
          />
        </View>
      </View>
    </SafeAreaView>
  )
}

export default compose(
  connect((state) => ({
    translations: getTranslations(state),
    availableAmount: utxoBalanceSelector(state),
    isEasyConfirmationEnabled: easyConfirmationSelector(state),
  })),
  withStateHandlers(
    {
      password: CONFIG.DEBUG.PREFILL_FORMS ? CONFIG.DEBUG.PASSWORD : '',
    },
    {
      setPassword: (state) => (value) => ({password: value}),
    },
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
