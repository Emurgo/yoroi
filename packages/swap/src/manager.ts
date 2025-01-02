import {Portfolio, Swap} from '@yoroi/types'
import {isLeft} from '@yoroi/common'

import {freeze} from 'immer'
import {dexhunterApiMaker} from './adapters/api/dexhunter/api-maker'
import {muesliswapApiMaker} from './adapters/api/muesliswap/api-maker'

export const swapManagerMaker: Swap.ManagerMaker = ({
  address,
  addressHex,
  network,
  primaryTokenInfo,
  stakingKey,
  storage,
}) => {
  const dexhunterApi = dexhunterApiMaker({address, network, primaryTokenInfo})
  const muesliswapApi = muesliswapApiMaker({
    address,
    addressHex,
    network,
    primaryTokenInfo,
    stakingKey,
  })

  const config: Swap.ManagerConfig = {adapter: 'auto'}

  return {
    api: apiManagerMaker(
      {
        [Swap.Aggregator.Dexhunter]: dexhunterApi,
        [Swap.Aggregator.Muesliswap]: muesliswapApi,
      },
      config,
    ),
    assignConfig: (v: Swap.ManagerConfig): Swap.ManagerConfig =>
      Object.assign(config, v),
    config,
    clearStorage: storage.clear,
    slippage: storage.slippage,
  }
}

const apiManagerMaker = (
  adapters: Record<Swap.Aggregator, Swap.Api>,
  config: Swap.ManagerConfig,
): Swap.Api => {
  const autoApi = autoApiMaker(adapters)
  return new Proxy(
    {},
    {
      get({}, prop: keyof Swap.Api) {
        return (...args: any[]) => {
          if (config.adapter !== 'auto')
            return (adapters[config.adapter][prop] as Function)(...args)
          return (autoApi[prop] as Function)(...args)
        }
      },
    },
  ) as Swap.Api
}

const autoApiMaker = (
  adapters: Record<Swap.Aggregator, Swap.Api>,
): Swap.Api => {
  return freeze(
    {
      async tokens() {
        const [dexhunterResponse, muesliswapResponse] = await Promise.all([
          adapters.dexhunter.tokens(),
          adapters.muesliswap.tokens(),
        ])

        if (isLeft(dexhunterResponse)) return muesliswapResponse
        if (isLeft(muesliswapResponse)) return dexhunterResponse

        const merged: Record<Portfolio.Token.Id, Portfolio.Token.Info> = {}
        const append = (tokenInfo: Portfolio.Token.Info) => {
          if (merged[tokenInfo.id] === undefined)
            merged[tokenInfo.id] = tokenInfo
        }

        dexhunterResponse.value.data.forEach(append)
        muesliswapResponse.value.data.forEach(append)

        return {
          tag: 'right',
          value: {
            status: 200,
            data: Object.values(merged),
          },
        }
      },

      async orders() {
        return adapters.muesliswap.orders()
      },

      async providers(body: Swap.ProvidersRequest) {
        return adapters.muesliswap.providers(body)
      },

      async estimate(body: Swap.EstimateRequest) {
        return adapters.muesliswap.estimate(body)
      },

      async create(body: Swap.CreateRequest) {
        return adapters.muesliswap.create(body)
      },

      async cancel(body: Swap.CancelRequest) {
        return adapters.muesliswap.cancel(body)
      },
    },
    true,
  )
}
