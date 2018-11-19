// @flow

import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {View} from 'react-native'
import _ from 'lodash'

import {transactionsInfoSelector} from '../../selectors'
import {withNavigationTitle} from '../../utils/renderUtils'
import {formatAda} from '../../utils/format'
import {Text, OfflineBanner} from '../UiKit'
import Screen from '../../components/Screen'
import AdaIcon from '../../assets/AdaIcon'

import styles from './styles/TxDetails.style'

import type {SubTranslation} from '../../l10n/typeHelpers'
import type {NavigationScreenProp, NavigationState} from 'react-navigation'
import type {TransactionInfo} from '../../types/HistoryTransaction'

const Label = ({children}) => <Text style={styles.label}>{children}</Text>

const AdaAmount = ({amount, direction}) => {
  const amountStyle = amount.gte(0)
    ? styles.positiveAmount
    : styles.negativeAmount

  return (
    <View style={styles.amountContainer}>
      <Text style={amountStyle}>{formatAda(amount)}</Text>
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
    <View style={styles.root}>
      <OfflineBanner />
      <Screen scroll>
        <View style={styles.timestampContainer}>
          <Text>{translations.type[transaction.direction]}</Text>
          {transaction.amount && (
            <AdaAmount
              amount={transaction.amount}
              direction={transaction.direction}
            />
          )}
          {transaction.fee && (
            <Text>
              {translations.fee} {formatAda(transaction.fee)}
            </Text>
          )}
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
    </View>
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
