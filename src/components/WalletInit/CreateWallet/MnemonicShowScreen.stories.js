// @flow
import React from 'react'
import {storiesOf} from '@storybook/react-native'

import MnemonicShowScreen from './MnemonicShowScreen'
import {CONFIG} from '../../../config/config'

storiesOf('MnemonicShowScreen', module).add(
  'Default',
  ({route, navigation}) => {
    route.params = {
      mnemonic: CONFIG.DEBUG.MNEMONIC1,
      name: CONFIG.DEBUG.WALLET_NAME,
      password: CONFIG.DEBUG.PASSWORD,
      networkId: CONFIG.NETWORKS.HASKELL_SHELLEY.NETWORK_ID,
    }
    return <MnemonicShowScreen route={route} navigation={navigation} />
  },
)
