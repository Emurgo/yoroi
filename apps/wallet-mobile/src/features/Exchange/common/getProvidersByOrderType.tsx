import {Providers} from '@yoroi/exchange'
import {Exchange} from '@yoroi/types'

export const getProvidersByOrderType = (orderType: Exchange.OrderType) => {
  return Object.entries(Providers).filter(([, features]) =>
    orderType === 'buy' ? !!features.buy : !!features.sell,
  ) as Array<[Exchange.Provider, Exchange.ProviderFeatures]>
}
