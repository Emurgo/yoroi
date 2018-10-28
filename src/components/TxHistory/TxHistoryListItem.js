// @flow

import React, {Component} from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {View, TouchableHighlight} from 'react-native'

import {Text} from '../UiKit'
import {getTransactionAssurance, printAda} from '../../utils/transactions'
import AdaIcon from '../../assets/AdaIcon'
import {transactionsSelector} from '../../selectors'
import {TX_HISTORY_ROUTES} from '../../RoutesList'
import styles from './styles/TxHistoryListItem.style'
import {COLORS} from '../../styles/config'
import {withTranslation} from '../../utils/renderUtils'

import {TRANSACTION_DIRECTION} from '../../types/HistoryTransaction'

import type {NavigationScreenProp, NavigationState} from 'react-navigation'
import type {SubTranslation} from '../../l10n/typeHelpers'
import type {HistoryTransaction} from '../../types/HistoryTransaction'

const getTranslations = (state) => state.trans.txHistoryScreen

type Props = {
  transaction: HistoryTransaction,
  navigation: NavigationScreenProp<NavigationState>,
  translations: SubTranslation<typeof getTranslations>,
}

const AdaSign = ({color, size}) => (
  <View style={styles.adaSignContainer}>
    <AdaIcon width={size} height={size} color={color} />
  </View>
)

const _AssuranceLevel = ({transaction, trans}) => {
  const assuranceLevel = getTransactionAssurance(transaction)
  const CHECMKARK = '\u2714'

  return (
    <Text>
      {CHECMKARK}
      {CHECMKARK}
      {trans.assuranceLevel[assuranceLevel]}
    </Text>
  )
}

const AssuranceLevel = withTranslation(getTranslations)(_AssuranceLevel)

class TxHistoryListItem extends Component<Props> {
  constructor(props: Props) {
    super(props)

    this.showDetails = this.showDetails.bind(this)
  }

  showDetails = () => {
    const {navigation, transaction} = this.props

    navigation.navigate(TX_HISTORY_ROUTES.TX_DETAIL, {id: transaction.id})
  }

  render() {
    const {transaction, translations} = this.props

    const formattedAmount = {
      SENT: (x) => printAda(x),
      RECEIVED: (x) => printAda(x),
      SELF: (x) => '--',
      MULTI: (x) => printAda(x),
    }[transaction.direction](transaction.amount)

    const amountStyle = {
      SENT: styles.negativeAmount,
      RECEIVED: styles.positiveAmount,
      SELF: styles.neutralAmount,
      MULTI: transaction.amount.gte(0)
        ? styles.positiveAmount
        : styles.negativeAmount,
    }[transaction.direction]

    const hasAmount = [
      TRANSACTION_DIRECTION.SENT,
      TRANSACTION_DIRECTION.RECEIVED,
      TRANSACTION_DIRECTION.MULTI,
    ].includes(transaction.direction)

    const hasFee = [
      TRANSACTION_DIRECTION.SENT,
      TRANSACTION_DIRECTION.SELF,
    ].includes(transaction.direction)

    return (
      <TouchableHighlight
        activeOpacity={0.9}
        underlayColor={COLORS.LIGHT_GRAY}
        onPress={this.showDetails}
      >
        <View style={styles.container}>
          <View style={styles.metadataPanel}>
            <View>
              <Text>{transaction.timestamp.format('hh:mm:ss A')}</Text>
            </View>
            <View>
              <AssuranceLevel transaction={transaction} />
            </View>
          </View>
          <View style={styles.amountPanel}>
            <View style={styles.amountContainer}>
              <View style={styles.horizontalSpacer} />
              <Text>{translations.transactionType[transaction.direction]}</Text>
            </View>
            <View style={styles.amountContainer}>
              <View style={styles.horizontalSpacer} />
              {hasAmount ? (
                <>
                  <Text style={amountStyle}>{formattedAmount}</Text>
                  <AdaSign size={16} color={amountStyle.color} />
                </>
              ) : (
                <Text style={amountStyle}>- -</Text>
              )}
            </View>
            <View style={styles.feeContainer}>
              <View style={styles.horizontalSpacer} />
              {hasFee && (
                <Text style={styles.feeAmount}>
                  {printAda(transaction.fee)} l10n Fee
                </Text>
              )}
            </View>
          </View>
        </View>
      </TouchableHighlight>
    )
  }
}

export default compose(
  connect((state, {id}) => ({
    translations: getTranslations(state),
    transaction: transactionsSelector(state)[id],
  })),
)(TxHistoryListItem)
