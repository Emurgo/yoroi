import {freeze} from 'immer'

import {LinksYoroiActionInfo} from '../../../yoroi/types'

const exchangeActionInfo: LinksYoroiActionInfo = {
  feature: 'exchange',
  version: 1,
  useCase: 'order/show-create-result',
  params: {
    coin: 'ADA',
    coinAmount: 1,
    fiat: 'USD',
    fiatAmount: 1,
    provider: 'encryputs',
    status: 'success',
    appId: 'a386e806-92f4-4796-ad61-7a1485b6e745',
    authorization: 'fca6fc26-abc6-4cdc-bdce-5910cc3c0a01',
    isSandbox: true,
    message: 'Your order number 131234 is under processing, bare with us.',
    redirectTo: 'https://yoroi-wallet.com/about',
    orderType: 'buy',
  },
}

export const mocks = freeze(
  {
    exchangeActionInfo,
  },
  true,
)
