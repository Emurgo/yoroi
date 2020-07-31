// @flow

import React from 'react'

import {storiesOf} from '@storybook/react-native'

import WalletInitScreen from './WalletInitScreen'
import {NETWORK_REGISTRY} from '../../config/types'

storiesOf('WalletInitScreen', module)
  .add('Shelley', ({navigation}) => {
    navigation.getParam = (param) => {
      if (param === 'networkId') return NETWORK_REGISTRY.JORMUNGANDR
      return ''
    }
    return <WalletInitScreen navigation={navigation} />
  })
  .add('Byron', ({navigation}) => {
    navigation.getParam = (param) => {
      if (param === 'networkId') return NETWORK_REGISTRY.BYRON_MAINNET
      return ''
    }
    return <WalletInitScreen navigation={navigation} />
  })
