/* import {init} from '@emurgo/cross-csl-mobile'
import {storiesOf} from '@storybook/react-native'
import {resolverApiMaker, resolverManagerMaker, ResolverProvider, resolverStorageMaker} from '@yoroi/resolver'
import {Resolver} from '@yoroi/types'
import * as React from 'react'

import {QueryProvider} from '../../../../../../.storybook/decorators'
import {Boundary} from '../../../../../components'
import {SelectedWalletProvider} from '../../../../../SelectedWallet'
import {YoroiWallet} from '../../../../../yoroi-wallets/cardano/types'
import {mocks as walletMocks} from '../../../../../yoroi-wallets/mocks/wallet'
import {initialState, SendProvider, SendState} from '../../../common/SendContext'
import {ShowResolvedAddressSelected} from './ShowResolvedAddressSelected'

storiesOf('Send ShowResolvedAddressSelected', module)
  .addDecorator((story) => {
    const wallet: YoroiWallet = walletMocks.wallet

    return (
      <QueryProvider>
        <SelectedWalletProvider wallet={wallet}>{story()}</SelectedWalletProvider>
      </QueryProvider>
    )
  })
  .add('handle', () => <Wrapper ns={handle} />)
  .add('cns', () => <Wrapper ns={cns} />)
  .add('unstoppable', () => <Wrapper ns={unstoppable} />)

const Wrapper = ({ns}: {ns: Partial<SendState>}) => {
  const resolverApi = resolverApiMaker({
    apiConfig: {
      [Resolver.NameServer.Unstoppable]: {
        apiKey: 'apiKey',
      },
    },
    cslFactory: init,
  })
  const resolverStorage = resolverStorageMaker()
  const resolverManager = resolverManagerMaker(resolverStorage, resolverApi)

  return (
    <SendProvider initialState={ns}>
      <ResolverProvider resolverManager={resolverManager}>
        <Boundary>
          <ShowResolvedAddressSelected />
        </Boundary>
      </ResolverProvider>
    </SendProvider>
  )
}

const handle: SendState = {
  ...initialState,
  targets: [
    {
      entry: {address: 'addr1vxggvx6uq9mtf6e0tyda2mahg84w8azngpvkwr5808ey6qsy2ww7d', amounts: {'': '1000000'}},
      receiver: {
        as: 'domain',
        resolve: '$stackchain',
        selectedNameServer: Resolver.NameServer.Handle,
        addressRecords: {
          handle: 'addr1vxggvx6uq9mtf6e0tyda2mahg84w8azngpvkwr5808ey6qsy2ww7d',
          cns: 'addr1qywgh46dqu7lq6mp5c6tzldpmzj6uwx335ydrpq8k7rru4q6yhkfqn5pc9f3z76e4cr64e5mf98aaeht6zwf8xl2nc9qr66sqg',
          unstoppable:
            'addr1qywgh46dqu7lq6mp5c6tzldpmzj6uwx335ydrpq8k7rru4q6yhkfqn5pc9f3z76e4cr64e5mf98aaeht6zwf8xl2nc9qr66sqg',
        },
      },
    },
  ],
}
const cns: SendState = {
  ...initialState,
  targets: [
    {
      entry: {
        address:
          'addr1qywgh46dqu7lq6mp5c6tzldpmzj6uwx335ydrpq8k7rru4q6yhkfqn5pc9f3z76e4cr64e5mf98aaeht6zwf8xl2nc9qr66sqg',
        amounts: {'': '1000000'},
      },
      receiver: {
        as: 'domain',
        resolve: '$stackchain',
        selectedNameServer: Resolver.NameServer.Cns,
        addressRecords: {
          handle: 'addr1vxggvx6uq9mtf6e0tyda2mahg84w8azngpvkwr5808ey6qsy2ww7d',
          cns: 'addr1qywgh46dqu7lq6mp5c6tzldpmzj6uwx335ydrpq8k7rru4q6yhkfqn5pc9f3z76e4cr64e5mf98aaeht6zwf8xl2nc9qr66sqg',
          unstoppable:
            'addr1qywgh46dqu7lq6mp5c6tzldpmzj6uwx335ydrpq8k7rru4q6yhkfqn5pc9f3z76e4cr64e5mf98aaeht6zwf8xl2nc9qr66sqg',
        },
      },
    },
  ],
}
const unstoppable: SendState = {
  ...initialState,
  targets: [
    {
      entry: {
        address:
          'addr1qywgh46dqu7lq6mp5c6tzldpmzj6uwx335ydrpq8k7rru4q6yhkfqn5pc9f3z76e4cr64e5mf98aaeht6zwf8xl2nc9qr66sqg',
        amounts: {'': '1000000'},
      },
      receiver: {
        as: 'domain',
        resolve: '$stackchain',
        selectedNameServer: Resolver.NameServer.Unstoppable,
        addressRecords: {
          handle: 'addr1vxggvx6uq9mtf6e0tyda2mahg84w8azngpvkwr5808ey6qsy2ww7d',
          cns: 'addr1qywgh46dqu7lq6mp5c6tzldpmzj6uwx335ydrpq8k7rru4q6yhkfqn5pc9f3z76e4cr64e5mf98aaeht6zwf8xl2nc9qr66sqg',
          unstoppable:
            'addr1qywgh46dqu7lq6mp5c6tzldpmzj6uwx335ydrpq8k7rru4q6yhkfqn5pc9f3z76e4cr64e5mf98aaeht6zwf8xl2nc9qr66sqg',
        },
      },
    },
  ],
}
 */
