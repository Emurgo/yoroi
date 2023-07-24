import { Swap } from '@yoroi/types';
import { SWAP_API_ENDPOINTS, axiosClient } from './config';

// todo: use axios params

export class SwapOrdersApi {
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
  ): Promise<Record<'datumHash' | 'datum' | 'contractAddress', string>> {
    const response = await axiosClient.get<
      | { status: 'failed'; reason?: string }
      | { status: 'success'; hash: string; datum: string; address: string }
    >('/', {
      baseURL: this.constructSwapDatumApiUrl,
      params: {
        walletAddr: order.address,
        protocol: order.protocol,
        poolId: order.poolId,
        sellTokenPolicyID: order.sell.policyId,
        sellTokenNameHex: order.sell.assetName,
        sellAmount: order.sell.amount,
        buyTokenPolicyID: order.buy.policyId,
        buyTokenNameHex: order.buy.assetName,
        buyAmount: order.buy.amount,
      },
    });

    if (response.status !== 200) {
      throw new Error('Failed to construct swap datum', {
        cause: response.data,
      });
    }

    if (response.data.status === 'failed') {
      throw new Error(response.data.reason || 'Unexpected error occurred');
    }

    return {
      datumHash: response.data.hash,
      datum: response.data.datum,
      contractAddress: response.data.address,
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
    collateralUTxO: string,
    walletAddress: string
  ): Promise<string> {
    const response = await axiosClient.get('/', {
      baseURL: this.cancelSwapTransactionApiUrl,
      params: {
        wallet: walletAddress,
        utxo: orderUTxO,
        collateralUTxO,
      },
    });

    if (response.status !== 200) {
      throw new Error('Failed to cancel swap transaction', {
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
    const response = await axiosClient.get<Swap.OpenOrder[]>('/', {
      baseURL: this.getOrdersApiUrl,
      params: {
        'stake-key-hash': stakeKeyHash,
      },
    });

    if (response.status !== 200) {
      throw new Error(`Failed to get orders for ${stakeKeyHash}`, {
        cause: response.data,
      });
    }

    return response.data;
  }
}
