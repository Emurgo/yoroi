import {Portfolio, Swap} from '@yoroi/types'
import {isLeft} from '@yoroi/common'
import {freeze} from 'immer'

import {dexhunterApiMaker} from './adapters/api/dexhunter/api-maker'
import {muesliswapApiMaker} from './adapters/api/muesliswap/api-maker'
import {getBestSwap} from './helpers/getBestSwap'

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

  const config: Swap.ManagerConfig = {aggregatorSelected: 'auto'}

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
          if (config.aggregatorSelected !== 'auto')
            return (adapters[config.aggregatorSelected][prop] as Function)(
              ...args,
            )
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
        const [dexhunterResponse, muesliswapResponse] = await Promise.all([
          adapters.dexhunter.orders(),
          adapters.muesliswap.orders(),
        ])

        if (isLeft(dexhunterResponse)) return muesliswapResponse
        if (isLeft(muesliswapResponse)) return dexhunterResponse

        const merged: Record<Swap.Order['txHash'], Swap.Order> = {}
        const append = (order: Swap.Order) => {
          if (
            merged[order.txHash] === undefined ||
            order.aggregator === Swap.Aggregator.Dexhunter
          )
            merged[order.txHash] = order
        }

        muesliswapResponse.value.data.forEach(append)
        dexhunterResponse.value.data.forEach(append)

        return {
          tag: 'right',
          value: {
            status: 200,
            data: Object.values(merged),
          },
        }
      },

      async protocols() {
        const [dexhunterResponse, muesliswapResponse] = await Promise.all([
          adapters.dexhunter.protocols(),
          adapters.muesliswap.protocols(),
        ])

        if (isLeft(dexhunterResponse)) return muesliswapResponse
        if (isLeft(muesliswapResponse)) return dexhunterResponse

        return {
          tag: 'right',
          value: {
            status: 200,
            data: [
              ...dexhunterResponse.value.data,
              ...muesliswapResponse.value.data,
            ],
          },
        }
      },

      async estimate(body: Swap.EstimateRequest) {
        const [dexhunterResponse, muesliswapResponse] = await Promise.all([
          adapters.dexhunter.estimate(body),
          adapters.muesliswap.estimate(body),
        ])

        if (isLeft(dexhunterResponse)) return muesliswapResponse
        if (isLeft(muesliswapResponse)) return dexhunterResponse

        const bestEstimate = [
          dexhunterResponse.value.data,
          muesliswapResponse.value.data,
        ].reduce(getBestSwap, dexhunterResponse.value.data)

        return {
          tag: 'right',
          value: {
            status: 200,
            data: bestEstimate,
          },
        }
      },

      async create(body: Swap.CreateRequest) {
        const [dexhunterResponse, muesliswapResponse] = await Promise.all([
          adapters.dexhunter.create(body),
          adapters.muesliswap.create(body),
        ])

        if (isLeft(dexhunterResponse)) return muesliswapResponse
        if (isLeft(muesliswapResponse)) return dexhunterResponse

        const bestCreate = [
          dexhunterResponse.value.data,
          muesliswapResponse.value.data,
        ].reduce(getBestSwap, dexhunterResponse.value.data)

        return {
          tag: 'right',
          value: {
            status: 200,
            data: bestCreate,
          },
        }
      },

      async cancel(body: Swap.CancelRequest) {
        return body.order.aggregator === Swap.Aggregator.Muesliswap
          ? adapters.muesliswap.cancel(body)
          : adapters.dexhunter.cancel(body)
      },
    },
    true,
  )
}
