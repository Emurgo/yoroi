import axios from 'axios'

export const SWAP_API_ENDPOINTS = {
  mainnet: {
    getPrice: 'https://api.muesliswap.com/price',
    getPoolsPair: 'https://onchain2.muesliswap.com/pools/pair',
    getLiquidityPools: 'https://api.muesliswap.com/liquidity/pools',
    getOrders: 'https://onchain2.muesliswap.com/orders/all/',
    getCompletedOrders: 'https://api.muesliswap.com/orders/v3/history',
    getTokenPairs: 'https://api.muesliswap.com/list',
    getTokens: 'https://api.muesliswap.com/token-list',
    constructSwapDatum: 'https://aggregator.muesliswap.com/constructSwapDatum',
    cancelSwapTransaction:
      'https://aggregator.muesliswap.com/cancelSwapTransaction',
  },
  preprod: {
    getPrice: 'https://preprod.api.muesliswap.com/price',
    getPoolsPair: 'https://preprod.pools.muesliswap.com/pools/pair',
    getLiquidityPools: 'https://preprod.api.muesliswap.com/liquidity/pools',
    getOrders: 'https://preprod.pools.muesliswap.com/orders/all/',
    getCompletedOrders: 'https://preprod.api.muesliswap.com/orders/v3/history',
    getTokenPairs: 'https://preprod.api.muesliswap.com/list',
    getTokens: 'https://preprod.api.muesliswap.com/token-list',
    constructSwapDatum:
      'https://aggregator.muesliswap.com/constructTestnetSwapDatum',
    cancelSwapTransaction:
      'https://aggregator.muesliswap.com/cancelTestnetSwapTransaction',
  },
} as const

export const axiosClient = axios.create({
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
})
