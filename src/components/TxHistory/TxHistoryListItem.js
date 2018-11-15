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

import {TRANSACTION_DIRECTION} from '../../types/HistoryTransaction'

import type {NavigationScreenProp, NavigationState} from 'react-navigation'
import type {SubTranslation} from '../../l10n/typeHelpers'
import type {TransactionInfo} from '../../types/HistoryTransaction'

const getTranslations = (state) => state.trans.TxHistoryListItem

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
      <TouchableOpacity onPress={this.showDetails} activeOpacity={0.5}>
        <View style={styles.container}>
          <View style={styles.meta}>
            <Text small>{formatTimeToSeconds(transaction.submittedAt)}</Text>
            {hasFee && (
              <Text secondary>
                {translations.fee(formatAda(transaction.fee))}
              </Text>
            )}
            <Text secondary>
              {translations.transactionType[transaction.direction]}
            </Text>
          </View>
          <View style={styles.row}>
            <AssuranceLevel transaction={transaction} />
            {hasAmount ? (
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
