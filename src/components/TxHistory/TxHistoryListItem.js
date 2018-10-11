// @flow

import React, {Component} from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'

import {Text, View, TouchableHighlight} from 'react-native'
import {COLORS} from '../../styles/config'

import CustomText from '../../components/CustomText'
import {confirmationsToAssuranceLevel, printAda} from '../../utils/transactions'
import AdaIcon from '../../assets/AdaIcon'

import {transactionsSelector} from '../../selectors'

import type {HistoryTransaction} from '../../types/HistoryTransaction'
import {TX_HISTORY_ROUTES} from '../../RoutesList'

import type {NavigationScreenProp, NavigationState} from 'react-navigation'
import type {SubTranslation} from '../../l10n/typeHelpers'

import styles from './styles/TxHistoryListItem.style'


const getTrans = (state) => state.trans.txHistoryScreen

type Props = {
  transaction: HistoryTransaction,
  navigation: NavigationScreenProp<NavigationState>,
  trans: SubTranslation<typeof getTrans>
}


const AdaSign = ({color, size}) => (
  <View style={styles.adaSignContainer}>
    <AdaIcon
      width={size}
      height={size}
      color={color}
    />
  </View>
)

class TxHistoryListItem extends Component<Props> {
  constructor(props: Props) {
    super(props)

    this.showDetails = this.showDetails.bind(this)
  }

  showDetails = () => {
    const {navigation, transaction} = this.props

    navigation.navigate(TX_HISTORY_ROUTES.TX_DETAIL, {transaction})
  }

  render() {
    const {transaction, trans} = this.props

    const assuranceLevel = confirmationsToAssuranceLevel(transaction.confirmations)
    const isNegativeAmount = transaction.direction === 'SENT'

    const formattedAmount = {
      SENT: (x) => `- ${printAda(x)}`,
      RECEIVED: (x) => printAda(x),
      SELF: (x) => '--',
    }[transaction.direction](transaction.amount)

    const amountStyle = {
      SENT: styles.negativeAmount,
      RECEIVED: styles.positiveAmount,
      SELF: {},
    }[transaction.direction]

    return (
      <TouchableHighlight
        activeOpacity={0.9}
        underlayColor={COLORS.LIGHT_GRAY}
        onPress={this.showDetails}
      >
        <View style={styles.container}>
          <View style={styles.row}>
            <View>
              <CustomText>{trans.transactionType[transaction.direction]}</CustomText>
            </View>
            <View style={styles.amountContainer}>
              <CustomText>
                <Text style={amountStyle}>
                  {formattedAmount}
                </Text>
              </CustomText>
              <AdaSign
                size={13}
                color={isNegativeAmount ?
                  COLORS.NEGATIVE_AMOUNT : COLORS.POSITIVE_AMOUNT
                }
              />
            </View>
            <View>
              <CustomText>
                Fee: {printAda(transaction.fee)}
              </CustomText>
            </View>
          </View>

          <View style={styles.row}>
            <View>
              <CustomText>{transaction.timestamp.format('hh:mm:ss A')}</CustomText>
            </View>
            <View>
              <CustomText>
                {trans.assuranceLevelHeader}
                {trans.assuranceLevel[assuranceLevel]}
              </CustomText>
            </View>
          </View>
        </View>
      </TouchableHighlight>
    )
  }
}

export default compose(
  connect((state, {id}) => ({
    trans: getTrans(state),
    transaction: transactionsSelector(state)[id],
  })),
)(TxHistoryListItem)
