// @flow

import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'

import {View, Text} from 'react-native'

import {printAda} from '../../helpers/utils'
import CustomText from '../../components/CustomText'
import type {NavigationScreenProp, NavigationState} from 'react-navigation'
import Screen from '../../components/Screen'
import AdaIcon from '../../assets/AdaIcon'
import {COLORS} from '../../styles/config'

import styles from './TxDetails.style'

import type {SubTranslation} from '../../l10n/typeHelpers'


const Label = ({children}) => (
  <CustomText>
    <Text style={styles.label}>{children}</Text>
  </CustomText>
)

const AdaAmount = ({amount, type}) => {
  const isNegativeAmount = type === 'SENT'
  return (
    <View style={styles.amountContainer}>
      <CustomText>
        <Text style={isNegativeAmount ? styles.negativeAmount : styles.positiveAmount}>
          {isNegativeAmount ? '-' : ''}
          {printAda(amount)}
        </Text>
      </CustomText>
      <View style={styles.adaSignContainer}>
        <AdaIcon
          width={18}
          height={18}
          color={isNegativeAmount ? COLORS.NEGATIVE_AMOUNT : COLORS.POSITIVE_AMOUNT}
        />
      </View>
    </View>
  )
}

const getTrans = (state) => state.trans.txHistoryScreen.transactionDetails

type Props = {
  navigation: NavigationScreenProp<NavigationState>,
  trans: SubTranslation<typeof getTrans>,
};

const TxDetails = ({navigation, trans}: Props) => {
  const transaction = navigation.getParam('transaction', {})

  return (
    <Screen scroll>
      <AdaAmount
        amount={transaction.amount}
        type={transaction.type}
      />

      <View style={styles.timestampContainer}>
        <View>
          <CustomText>{trans.transactionHeader[transaction.type]}</CustomText>
        </View>
        <View>
          <CustomText>i18n {transaction.timestamp.format('YYYY hh:mm:ss A')}</CustomText>
        </View>
      </View>

      <View style={styles.section}>
        <Label>{trans.fromAddresses}</Label>

        {transaction.fromAddresses.map((address) =>
          <CustomText key={address}>{address}</CustomText>
        )}
      </View>

      <View style={styles.section}>
        <Label>{trans.toAddresses}</Label>

        {transaction.toAddresses.map((address) =>
          <CustomText key={address}>{address}</CustomText>
        )}
      </View>

      <View style={styles.section}>
        <Label>{trans.txAssuranceLevel}</Label>
        <CustomText>
          i18n {transaction.confirmations} CONFIRMATIONS
        </CustomText>
      </View>

      <View style={styles.section}>
        <Label>{trans.transactionId}</Label>
        <CustomText>{transaction.id}</CustomText>
      </View>
    </Screen>
  )
}

export default compose(
  connect((state) => ({
    trans: getTrans(state),
  })),
)(TxDetails)
