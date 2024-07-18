import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import {WalletMeta} from '@yoroi/types/lib/typescript/wallet/meta'
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
      meta={{...mocks.walletMeta, isHW: false, isEasyConfirmationEnabled: false}}
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
      meta={{...mocks.walletMeta, isHW: true, isEasyConfirmationEnabled: false}}
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
      meta={{...mocks.walletMeta, isHW: false, isEasyConfirmationEnabled: true}}
    >
      <ConfirmVotingTx pin="1234" onSuccess={action('onSuccess')} onNext={action('onNext')} />
    </Providers>
  ))

const Providers = ({wallet, children, meta}: {wallet: YoroiWallet; children: React.ReactNode; meta: WalletMeta}) => {
  walletManagerMock.setSelectedWalletId(wallet.id)
  return (
    <QueryProvider>
      <WalletManagerProviderMock wallet={wallet} meta={meta} walletManager={walletManagerMock}>
        <Boundary loading={{size: 'full'}}>{children}</Boundary>
      </WalletManagerProviderMock>
    </QueryProvider>
  )
}
