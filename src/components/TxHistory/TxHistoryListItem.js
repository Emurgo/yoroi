// @flow

import React, {Component} from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {View, TouchableOpacity} from 'react-native'

import {Text} from '../UiKit'
import utfSymbols from '../../utils/utfSymbols'
import {transactionsInfoSelector} from '../../selectors'
import {TX_HISTORY_ROUTES} from '../../RoutesList'
import styles from './styles/TxHistoryListItem.style'
import {withTranslations} from '../../utils/renderUtils'

import {
  formatAda,
  formatAdaInteger,
  formatAdaFractional,
  formatTimeToSeconds,
} from '../../utils/format'

import type {NavigationScreenProp, NavigationState} from 'react-navigation'
import type {SubTranslation} from '../../l10n/typeHelpers'
import type {TransactionInfo} from '../../types/HistoryTransaction'

const getTranslations = (state) =>
  state.trans.TransactionHistoryScreeen.transaction

type Props = {
  transaction: TransactionInfo,
  navigation: NavigationScreenProp<NavigationState>,
  translations: SubTranslation<typeof getTranslations>,
}

const _AssuranceLevel = ({transaction, translations}) => {
  return (
    <View style={[styles.assurance, styles[transaction.assurance]]}>
      <Text style={styles.assuranceText}>
        {translations.assuranceLevel[transaction.assurance].toLocaleUpperCase()}
      </Text>
    </View>
  )
}

const AssuranceLevel = withTranslations(getTranslations)(_AssuranceLevel)

class TxHistoryListItem extends Component<Props> {
  shouldComponentUpdate(nextProps) {
    // Note: technically we should also verify
    // submittedAt, fee and amount but
    // - submittedAt and fee should be invariant if other conditions are met
    // - amount should be invariant as long as the transaction
    //   is not multi-party
    const tx = this.props.transaction
    const nextTx = nextProps.transaction

    const sameMaybeBignum = (x, y) => (x && y ? x.eq(y) : x === y)
    const sameTs = (x, y) => x === y

    return (
      this.props.translations !== nextProps.translations ||
      tx.id !== nextTx.id ||
      tx.assurance !== nextTx.assurance ||
      tx.direction !== nextTx.direction ||
      !sameMaybeBignum(tx.amount, nextTx.amount) ||
      !sameMaybeBignum(tx.fee, nextTx.fee) ||
      !sameTs(tx.submittedAt, nextTx.submittedAt)
    )
  }

  showDetails = () => {
    const {navigation, transaction} = this.props

    navigation.navigate(TX_HISTORY_ROUTES.TX_DETAIL, {id: transaction.id})
  }

  render() {
    const {transaction, translations} = this.props

    const amountStyle = transaction.amount
      ? transaction.amount.gte(0)
        ? styles.positiveAmount
        : styles.negativeAmount
      : styles.neutralAmount

    const isPending = transaction.assurance === 'PENDING'
    const assuranceContainerStyle = styles[`${transaction.assurance}_CONTAINER`]

    return (
      <TouchableOpacity onPress={this.showDetails} activeOpacity={0.5}>
        <View style={[styles.container, assuranceContainerStyle]}>
          <View style={styles.meta}>
            <Text small>{formatTimeToSeconds(transaction.submittedAt)}</Text>
            {transaction.fee && (
              <Text secondary={!isPending}>
                {`${translations.fee} ${formatAda(transaction.fee)}`}
              </Text>
            )}
            <Text secondary={!isPending}>
              {translations.transactionType[transaction.direction]}
            </Text>
          </View>
          <View style={styles.row}>
            <AssuranceLevel transaction={transaction} />
            {transaction.amount ? (
              <View style={styles.amount}>
                <Text style={amountStyle}>
                  {formatAdaInteger(transaction.amount)}
                </Text>
                <Text small style={amountStyle}>
                  {/* $FlowFixMe not sure why flow thinks
                      amount could be null*/}
                  {formatAdaFractional(transaction.amount)}
                </Text>
                <Text style={amountStyle}>{`${utfSymbols.NBSP}${
                  utfSymbols.ADA
                }`}</Text>
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

export default compose(
  connect((state, {id}) => ({
    translations: getTranslations(state),
    transaction: transactionsInfoSelector(state)[id],
  })),
)(TxHistoryListItem)
