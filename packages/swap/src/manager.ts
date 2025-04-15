import {Api, Portfolio, Swap} from '@yoroi/types'
import {isLeft, isRight} from '@yoroi/common'
import {freeze} from 'immer'

import {dexhunterApiMaker} from './adapters/api/dexhunter/api-maker'
import {muesliswapApiMaker} from './adapters/api/muesliswap/api-maker'
import {getBestSwap} from './helpers/getBestSwap'
import {getPtPrice} from './helpers/getPtPrice'

export const swapManagerMaker: Swap.ManagerMaker = ({
  address,
  addressHex,
  network,
  primaryTokenInfo,
  isPrimaryToken,
  stakingKey,
  storage,
  partners,
}) => {
  const dexhunterApi = dexhunterApiMaker({
    address,
    network,
    primaryTokenInfo,
    isPrimaryToken,
    partner: partners?.[Swap.Aggregator.Dexhunter],
  })
  const muesliswapApi = muesliswapApiMaker({
    address,
    addressHex,
    network,
    primaryTokenInfo,
    stakingKey,
    isPrimaryToken,
    partner: partners?.[Swap.Aggregator.Muesliswap],
  })

  const settings: Swap.ManagerSettings = {
    routingPreference: 'auto',
    slippage: 1,
  }

  const assignSettings = (
    v: Partial<Swap.ManagerSettings>,
  ): Swap.ManagerSettings => {
    const newSettings = Object.assign(settings, v)
    storage.settings.save(newSettings)
    return newSettings
  }

  storage.settings.read().then(assignSettings)

  const api = apiManagerMaker(
    {
      [Swap.Aggregator.Dexhunter]: dexhunterApi,
      [Swap.Aggregator.Muesliswap]: muesliswapApi,
    },
    settings,
    getPtPrice(primaryTokenInfo, dexhunterApi),
  )

  return {
    api,
    assignSettings,
    settings,
    clearStorage: storage.clear,
  }
}

const apiManagerMaker = (
  adapters: Record<Swap.Aggregator, Swap.Api>,
  settings: Swap.ManagerSettings,
  getPrice: (id: Portfolio.Token.Id) => Promise<number>,
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
              settings.routingPreference === 'auto' ||
              settings.routingPreference.includes(key as Swap.Aggregator)
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
          const key = `${order.txHash}#${order.outputIndex}`
          /* istanbul ignore next */
          if (
            // TODO: refactor to avoid istanbul ignore
            merged[key] === undefined ||
            order.aggregator === Swap.Aggregator.Dexhunter
          )
            merged[key] = order
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

      /* istanbul ignore next */
      async limitOptions(body: Swap.LimitOptionsRequest) {
        const aggregatorPromises: Record<
          Swap.Aggregator,
          Promise<Api.Response<Swap.LimitOptionsResponse>>
        > = {
          dexhunter: adapters.dexhunter.limitOptions(body),
          muesliswap: adapters.muesliswap.limitOptions(body),
        }

        const responses: Array<Api.Response<Swap.LimitOptionsResponse>> =
          await Promise.all(
            Object.entries(aggregatorPromises).map(([key, promise]) =>
              settings.routingPreference === 'auto' ||
              settings.routingPreference.includes(key as Swap.Aggregator)
                ? promise
                : excluded,
            ),
          )

        warnAllLeft(...responses)

        if (responses.every(isLeft))
          return responses.find((res) => res.error.status !== -3) ?? invalid

        const validResponses = responses
          .filter(isRight)
          .map(({value}) => value.data)

        if (validResponses.length === 0) return invalid

        const mergedOptions: Partial<
          Record<Swap.Protocol, Swap.LimitOptionsResponse['options'][number]>
        > = {}

        const append = (res: Swap.LimitOptionsResponse['options'][number]) => {
          mergedOptions[res.protocol] = res
        }
        validResponses.forEach(({options}) => options.forEach(append))

        const data: Swap.LimitOptionsResponse = {
          defaultProtocol: validResponses[0]!.defaultProtocol,
          wantedPrice: Math.min(
            ...validResponses.map(({wantedPrice}) => wantedPrice),
          ),
          options: Object.values(mergedOptions),
        }

        return {
          tag: 'right',
          value: {
            status: Api.HttpStatusCode.Ok,
            data,
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
              settings.routingPreference === 'auto' ||
              settings.routingPreference.includes(key as Swap.Aggregator)
                ? promise
                : excluded,
            ),
          )

        warnAllLeft(...responses)

        if (responses.every(isLeft))
          return standarizeError(
            responses.find(
              (res) =>
                res.error.status !== -3 &&
                res.error.message !== '' &&
                !res.error.message.includes('DOCTYPE html'),
            ) ?? invalid,
          )

        const estimates = responses
          .filter(isRight)
          .flatMap(({value}) => value.data)

        const bestEstimate = estimates.reduce(
          getBestSwap(await getPrice(body.tokenOut)),
          estimates[0]!,
        )

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
              settings.routingPreference === 'auto' ||
              settings.routingPreference.includes(key as Swap.Aggregator)
                ? promise
                : excluded,
            ),
          )

        warnAllLeft(...responses)

        if (responses.every(isLeft))
          return standarizeError(
            responses.find(
              (res) =>
                res.error.status !== -3 &&
                res.error.message !== '' &&
                !res.error.message.includes('DOCTYPE html'),
            ) ?? invalid,
          )

        const creates = responses.filter(isRight).map(({value}) => value.data)

        const bestCreate = creates.reduce(
          getBestSwap(await getPrice(body.tokenOut)),
          creates[0]!,
        )

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

export const standarizeError = <T>(input: Api.Response<T>): Api.Response<T> => {
  if (isRight(input)) return input

  const response = {...input, error: {...input.error}}

  switch (true) {
    case response.error.message.includes(
      'Unable to build transaction due to insufficient user balance',
    ):
    case response.error.message.includes(
      'Transaction Building Errornot enough funds',
    ):
    case response.error.message.includes(
      'Transaction Building ErrorNo Remaining UTxOs',
    ):
      response.error.message =
        'Insufficient balance: consider fees, assets blocked by staking or multiaddress holdings'

      break
    case response.error.message.includes('amount_in_invalid'):
    case response.error.message.includes(
      'Buy and sell amounts must be positive',
    ):
      response.error.message = 'Buy and sell amounts must be positive'
      break
    case response.error.message.includes(
      'No liquidity available for this token pair',
    ):
    case response.error.message.includes('pool_not_found'):
      response.error.message =
        'This pair is not available in any liquidity pool.'
      break
    case response.error.message.includes('DOCTYPE html'):
    case response.error.message.includes(
      'Could not find the number of decimals',
    ):
      response.error.message = 'Unknown error'
      break
  }

  return freeze(response, true)
}
