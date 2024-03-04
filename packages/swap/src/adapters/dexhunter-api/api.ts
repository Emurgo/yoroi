import AssetFingerprint from '@emurgo/cip14-js'
import type {
  CancelRequest,
  CancelResponse,
  CreateRequest,
  CreateResponse,
  EstimateRequest,
  EstimateResponse,
  OrdersRequest,
  OrdersResponse,
  TokensResponse,
} from '../../types'
import {DexHunter, ModelsOrder} from './dexhunter'

export const DexHunterApiMaker = (address: string, partnerId?: string) => {
  const api = new DexHunter({
    baseApiParams: {
      credentials: 'same-origin',
      headers: {
        'X-Partner-Id':
          partnerId ??
          'yoroi-test616464723171793677353372306739636675756e35726a30326133326575377961767467356e6e726a35646c3970656c7375343236757237306e6a7436356134386637376c61707a70383738796e6875386173386b396a6d747875386a6d746a71716177746477da39a3ee5e6b4b0d3255bfef95601890afd80709',
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
    },
  })

  let openOrders: ModelsOrder[] = []

  const getOrders = async ({
    status,
  }: OrdersRequest): Promise<OrdersResponse> => {
    const response = await api.swap.ordersCreate(address, {
      filters: status && [
        {
          filterType: 'STATUS',
          values: {
            open: ['PENDING', 'LIMIT'],
            completed: ['COMPLETED'],
            cancelled: ['CANCELLED'],
          }[status],
        },
      ],
      sortDirection: 'ASC',
    })

    if (response.status !== 200) {
      throw new Error(`Failed to get orders for ${address}`, {
        cause: response.data,
      })
    }

    if (status === 'open' && response.data.length) openOrders = response.data

    return {
      orders: response.data.map((order) => {
        if (
          order.tx_hash === undefined ||
          order.last_update === undefined ||
          order.amount_in === undefined ||
          order.actual_out_amount === undefined ||
          order.expected_out_amount === undefined ||
          order.token_id_in === undefined ||
          order.token_id_out === undefined ||
          order.dex === undefined
        )
          throw new Error('Order with undefined fields')

        return {
          id: order.tx_hash,
          date: order.last_update,
          amountIn: `${order.amount_in}`, // TODO: denominated
          amountOut: `${order.actual_out_amount || order.expected_out_amount}`, // TODO: denominated
          tokenIn: order.token_id_in, // TODO: toTokenId
          tokenOut: order.token_id_out, // TODO: toTokenId
          dex: order.dex,
          aggregator: order.is_dexhunter ? 'dexhunter' : 'muesliswap',
        }
      }),
    }
  }

  const cancelOrder = async ({
    orderId,
  }: CancelRequest): Promise<CancelResponse> => {
    if (!openOrders.length) await getOrders({status: 'open'})

    const order = openOrders.find(({tx_hash}) => tx_hash === orderId)

    if (!order || !order.is_dexhunter)
      throw new Error(`Not dexhunter ${orderId}`)

    const response = await api.swap.cancelCreate({address, order_id: order._id})

    if (response.status !== 200) {
      throw new Error(`Failed to cancel order ${orderId}`, {
        cause: response.data,
      })
    }

    if (response.data.cbor === undefined) throw new Error('Invalid cancel cbor')

    return {
      cbor: response.data.cbor,
      additionalCancellationFee: `${
        response.data.additional_cancellation_fee ?? 0
      }`,
    }
  }

  const getTokens = async (): Promise<TokensResponse> => {
    const response = await api.swap.tokensList()

    if (response.status !== 200) {
      throw new Error(`Failed to get tokens list`, {
        cause: response.data,
      })
    }

    return {
      tokens: response.data.map((token) => {
        if (
          token.token_id === undefined ||
          token.token_policy === undefined ||
          token.ticker === undefined ||
          token.token_ascii === undefined ||
          token.token_decimals === undefined
        )
          throw new Error('Token with undefined fields')

        const assetNameHex = token.token_id.replace(token.token_policy, '')
        const fingerprint = AssetFingerprint.fromParts(
          Buffer.from(token.token_policy, 'hex'),
          Buffer.from(assetNameHex, 'hex'),
        ).fingerprint()

        return {
          id: `${token.token_policy}.${assetNameHex}`,
          group: token.token_policy,
          fingerprint,
          name: token.token_ascii,
          decimals: Number(token.token_decimals),
          kind: 'ft' as const,
          description: undefined,
          image: undefined,
          icon: undefined,
          symbol: undefined,
          ticker: token.ticker,
          metadatas: {},
        }
      }),
    }
  }

  const estimate = async ({
    amountIn,
    amountOut,
    tokenIn,
    tokenOut,
    slippage,
    limitPrice,
    avoidDexes,
    preferredDex,
  }: EstimateRequest): Promise<EstimateResponse> => {
    const token_in = tokenIn.replace('.', '')
    const token_out = tokenOut.replace('.', '')
    const amount_in = Number(amountIn)
    const amount_out = Number(amountOut)
    const wanted_price = Number(limitPrice)
    const single_preferred_dex = preferredDex
    const blacklisted_dexes = avoidDexes
    // TODO: fail early if not supported
    if (limitPrice !== undefined) {
      const response = await api.limit.estimateCreate({
        buyer_address: address,
        amount_in,
        token_in,
        token_out,
        blacklisted_dexes,
        dex: single_preferred_dex,
        wanted_price,
      })

      if (response.status !== 200) {
        throw new Error(`Failed to estimate limit order`, {
          cause: response.data,
        })
      }

      return response.data as EstimateResponse // TODO: transform
    }

    if (amountIn !== undefined) {
      const response = await api.swap.estimateCreate({
        buyer_address: address,
        amount_in,
        token_in,
        token_out,
        blacklisted_dexes,
        single_preferred_dex,
        slippage,
        is_optimized: true,
      })

      if (response.status !== 200) {
        throw new Error(`Failed to estimate order`, {
          cause: response.data,
        })
      }

      return response.data as EstimateResponse // TODO: transform
    }

    if (amountOut !== undefined) {
      const response = await api.swap.reverseEstimateCreate({
        buyer_address: address,
        amount_out,
        token_in,
        token_out,
        blacklisted_dexes,
        single_preferred_dex,
        slippage,
        is_optimized: true,
      })

      if (response.status !== 200) {
        throw new Error(`Failed to reverse estimate order`, {
          cause: response.data,
        })
      }

      return response.data as EstimateResponse // TODO: transform
    }

    throw new Error('Invalid estimate params')
  }

  // TODO: is sign needed?
  const createOrder = async ({
    amountIn,
    tokenIn,
    tokenOut,
    slippage,
    limitPrice,
    avoidDexes,
    preferredDex,
  }: CreateRequest): Promise<CreateResponse> => {
    const token_in = tokenIn.replace('.', '')
    const token_out = tokenOut.replace('.', '')
    const amount_in = Number(amountIn)
    const wanted_price = Number(limitPrice)
    const single_preferred_dex = preferredDex
    const blacklisted_dexes = avoidDexes
    // TODO: fail early if not supported

    if (limitPrice !== undefined) {
      const response = await api.dexHunter.limitCreate({
        buyer_address: address,
        amount_in,
        token_in,
        token_out,
        blacklisted_dexes,
        dex: single_preferred_dex,
        wanted_price,
      })

      if (response.status !== 200) {
        throw new Error(`Failed to create limit order`, {
          cause: response.data,
        })
      }

      return response.data as CreateResponse // TODO: transform
    }

    const response = await api.swap.swapCreate({
      buyer_address: address,
      amount_in,
      token_in,
      token_out,
      blacklisted_dexes,
      single_preferred_dex,
      slippage,
      is_optimized: true,
    })

    if (response.status !== 200) {
      throw new Error(`Failed to create order`, {
        cause: response.data,
      })
    }

    return response.data as CreateResponse // TODO: transform
  }

  return {
    getOrders,
    cancelOrder,
    getTokens,
    estimate,
    createOrder,
  }
}
