// @flow
/* eslint-disable max-len */
import React from 'react'
import {BigNumber} from 'bignumber.js'

import {storiesOf} from '@storybook/react-native'

import DelegationConfirmation from './DelegationConfirmation'

const transactionData = {
  totalAmountToDelegate: new BigNumber('100000000'), // 100 ADA
}

storiesOf('DelegationConfirmation', module).add('Default', ({navigation}) => {
  navigation.getParam = (param) => {
    switch (param) {
      case 'poolName':
        return 'EMURGO’ STAKEPOOL'
      case 'poolHash':
        return [
          '6777ed5eac05ab8bf55d073424132e200935c8d3be62fb00f5252cd27a9fe6e5',
        ]
      case 'amountToDelegate':
        return new BigNumber('100000000') // 100 ADA
      case 'transactionFee':
        return new BigNumber('2000000') // 2 ADA
      case 'transactionData':
        return transactionData
      default:
        return ''
    }
  }
  return <DelegationConfirmation navigation={navigation} />
})
