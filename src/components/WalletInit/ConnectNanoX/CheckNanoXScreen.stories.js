// @flow

import React from 'react'
import {storiesOf} from '@storybook/react-native'
import {action} from '@storybook/addon-actions'

import CheckNanoXScreen from './CheckNanoXScreen'
import {CONFIG} from '../../../config/config'

storiesOf('CheckNanoXScreen', module).add('default', ({navigation}) => (
  <CheckNanoXScreen
    navigation={navigation}
    route={{
      params: {
        networkId: CONFIG.NETWORKS.HASKELL_SHELLEY.NETWORK_ID,
        walletImplementationId: CONFIG.WALLETS.HASKELL_SHELLEY.WALLET_IMPLEMENTATION_ID,
        hwDeviceInfo: {
          bip44AccountPublic: '0x1',
          hwFeatures: {
            deviceId: '0x1',
          },
        },
      },
    }}
    onPress={(_e) => action('clicked')}
  />
))
