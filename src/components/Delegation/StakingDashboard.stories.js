// @flow
/* eslint-disable max-len */
import React from 'react'
import {BigNumber} from 'bignumber.js'

import {storiesOf} from '@storybook/react-native'

import StakingDashboard from './StakingDashboard'

const poolInfo = {
  info: {
    ticker: 'EMUR1',
    name: 'Emurgo #1',
    description:
      'EMURGO is a multinational blockchain technology company providing solutions for developers, startups, enterprises, and governments.',
    homepage: 'https://emurgo.io',
  },
  history: [
    {
      epoch: 6,
      slot: 36343,
      tx_ordinal: 0,
      cert_ordinal: 0,
      payload: {
        payloadKind: 'PoolRegistration',
        payloadKindId: 2,
        payloadHex:
          '0000000000000000000000000000000000000000000000000000000000000001c25187699ae107c9527bc7300d23eb39e3093eb8c85086244caed2d7f3baac5a11becc4a3de489336cbf3da0253e6da176f5bf6294fd8ba6e33a744d084dfbab016eab602ca57a3c92a8d2074170ba2aed43b30f9f14f9074def24330e30bc874d00000000000bd86110000000000000000e00000000000000640004c01b50ace23f00',
      },
    },
  ],
  owners: {
    '6eab602ca57a3c92a8d2074170ba2aed43b30f9f14f9074def24330e30bc874d': {
      pledgeAddress:
        'addr1s4h2kcpv54arey4g6gr5zu969tk58vc0nu20jp6daujrxr3shjr56mq8vq9',
    },
  },
}

storiesOf('StakingDashboard', module).add('Default', ({navigation}) => (
  <StakingDashboard
    navigation={navigation}
    isOnline
    lastAccountStateSyncError={false}
    pools={[
      ['6777ed5eac05ab8bf55d073424132e200935c8d3be62fb00f5252cd27a9fe6e5', 1],
    ]}
    poolInfo={poolInfo}
    utxoBalance={new BigNumber(100000000)}
    accountBalance={new BigNumber(1000000)}
    totalDelegated={new BigNumber(100000000).plus(1000000)}
  />
))
