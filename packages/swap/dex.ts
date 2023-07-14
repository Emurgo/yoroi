import {
  cancelOrder,
  createOrder,
  getOrders,
  getPools,
  getTokens,
} from "./openswap";
import type { Protocol, Token } from "./openswap";

export type OrderDetails = {
  protocol: Protocol;
  poolId?: string; // only required for SundaeSwap trades.
  send: TokenAmount;
  receive: TokenAmount;
  walletAddress: string;
};

export type OrderDatum = {
  contractAddress: string;
  datumHash: string;
  datum: string;
};

export type TokenAddress = {
  policyId: string;
  assetName: string;
};

export type TokenAmount = {
  address: TokenAddress;
  amount: string;
};

export type TokenPair = {
  send: TokenAmount; // token to swap from aka selling
  receive: TokenAmount; // token to swap to aka buying
};

export type TokenPairPool = {
  protocol: Protocol;
  lpToken?: TokenAmount;
  tokenA: TokenAmount;
  tokenB: TokenAmount;
  batcherFee: string;
  lvlDeposit: string;
  poolFee: string;
  poolId: string;
};

export const getOpenOrders = async (stakeKeyHash: string) =>
  (await getOrders(stakeKeyHash)).map((order) => ({
    protocol: order.provider,
    depposit: order.deposit,
    utxo: order.utxo,
    send: {
      address: {
        policyId: order.from.token.split(".")[0],
        assetName: order.from.token.split(".")[1],
      },
      amount: order.from.amount,
    },
    receive: {
      address: {
        policyId: order.to.token.split(".")[0],
        assetName: order.to.token.split(".")[1],
      },
      amount: order.to.amount,
    },
  }));

export const getCancelOrderTx = async (
  orderUTxO: string,
  collateralUTxOs: string,
  walletAddress: string
) => await cancelOrder(orderUTxO, collateralUTxOs, walletAddress);

export const getOrderDatum = async (order: OrderDetails): Promise<OrderDatum> => {
  const { address, hash, datum } = await createOrder({
    address: order.walletAddress,
    protocol: order.protocol,
    poolId: order.poolId,
    sell: {
      policyId: order.send.address.policyId,
      assetName: order.send.address.assetName,
      amount: order.send.amount,
    },
    buy: {
      policyId: order.receive.address.policyId,
      assetName: order.receive.address.assetName,
      amount: order.receive.amount,
    },
  });

  return {
    contractAddress: address,
    datumHash: hash,
    datum,
  };
};

export const getSupportedTokens = async (
  baseToken?: TokenAddress
): Promise<Token[]> => getTokens(baseToken?.policyId, baseToken?.assetName);

export const getTokenPairPools = async (
  sendToken: TokenAddress,
  receiveToken: TokenAddress
): Promise<TokenPairPool[]> =>
  (await getPools(sendToken, receiveToken)).map((pool) => ({
    protocol: pool.provider as Protocol,
    lpToken: pool.lpToken && {
      address: {
        policyId: pool.lpToken.token.split(".")[0],
        assetName: pool.lpToken.token.split(".")[1],
      },
      amount: pool.lpToken.amount,
    },
    batcherFee: pool.batcherFee.amount,
    lvlDeposit: pool.deposit.toString(),
    tokenA: {
      address: {
        policyId: pool.tokenA.token.split(".")[0],
        assetName: pool.tokenA.token.split(".")[1],
      },
      amount: pool.tokenA.amount,
    },
    tokenB: {
      address: {
        policyId: pool.tokenB.token.split(".")[0],
        assetName: pool.tokenB.token.split(".")[1],
      },
      amount: pool.tokenB.amount,
    },
    poolFee: pool.fee,
    poolId: pool.poolId,
  }));

export const calculateAmountsGivenInput = (
  pool: TokenPairPool,
  from: TokenAmount
): TokenPair => {
  const poolA = BigInt(pool.tokenA.amount);
  const poolB = BigInt(pool.tokenB.amount);
  const poolsProduct = poolA * poolB; // fee is part of tokens sent -> this means the constant product increases after the swap!

  const fromAmount = BigInt(from.amount);

  const poolFee = ceilDivision(
    BigInt(Number(pool.poolFee) * 1000) * fromAmount,
    BigInt(100 * 1000)
  );

  const getReceiveAmount = (poolA_: bigint, poolB_: bigint) => {
    const newPoolA = poolA_ + fromAmount - poolFee;
    const newPoolB = ceilDivision(poolsProduct, newPoolA);

    return (poolB_ - newPoolB).toString();
  };

  const receive = sameToken(from.address, pool.tokenA.address)
    ? { amount: getReceiveAmount(poolA, poolB), address: pool.tokenB.address }
    : { amount: getReceiveAmount(poolB, poolA), address: pool.tokenA.address };

  return { send: from, receive };
};

export const calculateAmountsGivenOutput = (
  pool: TokenPairPool,
  to: TokenAmount
): TokenPair => {
  const poolA = BigInt(pool.tokenA.amount);
  const poolB = BigInt(pool.tokenB.amount);
  const poolsProduct = poolA * poolB; // fee is part of tokens sent -> this means the constant product increases after the swap!

  const toAmount = BigInt(to.amount);

  const poolFee = BigInt(100 * 1000) - BigInt(Number(pool.poolFee) * 1000);

  const getSendAmount = (poolA_: bigint, poolB_: bigint) => {
    const newPoolA =
      poolA_ - (poolA_ > toAmount ? toAmount : poolA_ - BigInt(1));
    const newPoolB = ceilDivision(poolsProduct + newPoolA, newPoolA);
    return ceilDivision(
      (newPoolB - poolB_) * BigInt(100 * 1000),
      poolFee
    ).toString();
  };

  const send = sameToken(to.address, pool.tokenA.address)
    ? { amount: getSendAmount(poolA, poolB), address: pool.tokenB.address }
    : { amount: getSendAmount(poolB, poolA), address: pool.tokenA.address };

  return { send, receive: to };
};

export const constructLimitOrder = (
  send: TokenAmount,
  receive: TokenAmount,
  pool: TokenPairPool,
  slippage: number,
  address: string
): OrderDetails => {
  const receiveAmountWithSlippage = calculateAmountWithSlippage(
    BigInt(receive.amount),
    BigInt(slippage)
  );

  return {
    protocol: pool.protocol,
    poolId: pool.poolId,
    send: send,
    receive: {
      address: receive.address,
      amount: receiveAmountWithSlippage.toString(),
    },
    walletAddress: address,
  };
};

export const constructMarketOrder = (
  send: TokenAmount,
  receive: TokenAddress,
  pools: TokenPairPool[],
  slippage: number,
  address: string
): OrderDetails | undefined => {
  if (pools?.length === 0) {
    return undefined;
  }

  const findBestOrder = (
    order: OrderDetails | undefined,
    pool: TokenPairPool
  ): OrderDetails => {
    const tokenPair = calculateAmountsGivenInput(pool, send);

    const receiveAmount = BigInt(tokenPair.receive.amount);
    const receiveAmountWithSlippage = calculateAmountWithSlippage(
      receiveAmount,
      BigInt(slippage)
    );

    const newOrder: OrderDetails = {
      protocol: pool.protocol,
      poolId: pool.poolId,
      send: tokenPair.send,
      receive: {
        address: receive,
        amount: receiveAmountWithSlippage.toString(),
      },
      walletAddress: address,
    };

    if (
      order === undefined ||
      BigInt(order.receive.amount) < BigInt(newOrder.receive.amount)
    ) {
      return newOrder;
    }

    return order;
  };

  return pools.reduce(findBestOrder, undefined);
};

const calculateAmountWithSlippage = (
  amount: bigint,
  slippage: bigint
): bigint => {
  const slippageAmount = ceilDivision(
    BigInt(1000) * slippage * amount,
    BigInt(100 * 1000)
  );

  return amount - slippageAmount;
};

function ceilDivision(a: bigint, b: bigint): bigint {
  return (a + b - BigInt(1)) / b;
}

function sameToken(a: TokenAddress, b: TokenAddress): boolean {
  return (
    a != null &&
    b != null &&
    a != undefined &&
    b != undefined &&
    a.policyId === b.policyId &&
    a.assetName === b.assetName
  );
}
