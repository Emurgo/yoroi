import axios from 'axios';

export type Protocol = 'minswap' | 'sundaeswap' | 'wingriders' | 'muesliswap';

export type Order = {
  address: string;
  protocol: Protocol;
  poolId?: string; // only required for SundaeSwap trades.
  sell: {
    policyId: string;
    assetName: string; // hexadecimal representation of token, i.e. "" for lovelace, "4d494c4b" for MILK.
    amount: string;
  };
  buy: {
    policyId: string;
    assetName: string; // hexadecimal representation of token, i.e. "" for lovelace, "4d494c4b" for MILK.
    amount: string;
  };
};

export type OpenOrder = {
  provider: Protocol;
  from: {
    amount: string;
    token: string;
  };
  to: {
    amount: string;
    token: string;
  };
  deposit: string;
  utxo: string;
};

const client = axios.create({
  baseURL: 'https://aggregator.muesliswap.com',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

/**
 * @param orderUTxO order UTxO from the smart contract to cancel. e.g. "txhash#0"
 * @param collateralUTxOs collateral UTxOs to use for canceling the order in cbor format.
 * @param walletAddress address of the wallet that owns the order in cbor format.
 * @returns an unsigned transaction to cancel the order.
 */
export const cancelOrder = async (
  orderUTxO: string,
  collateralUTxOs: string,
  walletAddress: string
) => {
  const response = await client.get(
    `/cancelSwapTransaction?wallet=${walletAddress}&utxo=${orderUTxO}&collateralUtxo=${collateralUTxOs}`
  );

  if (response.status !== 200) {
    throw new Error('Failed to construct cancel swap transaction', {
      cause: response.data,
    });
  }

  return {
    tx: response.data.cbor,
  };
};

/**
 * @param order the order to construct the datum for and the address to send the order to.
 * @returns the order datum, order datum hash, and address to send the order to.
 */
export const createOrder = async (order: Order) => {
  const response = await client.get(
    `/constructSwapDatum?walletAddr=${order.address}&protocol=${order.protocol}&poolId=${order.poolId}&sellTokenPolicyID=${order.sell.policyId}&sellTokenNameHex=${order.sell.assetName}&sellAmount=${order.sell.amount}&buyTokenPolicyID=${order.buy.policyId}&buyTokenNameHex=${order.buy.assetName}&buyAmount=${order.buy.amount}`
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
};

/**
 * @param stakeKeyHash the stake key hash of the wallet to get orders for.
 * @returns all unfufilled orders for the given stake key hash.
 */
export const getOrders = async (stakeKeyHash: string): Promise<OpenOrder[]> => {
  const response = await client.get(`/all?stake-key-hash=${stakeKeyHash}`, {
    baseURL: 'https://onchain2.muesliswap.com/orders',
  });

  if (response.status !== 200) {
    throw new Error(`Failed to get orders for ${stakeKeyHash}`, {
      cause: response.data,
    });
  }

  return response.data;
};
