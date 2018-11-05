// @flow

import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {View} from 'react-native'
import _ from 'lodash'

import {transactionsInfoSelector} from '../../selectors'
import {printAda} from '../../utils/transactions'
import {Text} from '../UiKit'
import Screen from '../../components/Screen'
import AdaIcon from '../../assets/AdaIcon'
import {withNavigationTitle} from '../../utils/renderUtils'

import styles from './styles/TxDetails.style'
import {TRANSACTION_DIRECTION} from '../../types/HistoryTransaction'

import type {SubTranslation} from '../../l10n/typeHelpers'
import type {NavigationScreenProp, NavigationState} from 'react-navigation'
import type {TransactionInfo} from '../../types/HistoryTransaction'

const Label = ({children}) => <Text style={styles.label}>{children}</Text>

const AdaAmount = ({amount, direction}) => {
  const amountStyle =
    direction === TRANSACTION_DIRECTION.SELF
      ? styles.noAmount
      : amount.gte(0)
        ? styles.positiveAmount
        : styles.negativeAmount

  const amountText =
    direction === TRANSACTION_DIRECTION.SELF ? '--' : printAda(amount)
  return (
    <View style={styles.amountContainer}>
      <Text style={amountStyle}>{amountText}</Text>
      <View style={styles.adaSignContainer}>
        <AdaIcon width={18} height={18} color={amountStyle.color} />
      </View>
    </View>
  )
}

const getTranslations = (state) => state.trans.TxDetails

type Props = {
  navigation: NavigationScreenProp<NavigationState>,
  translations: SubTranslation<typeof getTranslations>,
  transaction: TransactionInfo,
}

const TxDetails = ({navigation, translations, transaction}: Props) => {
  return (
    <Screen scroll>
      <AdaAmount
        amount={transaction.amount}
        direction={transaction.direction}
      />
      <Text>Fee: TODO</Text>
      <View style={styles.timestampContainer}>
        <View>
          <Text>{translations.transactionHeader[transaction.direction]}</Text>
        </View>
        <View>
          <Text>{transaction.submittedAt.format('YYYY-MM-DD hh:mm:ss A')}</Text>
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
          {translations.formatConfirmations(transaction.confirmations)}
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
  connect((state, {navigation}) => ({
    translations: getTranslations(state),
    transaction: transactionsInfoSelector(state)[navigation.getParam('id')],
  })),
  withNavigationTitle(({transaction}) =>
    transaction.submittedAt.format('YY-MM-DD hh:mm:ss A'),
  ),
)(TxDetails)
