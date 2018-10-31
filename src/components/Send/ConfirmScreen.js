// @flow

import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {View} from 'react-native'
import {withHandlers} from 'recompose'

import {Text, Button} from '../UiKit'
// import {authenticate} from '../../helpers/bioAuthHelper'
import WalletManager from '../../crypto/wallet'
import {MAIN_ROUTES} from '../../RoutesList'
import {printAda} from '../../utils/transactions'

import styles from './styles/ConfirmScreen.style'

import type {SubTranslation} from '../../l10n/typeHelpers'
import type {NavigationScreenProp, NavigationState} from 'react-navigation'

const handleOnConfirm = async (navigation) => {
  const transactionData = navigation.getParam('transactionData')
  // TODO: add error handling
  await WalletManager.submitTransaction(transactionData, '')
  navigation.navigate(MAIN_ROUTES.TX_HISTORY)
}

const getTranslations = (state) => state.trans.ConfirmScreen

type Props = {
  onConfirm: () => mixed,
  translations: SubTranslation<typeof getTranslations>,
  navigation: NavigationScreenProp<NavigationState>,
}

const ConfirmScreen = ({onConfirm, translations, navigation}: Props) => {
  const amount = navigation.getParam('amount')
  const address = navigation.getParam('address')
  const transactionData = navigation.getParam('transactionData')

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>l10n Confirm your transaction</Text>

      <Text style={styles.welcome}>l10n Address: {address}</Text>
      <Text style={styles.welcome}>l10n Amount: {printAda(amount)}</Text>
      <Text style={styles.welcome}>
        l10n Fee: {printAda(transactionData.fee)}
      </Text>

      <Button onPress={onConfirm} title={translations.confirm} />
    </View>
  )
}

export default compose(
  connect((state) => ({
    translations: getTranslations(state),
  })),
  withHandlers({
    // TODO(ppershing): this should validate only on confirm
    onConfirm: ({navigation}) => (event) => handleOnConfirm(navigation),
    // authenticate().then((success) => (success? navigation.popToTop() : null))
  }),
)(ConfirmScreen)
