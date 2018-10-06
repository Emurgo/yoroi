// @flow

import React, {Component} from 'react'
import {Text, View, TouchableHighlight} from 'react-native'
import stylesConfig from '../../styles/config'

import CustomText from '../../components/CustomText'
import {confirmationsToAssuranceLevel, printAda} from '../../helpers/utils'
import AdaIcon from '../../assets/AdaIcon'

import type {HistoryTransaction} from '../../types/HistoryTransaction'
import type {NavigationScreenProp, NavigationState} from 'react-navigation'

import styles from './TxHistoryListItem.style'

type Props = {transaction: HistoryTransaction, navigation: NavigationScreenProp<NavigationState>};
class TxHistoryListItem extends Component<Props> {
  constructor(props: Props) {
    super(props)

    this.showDetails = this.showDetails.bind(this)
  }

  showDetails = () => {
    const {navigation, transaction} = this.props

    navigation.navigate('tx_details', {transaction})
  }

  render() {
    const {transaction} = this.props

    const assuranceLevel = confirmationsToAssuranceLevel(transaction.confirmations)
    const isNegativeAmount = transaction.type === 'SENT'

    return (
      <TouchableHighlight
        activeOpacity={0.9}
        underlayColor="#eee"
        onPress={this.showDetails}
      >
        <View style={styles.container}>
          <View style={styles.row}>
            <View>
              <CustomText>{`ADA ${transaction.type}`}</CustomText>
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
                    stylesConfig.negativeAmountColor : stylesConfig.positiveAmountColor
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
              <CustomText>ASSURANCE LEVEL: {assuranceLevel}</CustomText>
            </View>
          </View>
        </View>
      </TouchableHighlight>
    )
  }
}

export default TxHistoryListItem
