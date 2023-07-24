import { Swap } from '@yoroi/types';
import { SwapOrdersApi } from './orders';
import { SwapPoolsApi } from './pools';
import { SwapTokensApi } from './tokens';

export class SwapApi {
  public readonly orders: SwapOrdersApi;
  public readonly pools: SwapPoolsApi;
  public readonly tokens: SwapTokensApi;

  constructor(network: Swap.Netowrk) {
    this.orders = new SwapOrdersApi(network);
    this.pools = new SwapPoolsApi(network);
    this.tokens = new SwapTokensApi(network);
  }
}
