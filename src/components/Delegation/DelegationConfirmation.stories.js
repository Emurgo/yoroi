// @flow

import {NavigationRouteContext} from '@react-navigation/native'
import {storiesOf} from '@storybook/react-native'
import {BigNumber} from 'bignumber.js'
import React from 'react'

import {getDefaultAssets} from '../../config/config'
import {getDefaultNetworkTokenEntry, MultiToken} from '../../crypto/MultiToken'
import DelegationConfirmation from './DelegationConfirmation'

const defaultNetworkId = getDefaultAssets()[0].networkId

storiesOf('DelegationConfirmation', module).add('Default', ({navigation}) => {
  const route = {
    key: 'key',
    name: 'name',
    params: {
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
    },
  }

  return (
    <NavigationRouteContext.Provider value={route}>
      {/* $FlowFixMe: defaultAsset is missing in Props */}
      <DelegationConfirmation navigation={navigation} defaultAsset={getDefaultAssets()[0]} />
    </NavigationRouteContext.Provider>
  )
})
