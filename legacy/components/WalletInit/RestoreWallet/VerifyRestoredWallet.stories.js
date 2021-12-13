// @flow

import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {CONFIG} from '../../../config/config'
import {cleanMnemonic} from '../../../utils/validators'
import VerifyRestoredWallet from './VerifyRestoredWallet'

storiesOf('VefifyRestoredWallet', module).add('Default', ({navigation}) => (
  <VerifyRestoredWallet
    navigation={navigation}
    route={{
      params: {
        networkId: CONFIG.NETWORKS.HASKELL_SHELLEY.NETWORK_ID,
        walletImplementationId: CONFIG.WALLETS.HASKELL_SHELLEY.WALLET_IMPLEMENTATION_ID,
        phrase: cleanMnemonic(CONFIG.DEBUG.MNEMONIC3),
      },
    }}
  />
))
