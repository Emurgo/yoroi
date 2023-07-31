import { Swap } from '@yoroi/types';
import { SWAP_API_ENDPOINTS, axiosClient } from './config';
import type { CancelOrderRequest, CreateOrderRequest, Order } from './types';

export async function createOrder(
  network: Swap.Network,
  request: CreateOrderRequest
): Promise<Swap.CreateOrderResponse> {
  const apiUrl = SWAP_API_ENDPOINTS[network].constructSwapDatum;
  const response = await axiosClient.get<
    | { status: 'failed'; reason?: string }
    | { status: 'success'; hash: string; datum: string; address: string }
  >('/', {
    baseURL: apiUrl,
    params: {
      walletAddr: request.address,
      protocol: request.protocol,
      poolId: request.poolId,
      sellTokenPolicyID: request.sell.policyId,
      sellTokenNameHex: request.sell.assetName,
      sellAmount: request.sell.amount,
      buyTokenPolicyID: request.buy.policyId,
      buyTokenNameHex: request.buy.assetName,
      buyAmount: request.buy.amount,
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
    datum: response.data.datum,
    datumHash: response.data.hash,
    contractAddress: response.data.address,
  };
}

export async function cancelOrder(
  network: Swap.Network,
  request: CancelOrderRequest,
): Promise<string> {
  const apiUrl = SWAP_API_ENDPOINTS[network].cancelSwapTransaction;
  const response = await axiosClient.get('/', {
    baseURL: apiUrl,
    params: {
      wallet: request.walletAddress,
      utxo: request.orderUTxO,
      collateralUTxO: request.collateralUTxO,
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
  network: Swap.Network,
  stakeKeyHash: string
): Promise<Order[]> {
  const apiUrl = SWAP_API_ENDPOINTS[network].getPools;
  const response = await axiosClient.get<Order[]>('/', {
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
