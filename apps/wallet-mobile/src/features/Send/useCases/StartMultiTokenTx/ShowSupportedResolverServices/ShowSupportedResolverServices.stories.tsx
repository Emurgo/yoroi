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
import {ShowSupportedResolverServices} from './ShowSupportedResolverServices'

storiesOf('Send ShowSupportedResolverServices', module).add('initial', () => <Initial />)

const Initial = () => {
  const wallet: YoroiWallet = walletMocks.wallet
  const resolverApi = resolverApiMaker({
    apiConfig: {
      [Resolver.Service.Unstoppable]: {
        apiKey: 'apiKey',
      },
    },
  })
  const resolverStorage = resolverStorageMaker()
  const resolverModule = resolverManagerMaker(resolverStorage, resolverApi)

  return (
    <QueryProvider>
      <SelectedWalletProvider wallet={wallet}>
        <SendProvider>
          <ResolverProvider resolverModule={resolverModule}>
            <Boundary>
              <ShowSupportedResolverServices />
            </Boundary>
          </ResolverProvider>
        </SendProvider>
      </SelectedWalletProvider>
    </QueryProvider>
  )
}
