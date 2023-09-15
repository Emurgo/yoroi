import {AxiosInstance} from 'axios'
import {
  cancelOrder, // returns an unsigned transaction to cancel the order.
  createOrder, // returns a datum and a contract address to create the order transaction.
  getCompletedOrders,
  getOrders, // returns all orders for a given stake key hash.
} from './orders'
import {getPools} from './pools'
import {getTokens} from './tokens'
import {
  CancelOrderRequest,
  CreateOrderRequest,
  Network,
  TokenAddress,
} from './types'
import {axiosClient} from './config'

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

  public async getPools({
    tokenA,
    tokenB,
  }: {
    tokenA: TokenAddress
    tokenB: TokenAddress
  }) {
    return getPools(
      {network: this.network, client: this.client},
      {tokenA, tokenB},
    )
  }

  public async getTokens({policyId = '', assetName = ''} = {}) {
    const tokens = await getTokens(
      {network: this.network, client: this.client},
      {policyId, assetName},
    )

    return tokens
  }
}

const supportedNetworks: Network[] = ['mainnet', 'preprod']
