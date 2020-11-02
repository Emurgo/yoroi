// @flow

import React from 'react'

import {storiesOf} from '@storybook/react-native'

import WalletInitScreen from './WalletInitScreen'
import {NETWORK_REGISTRY} from '../../config/types'

storiesOf('WalletInitScreen', module)
  .add('Shelley', ({route}) => {
    route.params = {
      networkId: NETWORK_REGISTRY.JORMUNGANDR,
    }
    return <WalletInitScreen navigation={route} />
  })
  .add('Byron', ({route}) => {
    route.params = {
      networkId: NETWORK_REGISTRY.BYRON_MAINNET,
    }
    return <WalletInitScreen navigation={route} />
  })
