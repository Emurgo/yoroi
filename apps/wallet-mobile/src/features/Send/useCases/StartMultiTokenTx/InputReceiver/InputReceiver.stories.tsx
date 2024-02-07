import {init} from '@emurgo/cross-csl-mobile'
import {storiesOf} from '@storybook/react-native'
import {resolverApiMaker, resolverManagerMaker, ResolverProvider, resolverStorageMaker} from '@yoroi/resolver'
import {Resolver} from '@yoroi/types'
import * as React from 'react'

import {QueryProvider} from '../../../../../../.storybook/decorators'
import {Boundary} from '../../../../../components'
import {SelectedWalletProvider} from '../../../../../SelectedWallet'
import {YoroiWallet} from '../../../../../yoroi-wallets/cardano/types'
import {mocks as walletMocks} from '../../../../../yoroi-wallets/mocks/wallet'
import {SendProvider} from '../../../common/SendContext'
import {InputReceiver} from './InputReceiver'

storiesOf('Send InputReceiver', module)
  .addDecorator((story) => {
    const wallet: YoroiWallet = walletMocks.wallet
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
      <QueryProvider>
        <SelectedWalletProvider wallet={wallet}>
          <SendProvider>
            <ResolverProvider resolverManager={resolverManager}>
              <Boundary>{story()}</Boundary>
            </ResolverProvider>
          </SendProvider>
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
  .add('loading', () => <InputReceiver isLoading isValid />)
  .add('valid', () => <InputReceiver isLoading={false} isValid />)
  .add('invalid', () => <InputReceiver isLoading={false} isValid={false} />)
