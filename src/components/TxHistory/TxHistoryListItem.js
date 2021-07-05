// @flow

import React, {Component} from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {View, TouchableOpacity} from 'react-native'
import {injectIntl, defineMessages, type IntlShape} from 'react-intl'
import {BigNumber} from 'bignumber.js'
import _ from 'lodash'
import type {MessageDescriptor} from 'react-intl'

import {Text, TxIcon} from '../UiKit'
import utfSymbols from '../../utils/utfSymbols'
import {
  transactionsInfoSelector,
  availableAssetsSelector,
  defaultNetworkAssetSelector,
  internalAddressIndexSelector,
  externalAddressIndexSelector,
} from '../../selectors'
import {TX_HISTORY_ROUTES} from '../../RoutesList'
import styles from './styles/TxHistoryListItem.style'

import {
  getAssetDenominationOrId,
  formatTokenInteger,
  formatTokenFractional,
  formatTimeToSeconds,
  ASSET_DENOMINATION,
} from '../../utils/format'
import {MultiToken} from '../../crypto/MultiToken'

import type {
  TransactionInfo,
  Token,
  IOData,
} from '../../types/HistoryTransaction'

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
  assets: {
    id: 'global.txLabels.assets',
    defaultMessage: '!!!{cnt} assets',
    description: 'The number of assets different assets, not the amount',
  },
})

const ASSURANCE_MESSAGES: $ReadOnly<Dict<MessageDescriptor>> = Object.freeze({
  LOW: messages.assuranceLevelLow,
  MEDIUM: messages.assuranceLevelMedium,
  HIGH: messages.assuranceLevelHigh,
  PENDING: messages.assuranceLevelPending,
  FAILED: messages.assuranceLevelFailed,
})

const DIRECTION_MESSAGES: $ReadOnly<Dict<MessageDescriptor>> = Object.freeze({
  SENT: messages.transactionTypeSent,
  RECEIVED: messages.transactionTypeReceived,
  SELF: messages.transactionTypeSelf,
  MULTI: messages.transactionTypeMulti,
})

const filtersTxIO = (address: string) => {
  const isMyReceive = (extAddrIdx: Dict<number>) => extAddrIdx[address] != null
  const isMyChange = (intAddrIdx: Dict<number>) => intAddrIdx[address] != null
  const isMyAddress = (extAddrIdx: Dict<number>, intAddrIdx: Dict<number>) =>
    isMyReceive(extAddrIdx) || isMyChange(intAddrIdx)
  return {
    isMyReceive,
    isMyChange,
    isMyAddress,
  }
}

const getTxIOMyWallet = (
  txIO: Array<IOData>,
  extAddrIdx: Dict<number>,
  intAddrIdx: Dict<number>,
) => {
  const io = _.uniq(txIO).map(({address, assets}) => ({
    address,
    assets,
  }))
  const filtered = io.filter(({address}) =>
    filtersTxIO(address).isMyAddress(extAddrIdx, intAddrIdx),
  )
  return filtered || []
}

type Props = {
  transaction: TransactionInfo,
  internalAddressIndex: Dict<number>,
  externalAddressIndex: Dict<number>,
  availableAssets: Dict<Token>,
  defaultNetworkAsset: Token,
  navigation: any, // TODO: type
  intl: IntlShape,
}
class TxHistoryListItem extends Component<Props> {
  shouldComponentUpdate(nextProps) {
    // Note: technically we should also verify
    // submittedAt, fee and amount but
    // - submittedAt and fee should be invariant if other conditions are met
    // - amount should be invariant as long as the transaction
    //   is not multi-party
    const tx = this.props.transaction
    const nextTx = nextProps.transaction

    const fee = tx.fee != null ? MultiToken.fromArray(tx.fee) : null
    const nextFee = nextTx.fee != null ? MultiToken.fromArray(nextTx.fee) : null

    const sameValue = (x: ?MultiToken, y: ?MultiToken) =>
      x && y ? x.isEqualTo(y) : x === y
    const sameTs = (x, y) => x === y

    return (
      this.props.intl !== nextProps.intl ||
      tx.id !== nextTx.id ||
      tx.assurance !== nextTx.assurance ||
      tx.direction !== nextTx.direction ||
      !sameValue(
        MultiToken.fromArray(tx.amount),
        MultiToken.fromArray(nextTx.amount),
      ) ||
      !sameValue(fee, nextFee) ||
      !sameTs(tx.submittedAt, nextTx.submittedAt)
    )
  }

  showDetails = () => {
    const {navigation, transaction} = this.props

    navigation.navigate(TX_HISTORY_ROUTES.TX_DETAIL, {id: transaction.id})
  }

  render() {
    const {
      transaction,
      availableAssets,
      defaultNetworkAsset,
      intl,
      externalAddressIndex,
      internalAddressIndex,
    } = this.props

    const amountAsMT = MultiToken.fromArray(transaction.amount)
    const amount: BigNumber = amountAsMT.getDefault()
    const amountDefaultAsset: ?Token =
      availableAssets[amountAsMT.getDefaultId()]

    const defaultAsset = amountDefaultAsset || defaultNetworkAsset

    // if we don't have a symbol for this asset, default to ticker first and
    // then to identifier
    const assetSymbol = getAssetDenominationOrId(
      defaultAsset,
      ASSET_DENOMINATION.SYMBOL,
    )

    const amountStyle = amount
      ? amount.gte(0)
        ? styles.positiveAmount
        : styles.negativeAmount
      : styles.neutralAmount

    const isPending = transaction.assurance === 'PENDING'
    const assuranceContainerStyle = styles[`${transaction.assurance}_CONTAINER`]

    const isReceived = transaction.direction === 'RECEIVED'
    const outputsToMyWallet =
      (isReceived &&
        getTxIOMyWallet(
          transaction.outputs,
          externalAddressIndex,
          internalAddressIndex,
        )) ||
      []

    const totalAssets =
      outputsToMyWallet.reduce(
        (acc, {assets}) => acc + Number(assets.length),
        0,
      ) || 0

    return (
      <TouchableOpacity onPress={this.showDetails} activeOpacity={0.5}>
        <View style={[styles.container, assuranceContainerStyle]}>
          <View style={styles.iconContainer}>
            <TxIcon transaction={transaction} />
          </View>
          <View style={styles.txContainer}>
            <View style={styles.row}>
              <Text small secondary={isPending}>
                {intl.formatMessage(DIRECTION_MESSAGES[transaction.direction])}
              </Text>
              {transaction.amount ? (
                <View style={styles.amount}>
                  <Text style={amountStyle} secondary={isPending}>
                    {formatTokenInteger(amount, defaultAsset)}
                  </Text>
                  <Text small style={amountStyle} secondary={isPending}>
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
            {totalAssets !== 0 && (
              <View style={styles.row}>
                <Text secondary small>
                  {formatTimeToSeconds(transaction.submittedAt)}
                </Text>
                <Text>
                  {intl.formatMessage(messages.assets, {
                    cnt: totalAssets,
                  })}
                </Text>
              </View>
            )}
            <View style={styles.last}>
              <Text secondary small>
                {!totalAssets && formatTimeToSeconds(transaction.submittedAt)}
              </Text>
              <Text secondary small style={styles.assuranceText}>
                {intl.formatMessage(ASSURANCE_MESSAGES[transaction.assurance])}
              </Text>
            </View>
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
      internalAddressIndex: internalAddressIndexSelector(state),
      externalAddressIndex: externalAddressIndexSelector(state),
      defaultNetworkAsset: defaultNetworkAssetSelector(state),
    })),
  )(TxHistoryListItem),
)
