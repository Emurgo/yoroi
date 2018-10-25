// @flow

import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {View} from 'react-native'
import _ from 'lodash'

import {printAda} from '../../utils/transactions'
import {Text} from '../UiKit'
import Screen from '../../components/Screen'
import AdaIcon from '../../assets/AdaIcon'

import styles from './styles/TxDetails.style'
import {COLORS} from '../../styles/config'

import type {SubTranslation} from '../../l10n/typeHelpers'
import type {NavigationScreenProp, NavigationState} from 'react-navigation'

const Label = ({children}) => <Text style={styles.label}>{children}</Text>

const AdaAmount = ({amount, type}) => {
  const isNegativeAmount = type === 'SENT'
  return (
    <View style={styles.amountContainer}>
      <Text
        style={isNegativeAmount ? styles.negativeAmount : styles.positiveAmount}
      >
        {isNegativeAmount ? '-' : ''}
        {printAda(amount)}
      </Text>
      <View style={styles.adaSignContainer}>
        <AdaIcon
          width={18}
          height={18}
          color={
            isNegativeAmount ? COLORS.NEGATIVE_AMOUNT : COLORS.POSITIVE_AMOUNT
          }
        />
      </View>
    </View>
  )
}

const getTranslations = (state) =>
  state.trans.txHistoryScreen.transactionDetails

type Props = {
  navigation: NavigationScreenProp<NavigationState>,
  translations: SubTranslation<typeof getTranslations>,
}

const TxDetails = ({navigation, translations}: Props) => {
  const transaction = navigation.getParam('transaction', {})

  return (
    <Screen scroll>
      <AdaAmount amount={transaction.amount} type={transaction.type} />

      <View style={styles.timestampContainer}>
        <View>
          <Text>{translations.transactionHeader[transaction.type]}</Text>
        </View>
        <View>
          <Text>{transaction.timestamp.format('YYYY-MM-DD hh:mm:ss A')}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Label>{translations.fromAddresses}</Label>

        {_.uniq(transaction.fromAddresses).map((address) => (
          <Text key={address}>{address}</Text>
        ))}
      </View>

      <View style={styles.section}>
        <Label>{translations.toAddresses}</Label>

        {_.uniq(transaction.toAddresses).map((address) => (
          <Text key={address}>{address}</Text>
        ))}
      </View>

      <View style={styles.section}>
        <Label>{translations.txAssuranceLevel}</Label>
        <Text>
          {translations.formatConfirmations(
            transaction.confirmations.toNumber(),
          )}
        </Text>
      </View>

      <View style={styles.section}>
        <Label>{translations.transactionId}</Label>
        <Text>{transaction.id}</Text>
      </View>
    </Screen>
  )
}

export default compose(
  connect((state) => ({
    translations: getTranslations(state),
  })),
)(TxDetails)
