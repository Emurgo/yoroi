import {storiesOf} from '@storybook/react-native'
import {Chain} from '@yoroi/types'
import React from 'react'

import {rootStorage} from '../../../kernel/storage/rootStorage'
import {mocks} from '../../../yoroi-wallets/mocks'
import {buildPortfolioTokenManagers} from '../../Portfolio/common/helpers/build-token-managers'
import {WalletManagerProvider} from '../../WalletManager/context/WalletManagerProvider'
import {buildNetworkManagers} from '../../WalletManager/network-manager/network-manager'
import {WalletManager} from '../../WalletManager/wallet-manager'
import {DisableEasyConfirmationScreen} from './DisableEasyConfirmationScreen'
import {EnableEasyConfirmationScreen} from './EnableEasyConfirmationScreen'

// TODO: should be mocked
const {tokenManagers} = buildPortfolioTokenManagers()
const networkManagers = buildNetworkManagers({tokenManagers})
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
            implementation: 'cardano-shelley',
            version: 3,
            isReadOnly: false,
          },
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
          wallet: mocks.wallet,
          meta: {
            avatar: 'a',
            plate: 'b',
            isEasyConfirmationEnabled: false,
            isHW: false,
            id: '1',
            name: 'Yoroi',
            addressMode: 'single',
            implementation: 'cardano-shelley',
            version: 3,
            isReadOnly: false,
          },
        },
      }}
    >
      <EnableEasyConfirmationScreen />
    </WalletManagerProvider>
  ))
