/**
 * @flow
 */

import React, {Component} from 'react'
import {View, Text} from 'react-native'

import {confirmationsToAssuranceLevel, printAda} from '../../helpers/utils'
import CustomText from '../../components/CustomText'
import type {NavigationScreenProp, NavigationState} from 'react-navigation'
import Screen from '../../components/Screen'
import AdaIcon from '../../assets/AdaIcon'
import stylesConfig from '../../styles/config'

import styles from './TxDetails.style'


type Props = {navigation: NavigationScreenProp<NavigationState>};
class TxDetails extends Component<Props> {
  render() {
    const transaction = this.props.navigation.state.params.transaction

    const assuranceLevel = confirmationsToAssuranceLevel(transaction.confirmations)
    const isNegativeAmount = transaction.type === 'SENT'

    return (
      <Screen scroll>
        <View style={styles.amountContainer}>
          <CustomText>
            <Text style={isNegativeAmount ? styles.negativeAmount : styles.positiveAmount}>
              {isNegativeAmount ? '-' : ''}
              {printAda(transaction.amount)}
            </Text>
          </CustomText>
          <View style={styles.adaSignContainer}>
            <AdaIcon
              width={18}
              height={18}
              color={isNegativeAmount ? stylesConfig.negativeAmountColor : stylesConfig.positiveAmountColor}
            />
          </View>
        </View>

        <View style={styles.timestampContainer}>
          <View>
            <CustomText>{`ADA ${transaction.type}`}</CustomText>
          </View>
          <View>
            <CustomText>{transaction.timestamp.format('hh:mm:ss A')}</CustomText>
          </View>
        </View>

        <View style={styles.section}>
          <CustomText>
            <Text style={styles.label}>From Addresses</Text>
          </CustomText>

          {transaction.fromAddresses.map((address) =>
            <CustomText key={address}>{address}</CustomText>
          )}
        </View>

        <View style={styles.section}>
          <CustomText>
            <Text style={styles.label}>To Addresses</Text>
          </CustomText>

          {transaction.toAddresses.map((address) =>
            <CustomText key={address}>{address}</CustomText>
          )}
        </View>

        <View style={styles.section}>
          <CustomText>
            <Text style={styles.label}>Transaction Assurance Level</Text>
          </CustomText>
          <CustomText>{`${assuranceLevel}. ${transaction.confirmations} CONFIRMATIONS`}</CustomText>
        </View>

        <View style={styles.section}>
          <CustomText>
            <Text style={styles.label}>Transaction ID</Text>
          </CustomText>
          <CustomText>{transaction.id}</CustomText>
        </View>
      </Screen>
    )
  }
}

export default TxDetails
