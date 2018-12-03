// @flow

import React, {Component} from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {View, TouchableOpacity} from 'react-native'

import {Text} from '../UiKit'
import AdaIcon from '../../assets/AdaIcon'
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

const AdaSign = ({color, size}) => (
  <View style={styles.adaSignContainer}>
    <AdaIcon width={size} height={size} color={color} />
  </View>
)

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

    return (
      <TouchableOpacity onPress={this.showDetails} activeOpacity={0.5}>
        <View style={styles.container}>
          <View style={styles.meta}>
            <Text small>{formatTimeToSeconds(transaction.submittedAt)}</Text>
            {transaction.fee && (
              <Text secondary>
                {`${translations.fee} ${formatAda(transaction.fee)}`}
              </Text>
            )}
            <Text secondary>
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
                  {formatAdaFractional(transaction.amount)}
                </Text>
                <AdaSign size={16} color={amountStyle.color} />
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
