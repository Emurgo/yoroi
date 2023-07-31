import { SWAP_API_ENDPOINTS } from './config';
import type {
  ApiDeps,
  CancelOrderRequest,
  CreateOrderRequest,
  CreateOrderResponse,
  Order,
} from './types';

export async function createOrder(
  deps: ApiDeps,
  args: CreateOrderRequest
): Promise<CreateOrderResponse> {
  const { network, client } = deps;
  const apiUrl = SWAP_API_ENDPOINTS[network].constructSwapDatum;
  const response = await client.get<
    | { status: 'failed'; reason?: string }
    | { status: 'success'; hash: string; datum: string; address: string }
  >('/', {
    baseURL: apiUrl,
    params: {
      walletAddr: args.walletAddress,
      protocol: args.protocol,
      poolId: args.poolId,
      sellTokenPolicyID: args.sell.policyId,
      sellTokenNameHex: args.sell.assetName,
      sellAmount: args.sell.amount,
      buyTokenPolicyID: args.buy.policyId,
      buyTokenNameHex: args.buy.assetName,
      buyAmount: args.buy.amount,
    },
  });

  if (response.status !== 200) {
    throw new Error('Failed to construct swap datum', {
      cause: response.data,
    });
  }

  if (response.data.status === 'failed') {
    throw new Error(response.data.reason ?? 'Unexpected error occurred');
  }

  return response.data;
}

export async function cancelOrder(
  deps: ApiDeps,
  args: CancelOrderRequest
): Promise<string> {
  const { network, client } = deps;
  const apiUrl = SWAP_API_ENDPOINTS[network].cancelSwapTransaction;
  const response = await client.get('/', {
    baseURL: apiUrl,
    params: {
      wallet: args.walletAddress,
      utxo: args.orderUTxO,
      collateralUTxO: args.collateralUTxO,
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
  deps: ApiDeps,
  args: { stakeKeyHash: string }
): Promise<Order[]> {
  const { network, client } = deps;
  const { stakeKeyHash } = args;
  const apiUrl = SWAP_API_ENDPOINTS[network].getPools;
  const response = await client.get<Order[]>('/', {
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
