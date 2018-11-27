// @flow

import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {View, Linking, TouchableHighlight} from 'react-native'
import _ from 'lodash'
import {withHandlers} from 'recompose'

import {
  transactionsInfoSelector,
  internalAddressIndexSelector,
  externalAddressIndexSelector,
} from '../../selectors'
import {withNavigationTitle} from '../../utils/renderUtils'
import {formatAda, formatDateToSeconds} from '../../utils/format'
import {Text, Button, OfflineBanner} from '../UiKit'
import Screen from '../../components/Screen'
import AdaIcon from '../../assets/AdaIcon'
import {CONFIG} from '../../config'
import {TX_HISTORY_ROUTES} from '../../RoutesList'

import styles from './styles/TxDetails.style'
import {TRANSACTION_DIRECTION} from '../../types/HistoryTransaction'

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

const getTranslations = (state) => state.trans.TransactionDetailScreen

const AddressEntry = withHandlers({
  onPress: ({address, showModalForAddress}) => () =>
    showModalForAddress(address),
})(({address, onPress, path, isHighlighted}) => {
  return (
    <TouchableHighlight activeOpacity={0.9} onPress={onPress}>
      {/* eslint-disable-next-line react-native/no-inline-styles */}
      <Text style={isHighlighted ? {fontWeight: 'bold'} : {}}>
        ({path}){address}
      </Text>
    </TouchableHighlight>
  )
})

const Section = ({label, children}) => (
  <View style={styles.section}>
    <Label>{label}</Label>
    {children}
  </View>
)

const getShownAddresses = (
  transaction,
  internalAddressIndex,
  externalAddressIndex,
) => {
  const isMyReceive = (address) => externalAddressIndex[address] != null
  const isMyChange = (address) => internalAddressIndex[address] != null
  const isMyAddress = (address) => isMyReceive(address) || isMyChange(address)

  const getPath = (address) => {
    if (isMyChange(address)) return '/change'
    if (isMyReceive(address)) {
      return `/${externalAddressIndex[address]}`
    }
    return 'not mine'
  }

  const {isHighlightedFrom, filterFrom, isHighlightedTo, filterTo} = {
    [TRANSACTION_DIRECTION.SENT]: {
      isHighlightedFrom: (address) => false,
      filterFrom: null,
      isHighlightedTo: (address) => !isMyAddress(address),
      filterTo: null,
    },
    [TRANSACTION_DIRECTION.RECEIVED]: {
      isHighlightedFrom: (address) => false,
      filterFrom: null,
      isHighlightedTo: (address) => isMyAddress(address),
      filterTo: (address) => isMyAddress(address),
    },
    [TRANSACTION_DIRECTION.SELF]: {
      isHighlightedFrom: (address) => false,
      filterFrom: null,
      isHighlightedTo: (address) => !isMyChange(address),
      filterTo: null,
    },
    [TRANSACTION_DIRECTION.MULTI]: {
      isHighlightedFrom: (address) => isMyAddress(address),
      filterFrom: null,
      isHighlightedTo: (address) => isMyAddress(address),
      filterTo: null,
    },
  }[transaction.direction]

  // TODO(ppershing): decide on importance based on Tx direction
  const fromAddresses = _.uniq(transaction.fromAddresses).map((address) => ({
    address,
    path: getPath(address),
    isHighlighted: isHighlightedFrom(address),
  }))
  const fromFiltered = fromAddresses.filter(
    ({address}) => (filterFrom ? filterFrom(address) : true),
  )
  const cntOmittedFrom = fromAddresses.length - fromFiltered.length

  const toAddresses = _.uniq(transaction.toAddresses).map((address) => ({
    address,
    path: getPath(address),
    isHighlighted: isHighlightedTo(address),
  }))
  const toFiltered = toAddresses.filter(
    ({address}) => (filterTo ? filterTo(address) : true),
  )
  const cntOmittedTo = toAddresses.length - toFiltered.length

  return {
    fromFiltered,
    cntOmittedFrom,
    toFiltered,
    cntOmittedTo,
  }
}

const TxDetails = ({
  navigation,
  translations,
  transaction,
  internalAddressIndex,
  externalAddressIndex,
  openInExplorer,
  showModalForAddress,
}) => {
  const {
    fromFiltered,
    cntOmittedFrom,
    toFiltered,
    cntOmittedTo,
  } = getShownAddresses(transaction, internalAddressIndex, externalAddressIndex)

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
          {fromFiltered.map((item, i) => (
            <AddressEntry
              key={i}
              {...item}
              showModalForAddress={showModalForAddress}
            />
          ))}
          {cntOmittedFrom > 0 ? (
            <Text>{translations.formatOmittedCount(cntOmittedFrom)}</Text>
          ) : null}
        </Section>
        <Section label={translations.toAddresses}>
          {toFiltered.map((item, i) => (
            <AddressEntry
              key={i}
              {...item}
              showModalForAddress={showModalForAddress}
            />
          ))}
          {cntOmittedTo > 0 ? (
            <Text>{translations.formatOmittedCount(cntOmittedTo)}</Text>
          ) : null}
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
    internalAddressIndex: internalAddressIndexSelector(state),
    externalAddressIndex: externalAddressIndexSelector(state),
  })),
  withNavigationTitle(({transaction}) =>
    formatDateToSeconds(transaction.submittedAt),
  ),
  withHandlers({
    openInExplorer: ({transaction}) => () => {
      Linking.openURL(CONFIG.CARDANO.EXPLORER_URL_FOR_TX(transaction.id))
    },
    showModalForAddress: ({navigation}) => (address) =>
      navigation.navigate(TX_HISTORY_ROUTES.ADDRESS_DETAIL, {address}),
  }),
)(TxDetails): ComponentType<{navigation: Navigation}>)
