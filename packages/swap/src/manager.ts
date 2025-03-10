import {Api, Portfolio, Swap} from '@yoroi/types'
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
  isPrimaryToken,
  stakingKey,
  storage,
}) => {
  const dexhunterApi = dexhunterApiMaker({
    address,
    network,
    primaryTokenInfo,
    isPrimaryToken,
  })
  const muesliswapApi = muesliswapApiMaker({
    address,
    addressHex,
    network,
    primaryTokenInfo,
    stakingKey,
    isPrimaryToken,
  })

  const config: Swap.ManagerConfig = {
    routingPreference: 'auto',
  }

  return {
    api: apiManagerMaker(
      {
        [Swap.Aggregator.Dexhunter]: dexhunterApi,
        [Swap.Aggregator.Muesliswap]: muesliswapApi,
      },
      config,
      primaryTokenInfo.id,
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
  ptId: Portfolio.Token.Id,
): Swap.Api => {
  const dhTokenList = new Set<Portfolio.Token.Id>([ptId])
  const msTokenList = new Set<Portfolio.Token.Id>([ptId])

  return freeze(
    {
      async tokens() {
        const [dexhunterResponse, muesliswapResponse] = await Promise.all([
          config.routingPreference === 'auto' ||
          config.routingPreference.includes('dexhunter')
            ? adapters.dexhunter.tokens()
            : excluded,
          config.routingPreference === 'auto' ||
          config.routingPreference.includes('muesliswap')
            ? adapters.muesliswap.tokens()
            : excluded,
        ])

        warnAllLeft(dexhunterResponse, muesliswapResponse)

        if (isLeft(dexhunterResponse)) return muesliswapResponse
        if (isLeft(muesliswapResponse)) return dexhunterResponse

        const merged: Record<Portfolio.Token.Id, Portfolio.Token.Info> = {}
        const append =
          (tokenList: Set<Portfolio.Token.Id>) =>
          (tokenInfo: Portfolio.Token.Info) => {
            tokenList.add(tokenInfo.id)
            if (merged[tokenInfo.id] === undefined)
              merged[tokenInfo.id] = tokenInfo
          }

        dexhunterResponse.value.data.forEach(append(dhTokenList))
        muesliswapResponse.value.data.forEach(append(msTokenList))

        return {
          tag: 'right',
          value: {
            status: Api.HttpStatusCode.Ok,
            data: Object.values(merged),
          },
        }
      },

      async orders() {
        const [dexhunterResponse, muesliswapResponse] = await Promise.all([
          adapters.dexhunter.orders(),
          adapters.muesliswap.orders(),
        ])

        warnAllLeft(dexhunterResponse, muesliswapResponse)

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
            status: Api.HttpStatusCode.Ok,
            data: Object.values(merged).sort(
              ({lastUpdate: A, placedAt: A2}, {lastUpdate: B, placedAt: B2}) =>
                (B ?? B2 ?? 0) - (A ?? A2 ?? 0),
            ),
          },
        }
      },

      async protocols() {
        const [dexhunterResponse, muesliswapResponse] = await Promise.all([
          config.routingPreference === 'auto' ||
          config.routingPreference.includes('dexhunter')
            ? adapters.dexhunter.protocols()
            : excluded,
          config.routingPreference === 'auto' ||
          config.routingPreference.includes('muesliswap')
            ? adapters.muesliswap.protocols()
            : excluded,
        ])

        warnAllLeft(dexhunterResponse, muesliswapResponse)

        if (isLeft(dexhunterResponse)) return muesliswapResponse
        if (isLeft(muesliswapResponse)) return dexhunterResponse

        return {
          tag: 'right',
          value: {
            status: Api.HttpStatusCode.Ok,
            data: [
              ...dexhunterResponse.value.data,
              ...muesliswapResponse.value.data,
            ],
          },
        }
      },

      async estimate(body: Swap.EstimateRequest) {
        const isDHValid = hasTokens(dhTokenList, body)
        const isMSValid = hasTokens(msTokenList, body)

        if (!isDHValid || !isMSValid) {
          if (isDHValid) return adapters.dexhunter.estimate(body)
          if (isMSValid) return adapters.muesliswap.estimate(body)
          return {
            tag: 'left',
            error: {
              status: -3,
              message: 'Tokens not found in aggregators',
              responseData: {},
            },
          }
        }

        const [dexhunterResponse, muesliswapResponse] = await Promise.all([
          config.routingPreference === 'auto' ||
          config.routingPreference.includes('dexhunter')
            ? adapters.dexhunter.estimate(body)
            : excluded,
          config.routingPreference === 'auto' ||
          config.routingPreference.includes('muesliswap')
            ? adapters.muesliswap.estimate(body)
            : excluded,
        ])

        warnAllLeft(dexhunterResponse, muesliswapResponse)

        if (
          isLeft(dexhunterResponse) &&
          isLeft(muesliswapResponse) &&
          dexhunterResponse.error.status === -3
        )
          return muesliswapResponse
        if (
          isLeft(dexhunterResponse) &&
          isLeft(muesliswapResponse) &&
          muesliswapResponse.error.status === -3
        )
          return dexhunterResponse

        if (isLeft(dexhunterResponse)) return muesliswapResponse
        if (isLeft(muesliswapResponse)) return dexhunterResponse

        const bestEstimate = [
          dexhunterResponse.value.data,
          muesliswapResponse.value.data,
        ].reduce(getBestSwap, dexhunterResponse.value.data)

        return {
          tag: 'right',
          value: {
            status: Api.HttpStatusCode.Ok,
            data: bestEstimate,
          },
        }
      },

      async create(body: Swap.CreateRequest) {
        const isDHValid = hasTokens(dhTokenList, body)
        const isMSValid = hasTokens(msTokenList, body)

        if (!isDHValid || !isMSValid) {
          if (isDHValid) return adapters.dexhunter.create(body)
          if (isMSValid) return adapters.muesliswap.create(body)
          return {
            tag: 'left',
            error: {
              status: -3,
              message: 'Tokens not found in aggregators',
              responseData: {},
            },
          }
        }

        const [dexhunterResponse, muesliswapResponse] = await Promise.all([
          config.routingPreference === 'auto' ||
          config.routingPreference.includes('dexhunter')
            ? adapters.dexhunter.create(body)
            : excluded,
          config.routingPreference === 'auto' ||
          config.routingPreference.includes('muesliswap')
            ? adapters.muesliswap.create(body)
            : excluded,
        ])

        warnAllLeft(dexhunterResponse, muesliswapResponse)

        if (
          isLeft(dexhunterResponse) &&
          isLeft(muesliswapResponse) &&
          dexhunterResponse.error.status === -3
        )
          return muesliswapResponse
        if (
          isLeft(dexhunterResponse) &&
          isLeft(muesliswapResponse) &&
          muesliswapResponse.error.status === -3
        )
          return dexhunterResponse

        if (isLeft(dexhunterResponse)) return muesliswapResponse
        if (isLeft(muesliswapResponse)) return dexhunterResponse

        const bestCreate = [
          dexhunterResponse.value.data,
          muesliswapResponse.value.data,
        ].reduce(getBestSwap, dexhunterResponse.value.data)

        return {
          tag: 'right',
          value: {
            status: Api.HttpStatusCode.Ok,
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

const excluded: Api.Response<any> = freeze(
  {
    tag: 'left',
    error: {
      status: -3,
      message: 'Aggregator excluded from call',
      responseData: {},
    },
  },
  true,
)

const warnAllLeft = (...responses: Array<Api.Response<any>>) => {
  if (responses.every(isLeft))
    console.warn(
      'Swap Manager all left >> ',
      responses.map((response) => response.error.message),
    )
}

const hasTokens = (
  tokenList: Set<Portfolio.Token.Id>,
  body: Swap.CreateRequest | Swap.EstimateRequest,
): boolean => {
  const {tokenIn, tokenOut} = body

  if (!tokenList.has(tokenIn)) return false
  if (!tokenList.has(tokenOut)) return false

  return true
}
