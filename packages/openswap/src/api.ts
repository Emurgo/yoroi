import {AxiosInstance} from 'axios'
import {
  cancelOrder, // returns an unsigned transaction to cancel the order.
  createOrder, // returns a datum and a contract address to create the order transaction.
  getCompletedOrders,
  getOrders, // returns all orders for a given stake key hash.
} from './orders'
import {getTokenPairs} from './token-pairs'
import {getTokens} from './tokens'
import {
  CancelOrderRequest,
  CreateOrderRequest,
  Network,
  Provider,
  PriceAddress,
  TokenAddress,
} from './types'
import {axiosClient} from './config'
import {getPrice} from './price'
import {getLiquidityPools, getPoolsPair} from './pools'

export class OpenSwapApi {
  constructor(
    public readonly network: Network,
    private readonly client: AxiosInstance = axiosClient,
  ) {
    if (!supportedNetworks.includes(network)) {
      throw new Error(
        `Supported networks are ${supportedNetworks.join(
          ', ',
        )}, got ${network}`,
      )
    }
  }

  public async createOrder(orderData: CreateOrderRequest) {
    return createOrder({network: this.network, client: this.client}, orderData)
  }

  public async cancelOrder(orderData: CancelOrderRequest) {
    return cancelOrder({network: this.network, client: this.client}, orderData)
  }

  public async getOrders(stakeKeyHash: string) {
    return getOrders(
      {network: this.network, client: this.client},
      {stakeKeyHash},
    )
  }

  public async getCompletedOrders(stakeKeyHash: string) {
    return getCompletedOrders(
      {network: this.network, client: this.client},
      {stakeKeyHash},
    )
  }

  public async getPrice({
    baseToken,
    quoteToken,
  }: {
    baseToken: PriceAddress
    quoteToken: PriceAddress
  }) {
    return getPrice(
      {network: this.network, client: this.client},
      {baseToken, quoteToken},
    )
  }

  public async getPoolsPair({
    tokenA,
    tokenB,
  }: {
    tokenA: TokenAddress
    tokenB: TokenAddress
  }) {
    return getPoolsPair(
      {network: this.network, client: this.client},
      {tokenA, tokenB},
    )
  }

  public async getLiquidityPools({
    tokenA,
    tokenB,
    providers,
  }: {
    tokenA: string
    tokenB: string
    providers: ReadonlyArray<Provider>
  }) {
    return getLiquidityPools(
      {network: this.network, client: this.client},
      {tokenA, tokenB, providers},
    )
  }

  public async getTokenPairs({policyId = '', assetName = ''} = {}) {
    const tokenPairs = await getTokenPairs(
      {network: this.network, client: this.client},
      {policyId, assetName},
    )

    return tokenPairs
  }

  public async getTokens() {
    return getTokens({network: this.network, client: this.client})
  }
}

export const supportedNetworks: ReadonlyArray<Network> = [
  'mainnet',
  'preprod',
] as const

export const supportedProviders: ReadonlyArray<Provider> = [
  'minswap',
  'muesliswap_v1',
  'muesliswap_v3',
  'muesliswap_v4',
  'spectrum',
  'sundaeswap',
  'vyfi',
  'wingriders',
  'muesliswap_v2',
] as const
