/* eslint-disable no-use-before-define */
// @flow

import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import {BigNumber} from 'bignumber.js'
import React from 'react'

import type {TokenEntry} from '../../../crypto/MultiToken'
import {type Token} from '../../../types/HistoryTransaction'
import AssetSelectorScreen from './AssetSelectorScreen'

storiesOf('AssetSelectorScreen', module).add('Default', () => {
  return (
    <AssetSelectorScreen
      assetTokens={assetTokens}
      assetTokenInfos={assetTokenInfos}
      onSelect={action('onSelect')}
      onSelectAll={action('onSelectAll')}
    />
  )
})

const assetTokens: Array<TokenEntry> = [
  {
    networkId: 123,
    identifier: 'policyId123assetName123',
    amount: new BigNumber(12344.00234523),
  },
  {
    networkId: 456,
    identifier: 'policyId456assetName456',
    amount: new BigNumber(10),
  },
  {
    networkId: 789,
    identifier: 'policyId789assetName789',
    amount: new BigNumber(0.00001),
  },
  {
    networkId: 111,
    identifier: 'policyId111assetName111',
    amount: new BigNumber(0.00001),
  },
  {
    networkId: 222,
    identifier: 'policyId222assetName222',
    amount: new BigNumber(0.00001),
  },
  {
    networkId: 333,
    identifier: 'policyId333assetName333',
    amount: new BigNumber(0.00001),
  },
  {
    networkId: 444,
    identifier: 'policyId444assetName444',
    amount: new BigNumber(0.00001),
  },
  {
    networkId: 555,
    identifier: 'policyId555assetName555',
    amount: new BigNumber(0.00001),
  },
]
const assetTokenInfos: Dict<Token> = {
  policyId123assetName123: {
    networkId: 123,
    isDefault: false,
    identifier: 'policyId123assetName123',
    metadata: {
      assetName: 'assetName123',
      longName: 'longName123',
      maxSupply: 'maxSupply123',
      numberOfDecimals: 10,
      policyId: 'policyId1233',
      ticker: 'ticker123',
      type: 'Cardano',
    },
  },
  policyId456assetName456: {
    networkId: 456,
    isDefault: true,
    identifier: 'policyId456assetName456',
    metadata: {
      assetName: 'assetName456',
      longName: 'longName456',
      maxSupply: 'maxSupply456',
      numberOfDecimals: 10,
      policyId: 'policyId4566',
      ticker: 'ticker456',
      type: 'Cardano',
    },
  },
  policyId789assetName789: {
    networkId: 789,
    isDefault: false,
    identifier: 'policyId789assetName789',
    metadata: {
      assetName: 'assetName789',
      longName: 'longName789',
      maxSupply: 'maxSupply789',
      numberOfDecimals: 10,
      policyId: 'policyId7899',
      ticker: 'ticker789',
      type: 'Cardano',
    },
  },
  policyId111assetName111: {
    networkId: 111,
    isDefault: false,
    identifier: 'policyId111assetName111',
    metadata: {
      assetName: 'assetName111',
      longName: 'longName111',
      maxSupply: 'maxSupply111',
      numberOfDecimals: 10,
      policyId: 'policyId1119',
      ticker: 'ticker111',
      type: 'Cardano',
    },
  },
  policyId222assetName222: {
    networkId: 222,
    isDefault: false,
    identifier: 'policyId222assetName222',
    metadata: {
      assetName: 'assetName222',
      longName: 'longName222',
      maxSupply: 'maxSupply222',
      numberOfDecimals: 10,
      policyId: 'policyId2229',
      ticker: 'ticker222',
      type: 'Cardano',
    },
  },
  policyId333assetName333: {
    networkId: 333,
    isDefault: false,
    identifier: 'policyId333assetName333',
    metadata: {
      assetName: 'assetName333',
      longName: 'longName333',
      maxSupply: 'maxSupply333',
      numberOfDecimals: 10,
      policyId: 'policyId3339',
      ticker: 'ticker333',
      type: 'Cardano',
    },
  },
  policyId444assetName444: {
    networkId: 444,
    isDefault: false,
    identifier: 'policyId444assetName444',
    metadata: {
      assetName: 'assetName444',
      longName: 'longName444',
      maxSupply: 'maxSupply444',
      numberOfDecimals: 10,
      policyId: 'policyId4449',
      ticker: 'ticker444',
      type: 'Cardano',
    },
  },
  policyId555assetName555: {
    networkId: 555,
    isDefault: false,
    identifier: 'policyId555assetName555',
    metadata: {
      assetName: 'assetName555',
      longName: 'longName555',
      maxSupply: 'maxSupply555',
      numberOfDecimals: 10,
      policyId: 'policyId5559',
      ticker: 'ticker555',
      type: 'Cardano',
    },
  },
}
