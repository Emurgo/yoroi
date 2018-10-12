// @flow

import React, {Component} from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {View, TouchableHighlight} from 'react-native'

import CustomText from '../../components/CustomText'
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

const _AssuranceLevel = ({transaction, trans}) => {
  const assuranceLevel = getTransactionAssurance(transaction)
  const CHECMKARK = '\u2714'


  return (
    <CustomText>
      {CHECMKARK}{CHECMKARK}
      {trans.assuranceLevel[assuranceLevel]}
    </CustomText>
  )
}

const AssuranceLevel = withTranslation(getTrans)(_AssuranceLevel)

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

    const formattedAmount = {
      SENT: (x) => `- ${printAda(x)}`,
      RECEIVED: (x) => printAda(x),
      SELF: (x) => '--',
    }[transaction.direction](transaction.amount)

    const amountStyle = {
      SENT: styles.negativeAmount,
      RECEIVED: styles.positiveAmount,
      SELF: styles.neutralAmount,
    }[transaction.direction]

    return (
      <TouchableHighlight
        activeOpacity={0.9}
        underlayColor={COLORS.LIGHT_GRAY}
        onPress={this.showDetails}
      >
        <View style={styles.container}>
          <View style={styles.metadataPanel}>
            <View>
              <CustomText>{transaction.timestamp.format('hh:mm:ss A')}</CustomText>
            </View>
            <View>
              <AssuranceLevel transaction={transaction} />
            </View>
          </View>
          <View style={styles.amountPanel}>
            <View style={styles.amountContainer}>
              <View style={styles.horizontalSpacer} />
              <CustomText>
                {trans.transactionType[transaction.direction]}
              </CustomText>
            </View>
            <View style={styles.amountContainer}>
              <View style={styles.horizontalSpacer} />
              {transaction.direction !== TRANSACTION_DIRECTION.SELF ? (
               <>
                 <CustomText style={amountStyle}>
                   {formattedAmount}
                 </CustomText>
                 <AdaSign
                   size={16}
                   color={amountStyle.color}
                 />
              </>
              ) : (
                <CustomText style={amountStyle}>
                  - -
                </CustomText>
              )}
            </View>
            <View style={styles.feeContainer}>
              <View style={styles.horizontalSpacer} />
              {transaction.direction !== TRANSACTION_DIRECTION.RECEIVED && (
                <CustomText style={styles.feeAmount}>
                  {printAda(transaction.fee)} l10n Fee
                </CustomText>
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
    trans: getTrans(state),
    transaction: transactionsSelector(state)[id],
  })),
)(TxHistoryListItem)
