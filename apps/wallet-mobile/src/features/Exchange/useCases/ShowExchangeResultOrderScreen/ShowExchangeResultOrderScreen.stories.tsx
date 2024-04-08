import {storiesOf} from '@storybook/react-native'
import {exchangeDefaultState, ExchangeProvider, successManagerMock} from '@yoroi/exchange'
import {LinksProvider} from '@yoroi/links'
import React from 'react'

import {ModalProvider} from '../../../../components'
import {mocks as walletMocks} from '../../../../yoroi-wallets/mocks'
import {SelectedWalletProvider} from '../../../SelectedWallet/Context'
import {ShowExchangeResultOrderScreen} from './ShowExchangeResultOrderScreen'

storiesOf('Exchange ShowExchangeResultOrderScreen', module).add('with deep link data', () => <WithDeepLinkData />)

const WithDeepLinkData = () => {
  return (
    <SelectedWalletProvider wallet={{...walletMocks.wallet}}>
      <ModalProvider>
        <LinksProvider
          initialState={{
            authorizations: new Map(),
            action: {
              info: {
                version: 1,
                feature: 'exchange',
                useCase: 'order/show-create-result',
                params: {
                  coin: 'ADA',
                  coinAmount: 1,
                  fiat: 'USD',
                  fiatAmount: 1,
                  provider: 'encryptus',
                  status: 'success',
                  appId: 'a386e806-92f4-4796-ad61-7a1485b6e745',
                  authorization: 'fca6fc26-abc6-4cdc-bdce-5910cc3c0a01',
                  isSandbox: true,
                  message: 'Your order number 131234 is under processing, bare with us.',
                  redirectTo: 'https://yoroi-wallet.com/about',
                  orderType: 'buy',
                },
              },
              isTrusted: false,
            },
          }}
        >
          <ExchangeProvider
            manager={successManagerMock}
            initialState={{...exchangeDefaultState, providerId: 'encryptus'}}
          >
            <ShowExchangeResultOrderScreen />
          </ExchangeProvider>
        </LinksProvider>
      </ModalProvider>
    </SelectedWalletProvider>
  )
}
