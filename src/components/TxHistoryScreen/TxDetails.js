// @flow

import React from 'react'
import {View, Text} from 'react-native'

import {confirmationsToAssuranceLevel, printAda} from '../../helpers/utils'
import CustomText from '../../components/CustomText'
import type {NavigationScreenProp, NavigationState} from 'react-navigation'
import Screen from '../../components/Screen'
import AdaIcon from '../../assets/AdaIcon'
import {COLORS} from '../../styles/config'

import styles from './TxDetails.style'


type Props = {navigation: NavigationScreenProp<NavigationState>};
const TxDetails = ({navigation}: Props) => {
  const transaction = navigation.getParam('transaction', {})

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
            color={isNegativeAmount ?
              COLORS.NEGATIVE_AMOUNT : COLORS.POSITIVE_AMOUNT
            }
          />
        </View>
      </View>

      <View style={styles.timestampContainer}>
        <View>
          <CustomText>{`i18nADA ${transaction.type}`}</CustomText>
        </View>
        <View>
          <CustomText>i18n{transaction.timestamp.format('YYYY hh:mm:ss A')}</CustomText>
        </View>
      </View>

      <View style={styles.section}>
        <CustomText>
          <Text style={styles.label}>i18nFrom Addresses</Text>
        </CustomText>

        {transaction.fromAddresses.map((address) =>
          <CustomText key={address}>{address}</CustomText>
        )}
      </View>

      <View style={styles.section}>
        <CustomText>
          <Text style={styles.label}>i18nTo Addresses</Text>
        </CustomText>

        {transaction.toAddresses.map((address) =>
          <CustomText key={address}>{address}</CustomText>
        )}
      </View>

      <View style={styles.section}>
        <CustomText>
          <Text style={styles.label}>i18nTransaction Assurance Level</Text>
        </CustomText>
        <CustomText>
          {`i18n${assuranceLevel}. ${transaction.confirmations} CONFIRMATIONS`}
        </CustomText>
      </View>

      <View style={styles.section}>
        <CustomText>
          <Text style={styles.label}>i18nTransaction ID</Text>
        </CustomText>
        <CustomText>{transaction.id}</CustomText>
      </View>
    </Screen>
  )
}

export default TxDetails
