import {NavigationRouteContext, RouteProp} from '@react-navigation/native'
import {actions} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import {produce} from 'immer'
import React from 'react'

import {ModalProvider} from '../../../../components'
import {SelectedWalletProvider} from '../../../../SelectedWallet'
import {mocks as walletMocks} from '../../../../yoroi-wallets/mocks'
import {ExchangeProvider} from '../../common/ExchangeProvider'
import {mockExchangeStateDefault} from '../../common/mocks'
import {ExchangeInitRoutes} from '../../common/useNavigateTo'
import {ShowExchangeResultOrder} from './ShowExchangeResultOrder'

storiesOf('Exchange ShowExchangeResultOrder', module) //
  .add('no params', () => <Init />)
  .add('no info', () => <ShowExchangeResultOrder onClose={() => actions('onClose')} />)
  .add('with params', () => <WithParams />)

const Init = () => {
  const initialState = produce(mockExchangeStateDefault, (draft) => {
    draft.orderType = 'buy'
  })
  return (
    <SelectedWalletProvider wallet={{...walletMocks.wallet}}>
      <ModalProvider>
        <ExchangeProvider initialState={initialState}>
          <ShowExchangeResultOrder onClose={() => actions('onClose')} />
        </ExchangeProvider>
      </ModalProvider>
    </SelectedWalletProvider>
  )
}

const WithParams = () => {
  const params: RouteProp<ExchangeInitRoutes, 'exchange'>['params'] = {
    coin: 'ADA',
    coinAmount: 100,
    fiat: 990,
    fiatAmount: 199,
    status: 'success',
  }
  const initialState = produce(mockExchangeStateDefault, (draft) => {
    draft.orderType = 'buy'
  })
  return (
    <NavigationRouteContext.Provider value={{key: 'key', name: 'name', params}}>
      <SelectedWalletProvider wallet={{...walletMocks.wallet}}>
        <ModalProvider>
          <ExchangeProvider initialState={initialState}>
            <ShowExchangeResultOrder onClose={() => actions('onClose')} />
          </ExchangeProvider>
        </ModalProvider>
      </SelectedWalletProvider>
    </NavigationRouteContext.Provider>
  )
}
