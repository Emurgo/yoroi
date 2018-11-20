// @flow

import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {View, Linking} from 'react-native'
import _ from 'lodash'
import {withHandlers} from 'recompose'

import {transactionsInfoSelector} from '../../selectors'
import {withNavigationTitle} from '../../utils/renderUtils'
import {formatAda, formatDateToSeconds} from '../../utils/format'
import {Text, Button, OfflineBanner} from '../UiKit'
import Screen from '../../components/Screen'
import AdaIcon from '../../assets/AdaIcon'
import {CONFIG} from '../../config'

import styles from './styles/TxDetails.style'

import type {Navigation} from '../../types/navigation'
import type {ComponentType} from 'react'

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

const Section = ({label, children}) => (
  <View style={styles.section}>
    <Label>{label}</Label>
    {children}
  </View>
)

const TxDetails = ({navigation, translations, transaction, openInExplorer}) => {
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

        <Section label={translations.transactionId}>
          <Button onPress={openInExplorer} title={transaction.id} />
        </Section>
        <Section label={translations.fromAddresses}>
          {_.uniq(transaction.fromAddresses).map((address) => (
            <Text key={address}>{address}</Text>
          ))}
        </Section>
        <Section label={translations.toAddresses}>
          {_.uniq(transaction.toAddresses).map((address) => (
            <Text key={address}>{address}</Text>
          ))}
        </Section>
        <Section label={translations.txAssuranceLevel}>
          <Text>
            {translations.formatConfirmations(transaction.confirmations)}
          </Text>
        </Section>
      </Screen>
    </View>
  )
}

export default (compose(
  connect((state, {navigation}) => ({
    translations: getTranslations(state),
    transaction: transactionsInfoSelector(state)[navigation.getParam('id')],
  })),
  withNavigationTitle(({transaction}) =>
    formatDateToSeconds(transaction.submittedAt),
  ),
  withHandlers({
    openInExplorer: ({transaction}) => () => {
      Linking.openURL(CONFIG.CARDANO.EXPLORER_URL_FOR_TX(transaction.id))
    },
  }),
)(TxDetails): ComponentType<{navigation: Navigation}>)
