import { Swap } from '@yoroi/types';
import { SWAP_API_ENDPOINTS, axiosClient } from './config';

// todo: use axios params

export class SwapOrders {
  private readonly constructSwapDatumApiUrl: string;
  private readonly cancelSwapTransactionApiUrl: string;
  private readonly getOrdersApiUrl: string;

  constructor(public readonly network: Swap.Netowrk) {
    const { constructSwapDatum, cancelSwapTransaction, getOrders } =
      SWAP_API_ENDPOINTS[network];
    this.constructSwapDatumApiUrl = constructSwapDatum;
    this.cancelSwapTransactionApiUrl = cancelSwapTransaction;
    this.getOrdersApiUrl = getOrders;
  }

  /**
   * @param order the order to construct the datum for and the address to send the order to.
   * @returns the order datum, order datum hash, and address to send the order to.
   */
  public async createOrder(
    order: Swap.Order
  ): Promise<Record<'hash' | 'datum' | 'address', string>> {
    const response = await axiosClient.get(
      `/?walletAddr=${order.address}&protocol=${order.protocol}&poolId=${order.poolId}&sellTokenPolicyID=${order.sell.policyId}&sellTokenNameHex=${order.sell.assetName}&sellAmount=${order.sell.amount}&buyTokenPolicyID=${order.buy.policyId}&buyTokenNameHex=${order.buy.assetName}&buyAmount=${order.buy.amount}`,
      { baseURL: this.constructSwapDatumApiUrl }
    );

    if (response.status !== 200) {
      throw new Error('Failed to construct swap datum', {
        cause: response.data,
      });
    }

    return {
      hash: response.data.hash,
      datum: response.data.datum,
      address: response.data.address,
    };
  }

  /**
   * @param orderUTxO order UTxO from the smart contract to cancel. e.g. "txhash#0"
   * @param collateralUTxOs collateral UTxOs to use for canceling the order in cbor format.
   * @param walletAddress address of the wallet that owns the order in cbor format.
   * @returns an unsigned transaction to cancel the order.
   */
  public async cancelOrder(
    orderUTxO: string,
    collateralUTxOs: string,
    walletAddress: string
  ): Promise<string> {
    const response = await axiosClient.get(
      `/?wallet=${walletAddress}&utxo=${orderUTxO}&collateralUtxo=${collateralUTxOs}`,
      { baseURL: this.cancelSwapTransactionApiUrl }
    );

    if (response.status !== 200) {
      throw new Error('Failed to construct cancel swap transaction', {
        cause: response.data,
      });
    }

    return response.data.cbor;
  }

  /**
   * @param stakeKeyHash the stake key hash of the wallet to get orders for.
   * @returns all unfufilled orders for the given stake key hash.
   */
  public async getOrders(stakeKeyHash: string): Promise<Swap.OpenOrder[]> {
    const response = await axiosClient.get<Swap.OpenOrder[]>(
      `/all?stake-key-hash=${stakeKeyHash}`,
      {
        baseURL: this.getOrdersApiUrl,
      }
    );

    if (response.status !== 200) {
      throw new Error(`Failed to get orders for ${stakeKeyHash}`, {
        cause: response.data,
      });
    }

    return response.data;
  }
}
