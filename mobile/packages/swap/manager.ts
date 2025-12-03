import {getLogger, isLeft, isRight} from '@yoroi/common'
import {Api, Portfolio, Swap} from '@yoroi/types'

import {freeze} from 'immer'

import {dexhunterApiMaker} from './adapters/api/dexhunter/api-maker'
import {minswapApiMaker} from './adapters/api/minswap/api-maker'
import {muesliswapApiMaker} from './adapters/api/muesliswap/api-maker'
import {steelswapApiMaker} from './adapters/api/steelswap/api-maker'
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
  const steelswapApi = steelswapApiMaker({
    address,
    network,
    primaryTokenInfo,
    isPrimaryToken,
    partner: partners?.[Swap.Aggregator.Steelswap],
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

  // Only include adapters that have a partner code in the partners object
  const adapters: Partial<Record<Swap.Aggregator, Swap.Api>> = {}
  if (partners?.[Swap.Aggregator.Dexhunter]) {
    adapters[Swap.Aggregator.Dexhunter] = dexhunterApi
  }
  if (partners?.[Swap.Aggregator.Muesliswap]) {
    adapters[Swap.Aggregator.Muesliswap] = muesliswapApi
  }
  if (partners?.[Swap.Aggregator.Minswap]) {
    adapters[Swap.Aggregator.Minswap] = minswapApi
  }
  if (partners?.[Swap.Aggregator.Steelswap]) {
    adapters[Swap.Aggregator.Steelswap] = steelswapApi
  }

  const api = apiManagerMaker(
    adapters as Record<Swap.Aggregator, Swap.Api>,
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
  adapters: Partial<Record<Swap.Aggregator, Swap.Api>>,
  settings: Swap.ManagerSettings,
  getPrice: (id: Portfolio.Token.Id) => Promise<number>,
): Swap.Api => {
  // Helper function to get enabled aggregators based on routing preference
  const getEnabledAggregators = (): Swap.Aggregator[] => {
    if (settings.routingPreference === 'auto') {
      return Object.keys(adapters) as Swap.Aggregator[]
    }
    // Filter to only include aggregators that exist in adapters
    return settings.routingPreference.filter(
      (agg) => adapters[agg] !== undefined,
    )
  }

  return freeze(
    {
      async tokens(): Promise<Api.Response<Portfolio.Token.Info[]>> {
        const enabledAggregators = getEnabledAggregators()

        const settledResults = await Promise.allSettled(
          enabledAggregators.map((aggregator) =>
            adapters[aggregator]!.tokens(),
          ),
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
          getLogger().warn('Some aggregators failed', {
            origin: 'swap',
            errors,
          })
        }

        warnAllLeft(...responses)

        if (responses.every(isLeft))
          return invalid as Api.Response<Portfolio.Token.Info[]>

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

      async orders(): Promise<Api.Response<Swap.Order[]>> {
        const enabledAggregators = Object.keys(adapters).filter(
          (agg) => adapters[agg as Swap.Aggregator] !== undefined,
        ) as Swap.Aggregator[]

        const responses: Array<Api.Response<Swap.Order[]>> = await Promise.all(
          enabledAggregators.map((aggregator) =>
            adapters[aggregator]!.orders(),
          ),
        )

        warnAllLeft(...responses)

        if (responses.every(isLeft))
          return invalid as Api.Response<Swap.Order[]>

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

      async limitOptions(
        body: Swap.LimitOptionsRequest,
      ): Promise<Api.Response<Swap.LimitOptionsResponse>> {
        const enabledAggregators = getEnabledAggregators()

        const responses: Array<Api.Response<Swap.LimitOptionsResponse>> =
          await Promise.all(
            enabledAggregators.map((aggregator) =>
              adapters[aggregator]!.limitOptions(body),
            ),
          )

        warnAllLeft(...responses)

        if (responses.every(isLeft))
          return (responses.find((res) => res.error.status !== -3) ??
            invalid) as Api.Response<Swap.LimitOptionsResponse>

        const validResponses = responses
          .filter(isRight)
          .map(({value}) => value.data)

        if (validResponses.length === 0)
          return invalid as Api.Response<Swap.LimitOptionsResponse>

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

      async estimate(
        body: Swap.EstimateRequest,
      ): Promise<Api.Response<Swap.EstimateResponse>> {
        const enabledAggregators = getEnabledAggregators()

        const settledResults = await Promise.allSettled(
          enabledAggregators.map(async (aggregator) => {
            // If amountOut is provided and adapter supports reverse estimate, rely on adapter implementation.
            const response = await adapters[aggregator]!.estimate(body)
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
          getLogger().warn('Some aggregators failed during estimate', {
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
          ) as Api.Response<Swap.EstimateResponse>

        const estimates = responses
          .filter(isRight)
          .flatMap(({value}) => value.data)

        if (estimates.length === 0) {
          return invalid as Api.Response<Swap.EstimateResponse>
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

      async create(
        body: Swap.CreateRequest,
      ): Promise<Api.Response<Swap.CreateResponse>> {
        // Feature flag: single adapter create (default true)
        const singleAdapterCreate = true

        if (singleAdapterCreate && body.routeHint?.aggregator != null) {
          const adapter = adapters[body.routeHint.aggregator]
          if (adapter == null)
            return invalid as Api.Response<Swap.CreateResponse>

          const response = await adapter.create(body)
          if (isLeft(response)) return standarizeError(response)
          return response
        }

        // Fallback to legacy fan-out
        const enabledAggregators = getEnabledAggregators()

        const responses: Array<Api.Response<Swap.CreateResponse>> =
          await Promise.all(
            enabledAggregators.map((aggregator) =>
              adapters[aggregator]!.create(body),
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
          ) as Api.Response<Swap.CreateResponse>

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

      async cancel(
        body: Swap.CancelRequest,
      ): Promise<Api.Response<Swap.CancelResponse>> {
        // Helper function to check if response has valid CBOR
        const hasValidCbor = (
          response: Api.Response<Swap.CancelResponse>,
        ): boolean => {
          return isRight(response) && response.value.data.cbor.trim() !== ''
        }

        // Priority order for cancel APIs: minswap -> steelswap -> dexhunter -> muesliswap
        // Muesliswap is last due to issues with malformed CBORs
        const priorityOrder: Swap.Aggregator[] = [
          Swap.Aggregator.Minswap,
          Swap.Aggregator.Steelswap,
          Swap.Aggregator.Dexhunter,
          Swap.Aggregator.Muesliswap,
        ]

        let lastResponse: Api.Response<Swap.CancelResponse> | undefined

        // Try adapters in priority order, stopping at the first valid CBOR
        for (const aggregator of priorityOrder) {
          const adapter = adapters[aggregator]
          if (!adapter) continue

          const response = await adapter.cancel(body)
          lastResponse = response

          // If we got a valid CBOR, return it immediately
          if (hasValidCbor(response)) {
            return response
          }
        }

        // If no adapter returned a valid CBOR, return the last response or invalid
        return lastResponse ?? (invalid as Api.Response<Swap.CancelResponse>)
      },
    },
    true,
  )
}

const invalid: Api.Response<unknown> = freeze(
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

const warnAllLeft = (...responses: Array<Api.Response<unknown>>) => {
  if (responses.every(isLeft)) {
    getLogger().debug('Swap Manager all left', {
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
