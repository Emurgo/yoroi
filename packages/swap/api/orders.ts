import { Swap } from '@yoroi/types';
import { SWAP_API_ENDPOINTS, axiosClient } from './config';

export async function createOrder(
  network: Swap.Netowrk,
  order: Swap.CreateOrderData
): Promise<Swap.CreateOrderResponse> {
  const apiUrl = SWAP_API_ENDPOINTS[network].constructSwapDatum;
  const response = await axiosClient.get<
    | { status: 'failed'; reason?: string }
    | { status: 'success'; hash: string; datum: string; address: string }
  >('/', {
    baseURL: apiUrl,
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
export async function cancelOrder(
  network: Swap.Netowrk,
  orderUTxO: string,
  collateralUTxO: string,
  walletAddress: string
): Promise<string> {
  const apiUrl = SWAP_API_ENDPOINTS[network].cancelSwapTransaction;
  const response = await axiosClient.get('/', {
    baseURL: apiUrl,
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

export async function getOrders(
  network: Swap.Netowrk,
  stakeKeyHash: string
): Promise<Swap.OpenOrder[]> {
  const apiUrl = SWAP_API_ENDPOINTS[network].getPools;
  const response = await axiosClient.get<Swap.OpenOrder[]>('/', {
    baseURL: apiUrl,
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
