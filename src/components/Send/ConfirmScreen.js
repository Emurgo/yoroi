// @flow

import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {ScrollView, TextInput, View} from 'react-native'
import {withHandlers, withState} from 'recompose'
import {BigNumber} from 'bignumber.js'

import Amount from './Amount'
import {Text, Button} from '../UiKit'
import {utxoBalanceSelector} from '../../selectors'
// import {authenticate} from '../../helpers/bioAuthHelper'
import walletManager from '../../crypto/wallet'
import {WALLET_ROUTES} from '../../RoutesList'
import {formatAda} from '../../utils/format'

import styles from './styles/ConfirmScreen.style'

import type {SubTranslation} from '../../l10n/typeHelpers'
import type {NavigationScreenProp, NavigationState} from 'react-navigation'

const handleOnConfirm = async (navigation) => {
  const transactionData = navigation.getParam('transactionData')
  // TODO: add error handling
  await walletManager.submitTransaction(transactionData, 'password')
  navigation.navigate(WALLET_ROUTES.TX_HISTORY)
}

const getTranslations = (state) => state.trans.ConfirmScreen

type Props = {
  onConfirm: () => mixed,
  availableAmount: ?BigNumber,
  translations: SubTranslation<typeof getTranslations>,
  navigation: NavigationScreenProp<NavigationState>,
  password: string,
  setPassword: (string) => mixed,
}

const ConfirmScreen = ({
  onConfirm,
  availableAmount,
  translations,
  navigation,
  password,
  setPassword,
}: Props) => {
  const amount = navigation.getParam('amount')
  const address = navigation.getParam('address')
  const transactionData = navigation.getParam('transactionData')
  const balanceAfterTx = navigation.getParam('balanceAfterTx')

  return (
    <ScrollView style={styles.container}>
      <View style={styles.balance}>
        <Text style={styles.balanceLabel}>
          {translations.availableFunds.toUpperCase()}:
        </Text>
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

      <View style={styles.item}>
        <Text style={styles.label}>{translations.password}</Text>
        <TextInput
          secureTextEntry
          value={password}
          style={styles.password}
          onChangeText={setPassword}
        />
      </View>

      <View style={styles.item}>
        <Button onPress={onConfirm} title={translations.confirm} />
      </View>
    </ScrollView>
  )
}

export default compose(
  connect((state) => ({
    translations: getTranslations(state),
    availableAmount: utxoBalanceSelector(state),
  })),
  withState('password', 'setPassword', ''),
  withHandlers({
    // TODO(ppershing): this should validate only on confirm
    onConfirm: ({navigation}) => (event) => handleOnConfirm(navigation),
    // authenticate().then((success) => (success? navigation.popToTop() : null))
  }),
)(ConfirmScreen)
