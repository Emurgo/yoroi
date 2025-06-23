import {storiesOf} from '@storybook/react-native'
import {buildNetworkManagers} from '@yoroi/blockchains'
import {Chain} from '@yoroi/types'
import React from 'react'

import {logger} from '../../../../../kernel/logger/logger'
import {rootStorage} from '../../../../../kernel/storage/rootStorage'
import {mocks} from '../../../../../wallets/mocks/wallet'
import {buildPortfolioTokenManagers} from '../../../../Portfolio/common/helpers/build-token-managers'
import {WalletManagerProvider} from '../../../../WalletManager/context/WalletManagerProvider'
import {WalletManager} from '../../../../WalletManager/wallet-manager'
import {DisableEasyConfirmationScreen} from './DisableEasyConfirmationScreen'
import {EnableEasyConfirmationScreen} from './EnableEasyConfirmationScreen'

// TODO: should be mocked
const {tokenManagers} = buildPortfolioTokenManagers()
const networkManagers = buildNetworkManagers({tokenManagers, logger})
const walletManager = new WalletManager({
  rootStorage,
  networkManagers,
})

storiesOf('EasyConfirmation Screen', module)
  .add('EnableEasyConfirmation', () => (
    <WalletManagerProvider
      walletManager={walletManager}
      initialState={{
        selected: {
          network: Chain.Network.Mainnet,
          wallet: mocks.wallet,
          meta: {
            avatar: 'a',
            plate: 'b',
            isEasyConfirmationEnabled: true,
            isHW: false,
            id: '1',
            name: 'Yoroi',
            addressMode: 'single',
            implementation: 'cardano-cip1852',
            version: 3,
            isReadOnly: false,
            hwDeviceInfo: null,
          },
          networkManager: networkManagers[Chain.Network.Mainnet],
        },
      }}
    >
      <DisableEasyConfirmationScreen />
    </WalletManagerProvider>
  ))
  .add('DisableEasyConfirmation', () => (
    <WalletManagerProvider
      walletManager={walletManager}
      initialState={{
        selected: {
          network: Chain.Network.Mainnet,
          networkManager: networkManagers[Chain.Network.Mainnet],
          wallet: mocks.wallet,
          meta: {
            avatar: 'a',
            plate: 'b',
            isEasyConfirmationEnabled: false,
            isHW: false,
            id: '1',
            name: 'Yoroi',
            addressMode: 'single',
            implementation: 'cardano-cip1852',
            version: 3,
            isReadOnly: false,
            hwDeviceInfo: null,
          },
        },
      }}
    >
      <EnableEasyConfirmationScreen />
    </WalletManagerProvider>
  ))
