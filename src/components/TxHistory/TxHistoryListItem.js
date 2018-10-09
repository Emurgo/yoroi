// @flow

import React, {Component} from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'

import {Text, View, TouchableHighlight} from 'react-native'
import {COLORS} from '../../styles/config'

import CustomText from '../../components/CustomText'
import {confirmationsToAssuranceLevel, printAda} from '../../helpers/utils'
import AdaIcon from '../../assets/AdaIcon'

import type {HistoryTransaction} from '../../types/HistoryTransaction'
import {TX_HISTORY_ROUTES} from './TxHistoryNavigator'

import type {NavigationScreenProp, NavigationState} from 'react-navigation'
import type {SubTranslation} from '../../l10n/typeHelpers'

import styles from './styles/TxHistoryListItem.style'


const getTrans = (state) => state.trans.txHistoryScreen

type Props = {
  transaction: HistoryTransaction,
  navigation: NavigationScreenProp<NavigationState>,
  trans: SubTranslation<typeof getTrans>
}


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
    const isNegativeAmount = transaction.type === 'SENT'

    return (
      <TouchableHighlight
        activeOpacity={0.9}
        underlayColor={COLORS.LIGHT_GRAY}
        onPress={this.showDetails}
      >
        <View style={styles.container}>
          <View style={styles.row}>
            <View>
              <CustomText>{trans.transactionType[transaction.type]}</CustomText>
            </View>
            <View style={styles.amountContainer}>
              <CustomText>
                <Text style={isNegativeAmount ? styles.negativeAmount : styles.positiveAmount}>
                  {isNegativeAmount ? '-' : ''}
                  {printAda(transaction.amount)}
                </Text>
              </CustomText>
              <View style={styles.adaSignContainer}>
                <AdaIcon
                  width={13}
                  height={13}
                  color={isNegativeAmount ?
                    COLORS.NEGATIVE_AMOUNT : COLORS.POSITIVE_AMOUNT
                  }
                />
              </View>
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
  connect((state) => ({
    trans: getTrans(state),
  })),
)(TxHistoryListItem)
