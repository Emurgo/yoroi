import {getLogger, isLeft, isRight} from '@yoroi/common'
import {Api, Portfolio, Swap} from '@yoroi/types'

import {freeze} from 'immer'

import {dexhunterApiMaker} from './adapters/api/dexhunter/api-maker'
import {minswapApiMaker} from './adapters/api/minswap/api-maker'
import {muesliswapApiMaker} from './adapters/api/muesliswap/api-maker'
import {getBestSwap} from './helpers/getBestSwap'
import {getPtPrice} from './helpers/getPtPrice'

export const swapManagerMaker: Swap.ManagerMaker = ({
  address,
  addressHex,
  network,
  primaryTokenInfo,
  isPrimaryToken,
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
    isPrimaryToken,
    partner: partners?.[Swap.Aggregator.Muesliswap],
  })
  const minswapApi = minswapApiMaker({
    address,
    network,
    primaryTokenInfo,
    isPrimaryToken,
    partner: partners?.[Swap.Aggregator.Minswap],
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
      [Swap.Aggregator.Minswap]: minswapApi,
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
  // Helper function to get enabled aggregators based on routing preference
  const getEnabledAggregators = (): Swap.Aggregator[] => {
    if (settings.routingPreference === 'auto') {
      return Object.keys(adapters) as Swap.Aggregator[]
    }
    return settings.routingPreference
  }

  return freeze(
    {
      async tokens() {
        const enabledAggregators = getEnabledAggregators()

        const settledResults = await Promise.allSettled(
          enabledAggregators.map((aggregator) => adapters[aggregator].tokens()),
        )

        const responses: Array<Api.Response<Portfolio.Token.Info[]>> = []
        const errors: Array<string> = []

        settledResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            responses.push(result.value)
          } else {
            errors.push(
              `Aggregator ${enabledAggregators[index]} failed: ${result.reason}`,
            )
          }
        })

        if (errors.length > 0) {
          const logger = getLogger()
          logger.warn('Some aggregators failed', {
            origin: 'swap',
            errors,
          })
        }

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
        const enabledAggregators = Object.keys(adapters) as Swap.Aggregator[]

        const responses: Array<Api.Response<Swap.Order[]>> = await Promise.all(
          enabledAggregators.map((aggregator) => adapters[aggregator].orders()),
        )

        warnAllLeft(...responses)

        if (responses.every(isLeft)) return invalid

        const merged: Record<Swap.Order['txHash'], Swap.Order> = {}
        const append = (order: Swap.Order) => {
          const key = `${order.txHash}#${order.outputIndex}`
          if (
            merged[key] === undefined ||
            order.aggregator === Swap.Aggregator.Dexhunter
          )
            merged[key] = order

          // Make sure we have Dexhunter's customId in case we need to cancel the order with them
          if (
            order.customId &&
            merged[key] &&
            merged[key].customId === undefined
          )
            merged[key] = {...merged[key], customId: order.customId}
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

      async limitOptions(body: Swap.LimitOptionsRequest) {
        const enabledAggregators = getEnabledAggregators()

        const responses: Array<Api.Response<Swap.LimitOptionsResponse>> =
          await Promise.all(
            enabledAggregators.map((aggregator) =>
              adapters[aggregator].limitOptions(body),
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
          options: Object.values(mergedOptions).filter(
            (option) => option.protocol !== Swap.Protocol.Unsupported,
          ),
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
        const enabledAggregators = getEnabledAggregators()

        const settledResults = await Promise.allSettled(
          enabledAggregators.map(async (aggregator) => {
            // If amountOut is provided and adapter supports reverse estimate, rely on adapter implementation.
            const response = await adapters[aggregator].estimate(body)
            return response
          }),
        )

        const responses: Array<Api.Response<Swap.EstimateResponse>> = []
        const errors: Array<string> = []

        settledResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            responses.push(result.value)
          } else {
            errors.push(
              `Aggregator ${enabledAggregators[index]} failed: ${result.reason}`,
            )
          }
        })

        if (errors.length > 0) {
          const logger = getLogger()
          logger.warn('Some aggregators failed during estimate', {
            origin: 'swap',
            errors,
          })
        }

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

        if (estimates.length === 0) {
          return invalid
        }

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
        // Feature flag: single adapter create (default true)
        const singleAdapterCreate = true

        if (singleAdapterCreate && body.routeHint?.aggregator != null) {
          const adapter = adapters[body.routeHint.aggregator]
          if (adapter == null) return invalid

          const response = await adapter.create(body)
          if (isLeft(response)) return standarizeError(response)
          return response
        }

        // Fallback to legacy fan-out
        const enabledAggregators = getEnabledAggregators()

        const responses: Array<Api.Response<Swap.CreateResponse>> =
          await Promise.all(
            enabledAggregators.map((aggregator) =>
              adapters[aggregator].create(body),
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
        // Helper function to check if response has valid CBOR
        const hasValidCbor = (
          response: Api.Response<Swap.CancelResponse>,
        ): boolean => {
          return isRight(response) && response.value.data.cbor.trim() !== ''
        }

        // First, try the appropriate adapter based on aggregator
        const initialAdapter =
          body.order.aggregator === Swap.Aggregator.Muesliswap
            ? adapters.muesliswap
            : body.order.aggregator === Swap.Aggregator.Minswap
              ? adapters.minswap
              : adapters.dexhunter

        const initialResponse = await initialAdapter.cancel(body)

        // If we got a valid CBOR, return it
        if (hasValidCbor(initialResponse)) {
          return initialResponse
        }

        // If not, try all other adapters in parallel
        const otherAggregators = Object.entries(adapters).filter(
          ([_, adapter]) => adapter !== initialAdapter,
        )

        const alternativeResponses = await Promise.all(
          otherAggregators.map(([_, adapter]) => adapter.cancel(body)),
        )

        // Find the first response with valid CBOR
        const validResponse = alternativeResponses.find(hasValidCbor)

        // If found, return it; otherwise return the initial response
        return validResponse ?? initialResponse
      },
    },
    true,
  )
}

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
  if (responses.every(isLeft)) {
    const logger = getLogger()
    logger.warn('Swap Manager all left', {
      origin: 'swap',
      errors: responses.map((response) => response.error.message),
    })
  }
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
    case response.error.message.includes('Insufficient balance'):
      response.error.message =
        'Insufficient balance: consider fees and assets blocked by staking.'

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
