import { Swap } from '@yoroi/types';
import {
  cancelOrder, // returns an unsigned transaction to cancel the order.
  createOrder, // returns a datum and a contract address to create the order transaction.
  getOrders, // returns all orders for a given stake key hash.
} from './orders';
import { getPools } from './pools';
import { getTokens } from './tokens';

export class OpenSwapApi {
  constructor(public readonly network: Swap.Network) {}

  public async createOrder(
    order: Swap.CreateOrderData
  ) {
    // return createOrder(this.network, order);
  }

  public async cancelOrder(
    orderUTxO: string,
    collateralUTxO: string,
    walletAddress: string
  ) {
    return cancelOrder(this.network, {orderUTxO, collateralUTxO, walletAddress});
  }

  public async getOrders(stakeKeyHash: string) {
    return getOrders(this.network, stakeKeyHash);
  }

  public async getPools(
    tokenA: { policyId: string; assetName: string; },
    tokenB: { policyId: string; assetName: string; },
  ) {
    return getPools(this.network, tokenA, tokenB);
  }

  public getTokens(policyId = '', assetName = '') {
    return getTokens(this.network, policyId, assetName);
  }
}
