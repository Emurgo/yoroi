// @flow
/* eslint-disable  */
import React from 'react'
import {BigNumber} from 'bignumber.js'
import {storiesOf} from '@storybook/react-native'

import DelegationConfirmation from './DelegationConfirmation'
import {getDefaultAssets} from '../../config/config'
import {MultiToken, getDefaultNetworkTokenEntry} from '../../crypto/MultiToken'

const defaultNetworkId = getDefaultAssets()[0].networkId

storiesOf('DelegationConfirmation', module).add('Default', ({navigation, route}) => {
  route.params = {
    poolName: 'EMURGO’ STAKEPOOL',
    poolHash: ['6777ed5eac05ab8bf55d073424132e200935c8d3be62fb00f5252cd27a9fe6e5'],
    transactionData: {
      totalAmountToDelegate: new MultiToken(
        [
          {
            amount: new BigNumber('100000000'), // 100 ADA
            identifier: '',
            networkId: defaultNetworkId,
          },
        ],
        getDefaultNetworkTokenEntry(defaultNetworkId),
      ),
    },
    transactionFee: new MultiToken(
      [
        {
          amount: new BigNumber('2000000'), // 2 ADA
          identifier: '',
          networkId: defaultNetworkId,
        },
      ],
      getDefaultNetworkTokenEntry(defaultNetworkId),
    ),
  }
  return (
    // $FlowFixMe: defaultAsset is missing in Props
    <DelegationConfirmation route={route} navigation={navigation} defaultAsset={getDefaultAssets()[0]} />
  )
})
