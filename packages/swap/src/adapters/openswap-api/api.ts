import axios from 'axios'
import AssetFingerprint from '@emurgo/cip14-js'
import type {
  Aggregator,
  CancelRequest,
  CancelResponse,
  CreateRequest,
  CreateResponse,
  DexName,
  EstimateRequest,
  EstimateResponse,
  OrdersRequest,
  OrdersResponse,
  Quantity,
  TokensResponse,
} from '../../types'
import {Order} from './order_types'
import {Aggregated} from './aggregator_types'
import {History} from './history_types'
import {LiquidityPoolResponse, ListTokensResponse, Provider} from './types'
import {makeOrderCalculations} from '../../helpers/orders/factories/makeOrderCalculations'
import {getBestPoolCalculation} from '../../../lib/typescript'

export const client = axios.create({
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
})

export const OPENSWAP_ENDPOINTS = {
  mainnet: {
    orders: 'https://api.muesliswap.com/orders/v2',
    aggregatorOrders: 'https://api.muesliswap.com/orders/aggregator',
    completedOrders: 'https://api.muesliswap.com/orders/v3/history',
    cancel: 'https://aggregator.muesliswap.com/cancelSwapTransaction',
    tokens: 'https://api.muesliswap.com/token-list',
    pools: 'https://api.muesliswap.com/liquidity/pools',
  },
  preprod: {
    orders: 'https://preprod.api.muesliswap.com/orders/v2',
    aggregatorOrders: 'https://preprod.api.muesliswap.com/orders/aggregator',
    completedOrders: 'https://preprod.api.muesliswap.com/orders/v3/history',
    cancel: 'https://aggregator.muesliswap.com/cancelTestnetSwapTransaction',
    tokens: 'https://api.muesliswap.com/token-list',
    pools: 'https://preprod.api.muesliswap.com/liquidity/pools',
  },
} as const

export const OpenSwapApiMaker = (
  stakeKeyHash: string,
  changeAddress: string,
  network: 'mainnet' | 'preprod' = 'mainnet',
) => {
  const getOrders = async ({
    status,
  }: OrdersRequest): Promise<OrdersResponse> => {
    if (status === 'open') {
      const ordersResponse = await client.get<Order[]>(
        OPENSWAP_ENDPOINTS[network].orders,
        {
          params: {
            'stake-key-hash': stakeKeyHash,
            'canceled': 'n',
            'open': 'y',
            'matched': 'n',
            'v2_only': 'n',
          },
        },
      )

      if (ordersResponse.status !== 200) {
        throw new Error(`Failed to get orders for ${stakeKeyHash}`, {
          cause: ordersResponse.data,
        })
      }

      const aggregatorResponse = await client.get<Aggregated[]>(
        OPENSWAP_ENDPOINTS[network].aggregatorOrders,
        {
          params: {
            wallet: changeAddress,
          },
        },
      )

      if (aggregatorResponse.status !== 200) {
        throw new Error(`Failed to get aggregator orders for ${stakeKeyHash}`, {
          cause: ordersResponse.data,
        })
      }

      const orders = [
        ...ordersResponse.data.map((order) => {
          return {
            id: order.txHash,
            date: new Date(
              order.finalizedAt ?? order.placedAt ?? 0,
            ).toISOString(),
            amountIn: order.fromAmount as Quantity,
            amountOut: order.toAmount as Quantity,
            tokenIn: `${order.fromToken.address.policyId}.${order.fromToken.address.name}`,
            tokenOut: `${order.toToken.address.policyId}.${order.toToken.address.name}`,
            dex: 'MUESLISWAP' as DexName,
            aggregator: 'muesliswap' as Aggregator,
          }
        }),
        ...aggregatorResponse.data.map((order) => {
          return {
            id: order.txHash,
            date: new Date(
              order.finalizedAt ?? order.placedAt ?? 0,
            ).toISOString(),
            amountIn: order.fromAmount as Quantity,
            amountOut: order.toAmount as Quantity,
            tokenIn: `${order.fromToken.address.policyId}.${order.fromToken.address.name}`,
            tokenOut: `${order.toToken.address.policyId}.${order.toToken.address.name}`,
            dex: order.provider as DexName, // TODO match
            aggregator: 'muesliswap' as Aggregator,
          }
        }),
      ]

      return {
        orders,
      }
    }

    if (status === 'cancelled') {
      const response = await client.get<Order[]>(
        OPENSWAP_ENDPOINTS[network].orders,
        {
          params: {
            'stake-key-hash': stakeKeyHash,
            'canceled': 'y',
            'open': 'n',
            'matched': 'n',
            'v2_only': 'n',
          },
        },
      )

      if (response.status !== 200) {
        throw new Error(`Failed to get cancelled orders for ${stakeKeyHash}`, {
          cause: response.data,
        })
      }

      const orders = response.data.map((order) => {
        return {
          id: order.txHash,
          date: new Date(
            order.finalizedAt ?? order.placedAt ?? 0,
          ).toISOString(),
          amountIn: order.fromAmount as Quantity,
          amountOut: order.toAmount as Quantity,
          tokenIn: `${order.fromToken.address.policyId}.${order.fromToken.address.name}`,
          tokenOut: `${order.toToken.address.policyId}.${order.toToken.address.name}`,
          dex: 'MUESLISWAP' as DexName,
          aggregator: 'muesliswap' as Aggregator,
        }
      })

      return {
        orders,
      }
    }

    if (status === 'completed') {
      const response = await client.get<History[]>(
        OPENSWAP_ENDPOINTS[network].completedOrders,
        {
          params: {
            'stake-key-hash': stakeKeyHash,
          },
        },
      )
      if (response.status !== 200) {
        throw new Error(`Failed to get orders for ${stakeKeyHash}`, {
          cause: response.data,
        })
      }

      const orders = response.data.map((order) => {
        return {
          id: order.txHash,
          date: new Date(
            order.finalizedAt ?? order.placedAt ?? 0,
          ).toISOString(),
          amountIn: order.fromAmount as Quantity,
          amountOut: order.toAmount as Quantity,
          tokenIn: `${order.fromToken.address.policyId}.${order.fromToken.address.name}`,
          tokenOut: `${order.toToken.address.policyId}.${order.toToken.address.name}`,
          dex: order.dex as DexName,
          aggregator: order.aggregatorPlatform ?? ('muesliswap' as Aggregator),
        }
      })

      return {
        orders,
      }
    }

    throw new Error('Invalid status')
  }

  const cancelOrder = async ({
    orderId,
    collateralUtxo,
  }: CancelRequest): Promise<CancelResponse> => {
    const response = await client.get('/', {
      baseURL: OPENSWAP_ENDPOINTS[network].cancel,
      params: {
        wallet: changeAddress, // TODO check if it's this one
        utxo: orderId,
        collateralUtxo,
      },
    })

    if (response.status !== 200) {
      throw new Error(`Failed to cancel order ${orderId}`, {
        cause: response.data,
      })
    }

    if (response.data.cbor === undefined) throw new Error('Invalid cancel cbor')

    return {
      cbor: response.data.cbor,
    }
  }

  const getTokens = async (): Promise<TokensResponse> => {
    const response = await client.get<ListTokensResponse>('', {
      baseURL: OPENSWAP_ENDPOINTS[network].tokens,
    })

    if (response.status !== 200) {
      throw new Error('Failed to fetch tokens', {cause: response.data})
    }

    return {
      tokens: response.data.map((token) => {
        const fingerprint = AssetFingerprint.fromParts(
          Buffer.from(token.address.policyId, 'hex'),
          Buffer.from(token.address.name, 'hex'),
        ).fingerprint()

        return {
          id: `${token.address.policyId}.${token.address.name}`,
          group: token.address.policyId,
          fingerprint,
          name: Buffer.from(token.address.name, 'hex').toString('utf-8'),
          decimals: token.decimalPlaces,
          kind: 'ft' as const,
          description: undefined,
          image: undefined,
          icon: undefined,
          symbol: undefined,
          ticker: token.symbol,
          metadatas: {},
        }
      }),
    }
  }

  const getLiquidityPools = async (
    tokenA: string,
    tokenB: string,
    providers: ReadonlyArray<Provider>,
  ): Promise<LiquidityPoolResponse> => {
    const params: {[key: string]: string} = {
      'token-a': tokenA,
      'token-b': tokenB,
      'providers': providers.join(','),
    }

    const response = await client.get<LiquidityPoolResponse>('', {
      baseURL: OPENSWAP_ENDPOINTS[network].pools,
      params,
    })

    if (response.status !== 200) {
      throw new Error('Failed to fetch liquidity pools for token pair', {
        cause: response.data,
      })
    }

    return response.data
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
    const pools = await getLiquidityPools(tokenIn, tokenOut, avoidDexes) // TODO: cache, pass all dexes minus avoid dexes
    const calculations = makeOrderCalculations({
      orderType: limitPrice ? 'limit' : 'market',
      amounts: {
        sell: amountIn,
        buy: amountOut,
      },
      slippage,
      pools,
      limitPrice,
      tokens: {
        // TODO
      },
    })
    const estimation = getBestPoolCalculation(calculations)
    return estimation as unknown as EstimateResponse // TODO
  }

  const createOrder = async ({
    amountIn,
    tokenIn,
    tokenOut,
    slippage,
    limitPrice,
    avoidDexes,
    preferredDex,
  }: CreateRequest): Promise<CreateResponse> => {
    const {network, client} = deps
    const apiUrl = SWAP_API_ENDPOINTS[network].constructSwapDatum
    const response = await client.get<
      | {status: 'failed'; reason?: string}
      | {status: 'success'; hash: string; datum: string; address: string}
    >('/', {
      baseURL: apiUrl,
      params: {
        walletAddr: args.walletAddress,
        protocol: args.protocol,
        poolId: args.poolId,
        sellTokenPolicyID: args.sell.policyId,
        sellTokenNameHex: args.sell.assetName,
        sellAmount: args.sell.amount,
        buyTokenPolicyID: args.buy.policyId,
        buyTokenNameHex: args.buy.assetName,
        buyAmount: args.buy.amount,
      },
    })

    if (response.status !== 200) {
      throw new Error('Failed to construct swap datum', {
        cause: response.data,
      })
    }

    if (response.data.status === 'failed') {
      throw new Error(response.data.reason ?? 'Unexpected error occurred')
    }

    return response.data
  }

  return {
    getOrders,
    cancelOrder,
    getTokens,
    estimate,
    createOrder,
  }
}
