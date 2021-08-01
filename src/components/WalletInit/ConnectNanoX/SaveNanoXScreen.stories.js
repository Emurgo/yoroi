// @flow

import React from 'react'
import {storiesOf} from '@storybook/react-native'
import {action} from '@storybook/addon-actions'

import SaveNanoXScreen from './SaveNanoXScreen'
import {CONFIG} from '../../../config/config'

storiesOf('SaveNanoXScreen', module).add('default', ({navigation}) => (
  // $FlowFixMe
  <SaveNanoXScreen
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
    navigation={navigation}
    onPress={() => action('clicked')()}
  />
))
