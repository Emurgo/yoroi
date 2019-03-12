// @flow

import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {View, Linking, TouchableOpacity} from 'react-native'
import _ from 'lodash'
import {withHandlers, withStateHandlers} from 'recompose'
import {injectIntl, defineMessages, intlShape} from 'react-intl'

import {
  transactionsInfoSelector,
  internalAddressIndexSelector,
  externalAddressIndexSelector,
} from '../../selectors'
import {withNavigationTitle} from '../../utils/renderUtils'
import {formatAdaWithSymbol, formatDateToSeconds} from '../../utils/format'
import {Text, Button, OfflineBanner, Banner, StatusBar} from '../UiKit'
import Screen from '../../components/Screen'
import {CONFIG} from '../../config'
import AddressModal from '../Receive/AddressModal'

import styles from './styles/TxDetails.style'

import type {State} from '../../state'
import type {Navigation} from '../../types/navigation'
import type {ComponentType} from 'react'
import {TRANSACTION_DIRECTION} from '../../types/HistoryTransaction'

const txTypeMessages = defineMessages({
  SENT: {
    id: 'components.txhistory.txdetails.txTypeSent',
    defaultMessage: '!!!Sent funds',
  },
  RECEIVED: {
    id: 'components.txhistory.txdetails.txTypeReceived',
    defaultMessage: '!!!Received funds',
  },
  SELF: {
    id: 'components.txhistory.txdetails.txTypeSelf',
    defaultMessage: '!!!Intrawallet transaction',
    description: 'some desc',
  },
  MULTI: {
    id: 'components.txhistory.txdetails.txTypeMulti',
    defaultMessage: '!!!Multi-party transaction',
    description: 'some desc',
  },
})

const messages = defineMessages({
  addressPrefixReceive: {
    id: 'components.txhistory.txdetails.addressPrefixReceive',
    defaultMessage: '!!!/{idx}',
    description: 'some desc',
  },
  addressPrefixChange: {
    id: 'components.txhistory.txdetails.addressPrefixChange',
    defaultMessage: '!!!/change',
    description: 'some desc',
  },
  addressPrefixNotMine: {
    id: 'components.txhistory.txdetails.addressPrefixNotMine',
    defaultMessage: '!!!not mine',
    description: 'some desc',
  },
  fee: {
    id: 'components.txhistory.txdetails.fee',
    defaultMessage: '!!!Fee: ',
    description: 'some desc',
  },
  fromAddresses: {
    id: 'components.txhistory.txdetails.fromAddresses',
    defaultMessage: '!!!From Addresses',
    description: 'some desc',
  },
  toAddresses: {
    id: 'components.txhistory.txdetails.toAddresses',
    defaultMessage: '!!!To Addresses',
    description: 'some desc',
  },
  transactionId: {
    id: 'components.txhistory.txdetails.transactionId',
    defaultMessage: '!!!Transaction ID',
    description: 'some desc',
  },
  txAssuranceLevel: {
    id: 'components.txhistory.txdetails.txAssuranceLevel',
    defaultMessage: '!!!Transaction assurance level',
    description: 'some desc',
  },
  confirmations: {
    id: 'components.txhistory.txdetails.confirmations',
    defaultMessage: '!!!{cnt} {cnt, plural, one {CONFIRMATION} other {CONFIRMATIONS}}',
    description: 'some desc',
  },
  omittedCount: {
    id: 'components.txhistory.txdetails.omittedCount',
    defaultMessage: '!!!+ {cnt} omitted',
  },
})

const Label = ({children}) => <Text style={styles.label}>{children}</Text>

const AdaAmount = ({amount, direction}) => {
  const amountStyle = amount.gte(0)
    ? styles.positiveAmount
    : styles.negativeAmount

  return <Text style={amountStyle}>{formatAdaWithSymbol(amount)}</Text>
}

const AddressEntry = withHandlers({
  onPress: ({address, showModalForAddress}) => () =>
    showModalForAddress(address),
})(({address, onPress, path, isHighlighted}) => {
  return (
    <TouchableOpacity activeOpacity={0.5} onPress={onPress}>
      {/* eslint-disable-next-line react-native/no-inline-styles */}
      <Text secondary bold={isHighlighted}>
        ({path}) {address}
      </Text>
    </TouchableOpacity>
  )
})

const getShownAddresses = (
  intl,
  transaction,
  internalAddressIndex,
  externalAddressIndex,
) => {
  const isMyReceive = (address) => externalAddressIndex[address] != null
  const isMyChange = (address) => internalAddressIndex[address] != null
  const isMyAddress = (address) => isMyReceive(address) || isMyChange(address)

  const getPath = (address) => {
    if (isMyReceive(address)) {
      return intl.formatMessage(messages.addressPrefixReceive, {idx: externalAddressIndex[address]})
    } else if (isMyChange(address)) {
      return intl.formatMessage(messages.addressPrefixChange, {idx: internalAddressIndex[address]})
    } else {
      return intl.formatMessage(messages.addressPrefixNotMine)
    }
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
  intl,
  transaction,
  internalAddressIndex,
  externalAddressIndex,
  openInExplorer,
  showModalForAddress,
  addressDetail,
  hideAddressModal,
}) => {
  const {
    fromFiltered,
    cntOmittedFrom,
    toFiltered,
    cntOmittedTo,
  } = getShownAddresses(
    intl,
    transaction,
    internalAddressIndex,
    externalAddressIndex,
  )
  const txFee = transaction.fee

  return (
    <View style={styles.container}>
      <StatusBar type="dark" />

      <OfflineBanner />
      <Screen scroll>
        <Banner label={intl.formatMessage(txTypeMessages[transaction.direction])}>
          {transaction.amount && (
            <AdaAmount
              amount={transaction.amount}
              direction={transaction.direction}
            />
          )}
          {txFee && (
            <Text small>
              {intl.formatMessage(messages.fee)} {formatAdaWithSymbol(txFee)}
            </Text>
          )}
        </Banner>
        <View style={styles.content}>
          <Label>{intl.formatMessage(messages.fromAddresses)}</Label>
          {fromFiltered.map((item, i) => (
            <AddressEntry
              key={i}
              {...item}
              showModalForAddress={showModalForAddress}
            />
          ))}
          {cntOmittedFrom > 0 && (
            <Text>{intl.formatMessage(messages.omittedCount, {cnt: cntOmittedFrom})}</Text>
          )}
          <Label>{intl.formatMessage(messages.toAddresses)}</Label>
          {toFiltered.map((item, i) => (
            <AddressEntry
              key={i}
              {...item}
              showModalForAddress={showModalForAddress}
            />
          ))}
          {cntOmittedTo > 0 && (
            <Text>{intl.formatMessage(messages.omittedCount, {cnt: cntOmittedTo})}</Text>
          )}
          <Label>{intl.formatMessage(messages.txAssuranceLevel)}</Label>
          <Text secondary>
            {intl.formatMessage(messages.confirmations, {cnt: transaction.confirmations})}
          </Text>
          <Label>{intl.formatMessage(messages.transactionId)}</Label>
          <Button onPress={openInExplorer} title={transaction.id} />
        </View>
      </Screen>
      <AddressModal
        visible={!!addressDetail}
        onRequestClose={hideAddressModal}
        address={addressDetail}
        index={null}
      />
    </View>
  )
}

export default injectIntl((compose(
  connect((state: State, {navigation}) => {
    return ({
      transaction: transactionsInfoSelector(state)[navigation.getParam('id')],
      internalAddressIndex: internalAddressIndexSelector(state),
      externalAddressIndex: externalAddressIndexSelector(state),
    })
  }),
  withNavigationTitle(({transaction}) => formatDateToSeconds(transaction.submittedAt),
  ),
  withStateHandlers(
    {addressDetail: null},
    {
      setAddressDetail: (state, props) => (address) => ({
        addressDetail: address,
      }),
    },
  ),
  withHandlers({
    openInExplorer: ({transaction}) => () => {
      if (transaction) {
        Linking.openURL(CONFIG.CARDANO.EXPLORER_URL_FOR_TX(transaction.id))
      }
    },
    showModalForAddress: ({setAddressDetail}) => (address) => {
      setAddressDetail(address)
    },
    hideAddressModal: ({setAddressDetail}) => () => {
      setAddressDetail(null)
    },
  }),
)(TxDetails): ComponentType<{|navigation: Navigation, intl: intlShape|}>))
