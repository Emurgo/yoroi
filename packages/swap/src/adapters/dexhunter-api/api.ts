import {Swap} from '@yoroi/types'

import {
  DexHunter,
  ModelsDexName,
  RequestParams,
  SwaputilsSwapObject,
} from './dexhunter'
import {transformersMaker} from './transformers'
import {SwapPool} from '@yoroi/types/lib/swap/pool'

export const swapApiMaker = (
  {
    stakingKey,
    primaryTokenId,
    supportedProviders,
  }: {
    isMainnet?: boolean
    stakingKey: string
    primaryTokenId: string
    supportedProviders: ReadonlyArray<Swap.SupportedProvider>
  },
  deps?: {dexhunter?: DexHunter<unknown>},
): Readonly<Swap.Api> => {
  const api = deps?.dexhunter ?? new DexHunter()
  const params: RequestParams = {
    headers: {
      'X-Partner-Id':
        'yoroi-test616464723171793677353372306739636675756e35726a30326133326575377961767467356e6e726a35646c3970656c7375343236757237306e6a7436356134386637376c61707a70383738796e6875386173386b396a6d747875386a6d746a71716177746477da39a3ee5e6b4b0d3255bfef95601890afd80709',
    },
  }
  const transformers = transformersMaker()

  const getOpenOrders: Swap.Api['getOpenOrders'] = () =>
    api.swap
      .ordersCreate(
        stakingKey, // Needs an address, not the staking key
        {
          filters: [
            {
              filterType: 'STATUS',
              values: ['PENDING'], // Untested, but "COMPLETED" works
            },
          ],
          sortDirection: 'ASC',
        },
        params,
      )
      .then((orders) =>
        orders.data.map((order) => transformers.asYoroiOpenOrder(order)),
      )

  const getCompletedOrders: Swap.Api['getCompletedOrders'] = () =>
    api.swap
      .ordersCreate(
        stakingKey,
        {
          filters: [
            {
              filterType: 'STATUS',
              values: ['COMPLETED'],
            },
          ],
          sortDirection: 'ASC',
        },
        params,
      )
      .then((orders) =>
        orders.data.map((order) => transformers.asYoroiCompletedOrder(order)),
      )

  const createOrder: Swap.Api['createOrder'] = async (orderData) => {
    const {amounts, address, selectedPool} = orderData

    const orderRequest: SwaputilsSwapObject = {
      buyer_address: address,
      single_preferred_dex:
        selectedPool.provider.toUpperCase() as ModelsDexName, // ModelsDexName and current supported providers don't match 100%
      // poolId: selectedPool.poolId,
      token_in: amounts.sell.tokenId,
      token_out: amounts.buy.tokenId,
      amount_in: Number(amounts.sell.quantity),
      slippage: 0, // With current method we don't have slippage here and it's already factored in the amount
    }

    // Tests result in error 500: transaction_building_error
    // Using the /swap/estimate endpoint does work
    return api.swap.swapCreate(orderRequest).then((response) => {
      if (!response.ok) {
        return Promise.reject(response.error ?? 'Unknown error')
      }
      return {
        datum: '',
        datumHash: '',
        contractAddress: '',
      }
    })
  }

  const cancelOrder: Swap.Api['cancelOrder'] = (orderData) =>
    api.swap
      .cancelCreate(
        {
          order_id: orderData.utxos.order,
          address: orderData.address,
        },
        params,
      )
      .then((response) => {
        if (!response.ok) {
          return Promise.reject(response.error ?? 'Unkown error')
        }
        return response.data.cbor ?? ''
      })

  // No equivalent endpoint for this
  const getTokenPairs: Swap.Api['getTokenPairs'] = async (_) => []

  const getTokens: Swap.Api['getTokens'] = async () => {
    return api.swap
      .tokensList(params)
      .then((response) => transformers.asYoroiBalanceTokenInfos(response.data))
  }

  // No equivalent endpoint, something similar with estimate
  const getPools: Swap.Api['getPools'] = async ({tokenA, tokenB}) => {
    // Example using /swap/estimate endpoint
    return api.swap
      .estimateCreate(
        {
          amount_in: 10,
          buyer_address: '',
          slippage: 0,
          token_in: tokenA,
          token_out: tokenB,
          blacklisted_dexes: [],
          is_optimized: true,
          referrer: '',
        },
        params,
      )
      .then((response) => response.data as unknown as SwapPool[])
    /* Response
{
  "splits": [
    {
      "amount_in": 10,
      "expected_output": 12505,
      "expected_output_without_slippage": 12505,
      "fee": 4000000,
      "dex": "SPECTRUM",
      "price_impact": 3.016960259998178,
      "initial_price": 1289.4007069199092,
      "final_price": 1289.3946472977232,
      "t1_amt": 64186588045,
      "t2_amt": 82762232,
      "pool_id": "000000000000000000000000000000000000000000000000000000006c6f76656c616365279c909f348e533da5808898f87f9a14bb2c3dfbbacccd631d927a3f534e454bSPECTRUMa937fa63410caf445b291cf4b673f42507fc7956466d07d701698bda534e454b5f4144415f4e4654",
      "batcher_fee": 1.5,
      "deposits": 2.5,
      "price_distortion": 0.047484804121832674,
      "pool_fee": 0.03
    }
  ],
  "average_price": 1289.3946472977232,
  "total_fee": 4000000,
  "total_output": 12505,
  "deposits": 2.5,
  "total_output_without_slippage": 12505,
  "possible_routes": {
    "AGGREGATED": 11103,
    "BONUS": 0
  },
  "dexhunter_fee": 0,
  "batcher_fee": 1.5,
  "price_ab": 1309.8278156260799,
  "price_ba": 0.0007634591265127574,
  "total_input": 10,
  "net_price": 893.2142857142857,
  "net_price_reverse": 0.0011195521791283487,
  "partner_fee": 1
}
    */
  }

  const getPrice: Swap.Api['getPrice'] = async ({baseToken, quoteToken}) => {
    return api.swap
      .averagePriceDetail(baseToken, quoteToken, params)
      .then((response) => Number(response))
  }

  return {
    getPrice,
    getOpenOrders,
    cancelOrder,
    createOrder,
    getTokens,
    getTokenPairs,
    getPools,
    getCompletedOrders,
    stakingKey,
    primaryTokenId,
    supportedProviders,
  } as const
}
