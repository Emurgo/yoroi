// @flow

import React from 'react'
import {storiesOf} from '@storybook/react-native'

import MnemonicCheckScreen from './MnemonicCheckScreen'
import {CONFIG} from '../../../config/config'

storiesOf('MnemonicCheckScreen', module).add('Default', ({navigation, route}) => {
  route.params = {
    mnemonic: CONFIG.DEBUG.MNEMONIC1,
    name: CONFIG.DEBUG.WALLET_NAME,
    password: CONFIG.DEBUG.PASSWORD,
    networkId: CONFIG.NETWORKS.HASKELL_SHELLEY.NETWORK_ID,
  }
  return <MnemonicCheckScreen route={route} navigation={navigation} />
})
