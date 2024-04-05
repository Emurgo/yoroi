import {init} from '@emurgo/cross-csl-mobile'
import {storiesOf} from '@storybook/react-native'
import {resolverApiMaker, resolverManagerMaker, ResolverProvider, resolverStorageMaker} from '@yoroi/resolver'
import {TransferProvider} from '@yoroi/transfer'
import {Resolver} from '@yoroi/types'
import * as React from 'react'

import {QueryProvider} from '../../../../../../.storybook/decorators'
import {Boundary} from '../../../../../components'
import {YoroiWallet} from '../../../../../yoroi-wallets/cardano/types'
import {mocks as walletMocks} from '../../../../../yoroi-wallets/mocks/wallet'
import {SelectedWalletProvider} from '../../../../Wallet/common/Context'
import {NotifySupportedNameServers} from './NotifySupportedNameServers'

storiesOf('Send NotifySupportedNameServers', module).add('initial', () => <Initial />)

const Initial = () => {
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
        <TransferProvider>
          <ResolverProvider resolverManager={resolverManager}>
            <Boundary>
              <NotifySupportedNameServers />
            </Boundary>
          </ResolverProvider>
        </TransferProvider>
      </SelectedWalletProvider>
    </QueryProvider>
  )
}
