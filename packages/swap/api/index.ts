import { Swap } from '@yoroi/types';
import { cancelOrder, createOrder, getOrders } from './orders';
import { getPools } from './pools';
import { getTokens } from './tokens';

export class SwapApi implements Swap.ISwapApi {
  constructor(public readonly network: Swap.Netowrk) {}

  public async createOrder(
    order: Swap.CreateOrderData
  ): ReturnType<typeof createOrder> {
    return createOrder(this.network, order);
  }

  public async cancelOrder(
    orderUTxO: string,
    collateralUTxO: string,
    walletAddress: string
  ): ReturnType<typeof cancelOrder> {
    return cancelOrder(this.network, orderUTxO, collateralUTxO, walletAddress);
  }

  public async getOrders(stakeKeyHash: string): ReturnType<typeof getOrders> {
    return getOrders(this.network, stakeKeyHash);
  }

  public async getPools(
    tokenA: Swap.BaseTokenInfo,
    tokenB: Swap.BaseTokenInfo
  ): ReturnType<typeof getPools> {
    return getPools(this.network, tokenA, tokenB);
  }

  public getTokens(
    policyId = '',
    assetName = ''
  ): ReturnType<typeof getTokens> {
    return getTokens(this.network, policyId, assetName);
  }
}
