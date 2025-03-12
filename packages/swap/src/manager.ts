import {Api, Portfolio, Swap} from '@yoroi/types'
import {isLeft, isRight} from '@yoroi/common'
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
  return freeze(
    {
      async tokens() {
        const aggregatorPromises: Record<
          Swap.Aggregator,
          Promise<Api.Response<Portfolio.Token.Info[]>>
        > = {
          dexhunter: adapters.dexhunter.tokens(),
          muesliswap: adapters.muesliswap.tokens(),
        }

        const responses: Array<Api.Response<Portfolio.Token.Info[]>> =
          await Promise.all(
            Object.entries(aggregatorPromises).map(([key, promise]) =>
              config.routingPreference === 'auto' ||
              config.routingPreference.includes(key as Swap.Aggregator)
                ? promise
                : excluded,
            ),
          )

        warnAllLeft(...responses)

        if (responses.every(isLeft)) return invalid

        const merged: Record<Portfolio.Token.Id, Portfolio.Token.Info> = {}
        const append = (tokenInfo: Portfolio.Token.Info) => {
          if (merged[tokenInfo.id] === undefined)
            merged[tokenInfo.id] = tokenInfo
        }

        responses
          .filter(isRight)
          .flatMap(({value}) => value.data)
          .forEach(append)

        return {
          tag: 'right',
          value: {
            status: Api.HttpStatusCode.Ok,
            data: Object.values(merged),
          },
        }
      },

      async orders() {
        const responses = await Promise.all([
          adapters.muesliswap.orders(),
          adapters.dexhunter.orders(),
        ])

        warnAllLeft(...responses)

        if (responses.every(isLeft)) return invalid

        const merged: Record<Swap.Order['txHash'], Swap.Order> = {}
        const append = (order: Swap.Order) => {
          if (
            merged[order.txHash] === undefined ||
            order.aggregator === Swap.Aggregator.Dexhunter
          )
            merged[order.txHash] = order
        }

        responses
          .filter(isRight)
          .flatMap(({value}) => value.data)
          .forEach(append)

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
        const aggregatorPromises: Record<
          Swap.Aggregator,
          Promise<Api.Response<Swap.AggregatorProtocol[]>>
        > = {
          dexhunter: adapters.dexhunter.protocols(),
          muesliswap: adapters.muesliswap.protocols(),
        }

        const responses: Array<Api.Response<Swap.AggregatorProtocol[]>> =
          await Promise.all(
            Object.entries(aggregatorPromises).map(([key, promise]) =>
              config.routingPreference === 'auto' ||
              config.routingPreference.includes(key as Swap.Aggregator)
                ? promise
                : excluded,
            ),
          )

        warnAllLeft(...responses)

        if (responses.every(isLeft))
          return responses.find((res) => res.error.status !== 3) ?? invalid

        return {
          tag: 'right',
          value: {
            status: Api.HttpStatusCode.Ok,
            data: responses.filter(isRight).flatMap(({value}) => value.data),
          },
        }
      },

      async estimate(body: Swap.EstimateRequest) {
        const aggregatorPromises: Record<
          Swap.Aggregator,
          Promise<Api.Response<Swap.EstimateResponse>>
        > = {
          dexhunter: adapters.dexhunter.estimate(body),
          muesliswap: adapters.muesliswap.estimate(body),
        }

        const responses: Array<Api.Response<Swap.EstimateResponse>> =
          await Promise.all(
            Object.entries(aggregatorPromises).map(([key, promise]) =>
              config.routingPreference === 'auto' ||
              config.routingPreference.includes(key as Swap.Aggregator)
                ? promise
                : excluded,
            ),
          )

        warnAllLeft(...responses)

        if (responses.every(isLeft))
          return responses.find((res) => res.error.status !== -3) ?? invalid

        const estimates = responses
          .filter(isRight)
          .flatMap(({value}) => value.data)

        const bestEstimate = estimates.reduce(getBestSwap, estimates[0]!)

        return {
          tag: 'right',
          value: {
            status: Api.HttpStatusCode.Ok,
            data: bestEstimate,
          },
        }
      },

      async create(body: Swap.CreateRequest) {
        const aggregatorPromises: Record<
          Swap.Aggregator,
          Promise<Api.Response<Swap.CreateResponse>>
        > = {
          dexhunter: adapters.dexhunter.create(body),
          muesliswap: adapters.muesliswap.create(body),
        }

        const responses: Array<Api.Response<Swap.CreateResponse>> =
          await Promise.all(
            Object.entries(aggregatorPromises).map(([key, promise]) =>
              config.routingPreference === 'auto' ||
              config.routingPreference.includes(key as Swap.Aggregator)
                ? promise
                : excluded,
            ),
          )

        warnAllLeft(...responses)

        if (responses.every(isLeft))
          return responses.find((res) => res.error.status !== 3) ?? invalid

        const creates = responses.filter(isRight).map(({value}) => value.data)

        const bestCreate = creates.reduce(getBestSwap, creates[0]!)

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

const invalid: Api.Response<any> = freeze(
  {
    tag: 'left',
    error: {
      status: -3,
      message: 'Unknown error',
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
