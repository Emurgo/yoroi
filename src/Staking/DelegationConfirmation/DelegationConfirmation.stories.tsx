import {storiesOf} from '@storybook/react-native'
import {BigNumber} from 'bignumber.js'
import React from 'react'

import {RouteProvider} from '../../../storybook'
import {getDefaultAssets} from '../../legacy/config'
import {getDefaultNetworkTokenEntry, MultiToken} from '../../yoroi-wallets'
import {DelegationConfirmation} from './DelegationConfirmation'

const defaultNetworkId = getDefaultAssets()[0].networkId

storiesOf('DelegationConfirmation', module).add('Default', () => {
  return (
    <RouteProvider
      params={{
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
      }}
    >
      <DelegationConfirmation mockDefaultAsset={getDefaultAssets()[0]} />
    </RouteProvider>
  )
})
