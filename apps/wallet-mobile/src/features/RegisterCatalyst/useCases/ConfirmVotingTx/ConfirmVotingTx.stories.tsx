import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import {Catalyst, CatalystProvider} from '@yoroi/staking'
import {catalystConfig} from '@yoroi/staking/src/catalyst/config'
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
      <ConfirmVotingTx />
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
      <ConfirmVotingTx />
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
      <ConfirmVotingTx />
    </Providers>
  ))

const Providers = ({wallet, children, meta}: {wallet: YoroiWallet; children: React.ReactNode; meta: WalletMeta}) => {
  walletManagerMock.setSelectedWalletId(wallet.id)

  const manager: Catalyst.Manager = {
    config: catalystConfig,
    getFundInfo: action('getFundInfo') as Catalyst.Manager['getFundInfo'],
    fundStatus: action('fundStatus') as Catalyst.Manager['fundStatus'],
  }
  return (
    <QueryProvider>
      <WalletManagerProviderMock wallet={wallet} meta={meta} walletManager={walletManagerMock}>
        <Boundary loading={{size: 'full'}}>
          <CatalystProvider manager={manager} initialState={{pin: '1234'}}>
            {children}
          </CatalystProvider>
        </Boundary>
      </WalletManagerProviderMock>
    </QueryProvider>
  )
}
