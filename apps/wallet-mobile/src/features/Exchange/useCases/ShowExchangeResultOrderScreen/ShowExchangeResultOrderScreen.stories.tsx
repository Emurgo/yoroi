import {NavigationRouteContext, RouteProp} from '@react-navigation/native'
import {actions} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import {exchangeDefaultState, ExchangeProvider, successManagerMock} from '@yoroi/exchange'
import {produce} from 'immer'
import React from 'react'

import {ModalProvider} from '../../../../components'
import {InitialLinkProvider, useInitialLink} from '../../../../IntialLinkManagerProvider'
import {SelectedWalletProvider} from '../../../../SelectedWallet'
import {mocks as walletMocks} from '../../../../yoroi-wallets/mocks'
import {ExchangeInitRoutes} from '../../common/useNavigateTo'
import {ShowExchangeResultOrderScreen} from './ShowExchangeResultOrderScreen'

storiesOf('Exchange ShowExchangeResultOrderScreen', module)
  .addDecorator((story) => <InitialLinkProvider>{story()}</InitialLinkProvider>)
  .add('no params', () => <Init />)
  .add('no info', () => <ShowExchangeResultOrderScreen onClose={() => actions('onClose')} />)
  .add('with params', () => <WithParams />)

const Init = () => {
  const {setInitialUrl} = useInitialLink()
  const initialState = produce(exchangeDefaultState, (draft) => {
    draft.orderType = 'buy'
  })

  React.useEffect(() => {
    setInitialUrl(
      'yoroi://ramp-on-off/result?&status=success&fiatAmount=10000&coinAmount=5000&coin=ADA&fiat=USD&provider=encryptus',
    )
  }, [setInitialUrl])

  return (
    <SelectedWalletProvider wallet={{...walletMocks.wallet}}>
      <ModalProvider>
        <ExchangeProvider manager={successManagerMock} initialState={{...initialState, providerId: 'encryptus'}}>
          <ShowExchangeResultOrderScreen onClose={() => actions('onClose')} />
        </ExchangeProvider>
      </ModalProvider>
    </SelectedWalletProvider>
  )
}

const WithParams = () => {
  const {setInitialUrl} = useInitialLink()
  const params: RouteProp<ExchangeInitRoutes, 'exchange'>['params'] = {
    coin: 'ADA',
    coinAmount: 100,
    fiat: 990,
    fiatAmount: 199,
    status: 'success',
  }
  const initialState = produce(exchangeDefaultState, (draft) => {
    draft.orderType = 'buy'
  })

  React.useEffect(() => {
    setInitialUrl(
      'yoroi://ramp-on-off/result?&status=success&fiatAmount=10000&coinAmount=5000&coin=ADA&fiat=USD&provider=encryptus',
    )
  }, [setInitialUrl])
  return (
    <NavigationRouteContext.Provider value={{key: 'key', name: 'name', params}}>
      <SelectedWalletProvider wallet={{...walletMocks.wallet}}>
        <ModalProvider>
          <ExchangeProvider manager={successManagerMock} initialState={{...initialState, providerId: 'encryptus'}}>
            <ShowExchangeResultOrderScreen onClose={() => actions('onClose')} />
          </ExchangeProvider>
        </ModalProvider>
      </SelectedWalletProvider>
    </NavigationRouteContext.Provider>
  )
}
