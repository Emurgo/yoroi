import {Providers} from '@yoroi/exchange'
import {Exchange} from '@yoroi/types'
import * as React from 'react'

import {useExchange} from './ExchangeProvider'

export const useProviders = () => {
  const {orderType} = useExchange()

  const providers = React.useMemo(
    () => Object.entries(Providers).filter(([, features]) => (orderType === 'buy' ? !!features.buy : !!features.sell)),
    [orderType],
  )

  return providers as Entries<Exchange.Providers>
}

type Entries<T> = Array<
  {
    [K in keyof T]: [K, T[K]]
  }[keyof T]
>
