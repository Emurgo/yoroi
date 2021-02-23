// @flow

import React, {Component} from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {View, TouchableOpacity} from 'react-native'
import {injectIntl, defineMessages} from 'react-intl'
import {BigNumber} from 'bignumber.js'

import {Text} from '../UiKit'
import utfSymbols from '../../utils/utfSymbols'
import {
  transactionsInfoSelector,
  availableAssetsSelector,
  defaultNetworkAssetSelector,
} from '../../selectors'
import {TX_HISTORY_ROUTES} from '../../RoutesList'
import styles from './styles/TxHistoryListItem.style'

import {
  getAssetDenomination,
  formatTokenAmount,
  formatTokenInteger,
  formatTokenFractional,
  formatTimeToSeconds,
} from '../../utils/format'
import {MultiToken} from '../../crypto/MultiToken'

import type {TransactionInfo, Token} from '../../types/HistoryTransaction'

const messages = defineMessages({
  fee: {
    id: 'components.txhistory.txhistorylistitem.fee',
    defaultMessage: '!!!Fee',
  },
  transactionTypeSent: {
    id: 'components.txhistory.txhistorylistitem.transactionTypeSent',
    defaultMessage: '!!!ADA sent',
    description: 'some desc',
  },
  transactionTypeReceived: {
    id: 'components.txhistory.txhistorylistitem.transactionTypeReceived',
    defaultMessage: '!!!ADA received',
  },
  transactionTypeSelf: {
    id: 'components.txhistory.txhistorylistitem.transactionTypeSelf',
    defaultMessage: '!!!Intrawallet',
    description: 'some desc',
  },
  transactionTypeMulti: {
    id: 'components.txhistory.txhistorylistitem.transactionTypeMulti',
    defaultMessage: '!!!Multiparty',
    description: 'some desc',
  },
  assuranceLevelHeader: {
    id: 'components.txhistory.txhistorylistitem.assuranceLevelHeader',
    defaultMessage: '!!!Assurance level:',
    description: 'some desc',
  },
  assuranceLevelLow: {
    id: 'components.txhistory.txhistorylistitem.assuranceLevelLow',
    defaultMessage: '!!!Low',
    description: 'some desc',
  },
  assuranceLevelMedium: {
    id: 'components.txhistory.txhistorylistitem.assuranceLevelMedium',
    defaultMessage: '!!!Medium',
    description: 'some desc',
  },
  assuranceLevelHigh: {
    id: 'components.txhistory.txhistorylistitem.assuranceLevelHigh',
    defaultMessage: '!!!High',
    description: 'some desc',
  },
  assuranceLevelPending: {
    id: 'components.txhistory.txhistorylistitem.assuranceLevelPending',
    defaultMessage: '!!!Pending',
    description: 'some desc',
  },
  assuranceLevelFailed: {
    id: 'components.txhistory.txhistorylistitem.assuranceLevelFailed',
    defaultMessage: '!!!Failed',
    description: 'some desc',
  },
})

type Props = {
  transaction: TransactionInfo,
  availableAssets: Dict<Token>,
  defaultNetworkAsset: Token,
  navigation: any, // TODO: type
  intl: any,
}

const _AssuranceLevel = ({transaction, intl}) => {
  const assuranceLevelMsgMap = {
    LOW: messages.assuranceLevelLow,
    MEDIUM: messages.assuranceLevelMedium,
    HIGH: messages.assuranceLevelHigh,
    PENDING: messages.assuranceLevelPending,
    FAILED: messages.assuranceLevelFailed,
  }
  return (
    <View style={[styles.assurance, styles[transaction.assurance]]}>
      <Text adjustsFontSizeToFit style={styles.assuranceText}>
        {intl
          .formatMessage(assuranceLevelMsgMap[transaction.assurance])
          .toLocaleUpperCase()}
      </Text>
    </View>
  )
}

const AssuranceLevel = injectIntl(_AssuranceLevel)

class TxHistoryListItem extends Component<Props> {
  shouldComponentUpdate(nextProps) {
    // Note: technically we should also verify
    // submittedAt, fee and amount but
    // - submittedAt and fee should be invariant if other conditions are met
    // - amount should be invariant as long as the transaction
    //   is not multi-party
    const tx = this.props.transaction
    const nextTx = nextProps.transaction

    const sameValue = (x: ?MultiToken, y: ?MultiToken) =>
      x && y ? x.isEqualTo(y) : x === y
    const sameTs = (x, y) => x === y

    return (
      this.props.intl !== nextProps.intl ||
      tx.id !== nextTx.id ||
      tx.assurance !== nextTx.assurance ||
      tx.direction !== nextTx.direction ||
      !sameValue(tx.amount, nextTx.amount) ||
      !sameValue(tx.fee, nextTx.fee) ||
      !sameTs(tx.submittedAt, nextTx.submittedAt)
    )
  }

  showDetails = () => {
    const {navigation, transaction} = this.props

    navigation.navigate(TX_HISTORY_ROUTES.TX_DETAIL, {id: transaction.id})
  }

  render() {
    const {transaction, availableAssets, defaultNetworkAsset, intl} = this.props

    const amount: BigNumber = transaction.amount.getDefault()
    const amountDefaultAsset: ?Token =
      availableAssets[transaction.amount.getDefaultId()]

    const defaultAsset = amountDefaultAsset || defaultNetworkAsset

    // if we don't have a symbol for this asset, default to ticker first and
    // then to identifier
    const assetSymbol = getAssetDenomination(defaultAsset)

    const amountStyle = amount
      ? amount.gte(0)
        ? styles.positiveAmount
        : styles.negativeAmount
      : styles.neutralAmount

    const isPending = transaction.assurance === 'PENDING'
    const assuranceContainerStyle = styles[`${transaction.assurance}_CONTAINER`]
    const txDirectionMsgMap = {
      SENT: messages.transactionTypeSent,
      RECEIVED: messages.transactionTypeReceived,
      SELF: messages.transactionTypeSelf,
      MULTI: messages.transactionTypeMulti,
    }
    const txFee: ?BigNumber =
      transaction.fee != null ? transaction.fee.getDefault() : null
    const feeStr = txFee ? formatTokenAmount(txFee, defaultAsset) : '-'

    return (
      <TouchableOpacity onPress={this.showDetails} activeOpacity={0.5}>
        <View style={[styles.container, assuranceContainerStyle]}>
          <View style={styles.meta}>
            <Text small>{formatTimeToSeconds(transaction.submittedAt)}</Text>
            {transaction.fee && (
              <Text secondary={!isPending}>
                {`${intl.formatMessage(messages.fee)} ${feeStr}`}
              </Text>
            )}
            <Text secondary={!isPending}>
              {intl.formatMessage(txDirectionMsgMap[transaction.direction])}
            </Text>
          </View>
          <View style={styles.row}>
            <AssuranceLevel transaction={transaction} />
            {transaction.amount ? (
              <View style={styles.amount}>
                <Text style={amountStyle}>
                  {formatTokenInteger(amount, defaultAsset)}
                </Text>
                <Text small style={amountStyle}>
                  {formatTokenFractional(amount, defaultAsset)}
                </Text>
                <Text style={amountStyle}>{`${
                  utfSymbols.NBSP
                }${assetSymbol}`}</Text>
              </View>
            ) : (
              <Text style={amountStyle}>- -</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    )
  }
}

export default injectIntl(
  compose(
    connect((state, {id}) => ({
      transaction: transactionsInfoSelector(state)[id],
      availableAssets: availableAssetsSelector(state),
      defaultNetworkAsset: defaultNetworkAssetSelector(state),
    })),
  )(TxHistoryListItem),
)
