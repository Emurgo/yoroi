import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {QueryProvider} from '../../../../../.storybook/decorators'
import {Boundary} from '../../../../components'
import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {mocks} from '../../../../yoroi-wallets/mocks'
import {walletManagerMock, WalletManagerProviderMock} from '../../../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {ConfirmVotingTx} from './ConfirmVotingTx'

storiesOf('Catalyst ConfirmVotingTx', module)
  .add('password', () => (
    <Providers
      wallet={{
        ...mocks.wallet,
        createVotingRegTx: mocks.createVotingRegTx.success,
        encryptedStorage: mocks.encryptedStorage,
      }}
    >
      <ConfirmVotingTx pin="1234" onSuccess={action('onSuccess')} onNext={action('onNext')} />
    </Providers>
  ))

  .add('hw', () => (
    <Providers
      wallet={{
        ...mocks.wallet,
        createVotingRegTx: mocks.createVotingRegTx.success,
      }}
    >
      <ConfirmVotingTx pin="1234" onSuccess={action('onSuccess')} onNext={action('onNext')} />
    </Providers>
  ))

  .add('os', () => (
    <Providers
      wallet={{
        ...mocks.wallet,
        createVotingRegTx: mocks.createVotingRegTx.success,
      }}
    >
      <ConfirmVotingTx pin="1234" onSuccess={action('onSuccess')} onNext={action('onNext')} />
    </Providers>
  ))

const Providers = ({wallet, children}: {wallet: YoroiWallet; children: React.ReactNode}) => {
  walletManagerMock.setSelectedWalletId(wallet.id)
  return (
    <QueryProvider>
      <WalletManagerProviderMock wallet={wallet} walletManager={walletManagerMock}>
        <Boundary loading={{size: 'full'}}>{children}</Boundary>
      </WalletManagerProviderMock>
    </QueryProvider>
  )
}
