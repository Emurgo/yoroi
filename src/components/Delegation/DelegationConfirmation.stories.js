// @flow
/* eslint-disable max-len */
import React from 'react'
import {BigNumber} from 'bignumber.js'

import {storiesOf} from '@storybook/react-native'

import DelegationConfirmation from './DelegationConfirmation'

storiesOf('DelegationConfirmation', module).add(
  'Default',
  ({navigation, route}) => {
    route.params = {
      poolName: 'EMURGO’ STAKEPOOL',
      poolHash: [
        '6777ed5eac05ab8bf55d073424132e200935c8d3be62fb00f5252cd27a9fe6e5',
      ],
      transactionData: {
        totalAmountToDelegate: new BigNumber('100000000'), // 100 ADA
      },
      transactionFee: new BigNumber('2000000'), // 2 ADA
    }
    return <DelegationConfirmation route={route} navigation={navigation} />
  },
)
