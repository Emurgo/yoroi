import { AxiosInstance } from 'axios';
export type CancelOrderRequest = {
    orderUTxO: string;
    collateralUTxO: string;
    walletAddress: string;
};
export type CreateOrderRequest = {
    walletAddress: string;
    protocol: Provider;
    poolId?: string;
    sell: {
        policyId: string;
        assetName: string;
        amount: string;
    };
    buy: {
        policyId: string;
        assetName: string;
        amount: string;
    };
};
export type CreateOrderResponse = {
    status: 'failed';
    reason?: string;
} | {
    status: 'success';
    hash: string;
    datum: string;
    address: string;
};
export type OpenOrder = {
    provider: Provider;
    owner: string;
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
export type OpenOrderResponse = OpenOrder[];
export type CompletedOrder = {
    toToken: {
        address: {
            policyId: string;
            name: string;
        };
    };
    toAmount: string;
    fromToken: {
        address: {
            policyId: string;
            name: string;
        };
    };
    fromAmount: string;
    placedAt: number;
    status: string;
    receivedAmount: string;
    paidAmount: string;
    finalizedAt: any;
    txHash: string;
    outputIdx: number;
    attachedLvl: string;
    scriptVersion: string;
    pubKeyHash: string;
    feeField: number;
};
export type CompletedOrderResponse = CompletedOrder[];
export type Provider = 'minswap' | 'sundaeswap' | 'wingriders' | 'muesliswap' | 'muesliswap_v1' | 'muesliswap_v2' | 'muesliswap_v3' | 'muesliswap_v4' | 'vyfi' | 'spectrum';
export type Network = 'mainnet' | 'preprod';
export type PoolPair = {
    provider: Provider;
    fee: string;
    tokenA: {
        amount: string;
        token: string;
    };
    tokenB: {
        amount: string;
        token: string;
    };
    price: number;
    batcherFee: {
        amount: string;
        token: string;
    };
    deposit: number;
    utxo: string;
    poolId: string;
    timestamp: string;
    lpToken: {
        amount: string;
        token: string;
    };
    depositFee: {
        amount: string;
        token: string;
    };
    batcherAddress: string;
};
export type PoolPairResponse = PoolPair[];
export type TokenPair = {
    info: {
        supply: {
            total: string;
            circulating: string | null;
        };
        status: 'verified' | 'unverified' | 'scam' | 'outdated';
        address: {
            policyId: string;
            name: string;
        };
        symbol: string;
        image?: string;
        website: string;
        description: string;
        decimalPlaces: number;
        categories: string[];
        sign?: string;
    };
    price: {
        volume: {
            base: string;
            quote: string;
        };
        volumeChange: {
            base: number;
            quote: number;
        };
        price: number;
        askPrice: number;
        bidPrice: number;
        priceChange: {
            '24h': string;
            '7d': string;
        };
        quoteDecimalPlaces: number;
        baseDecimalPlaces: number;
        price10d: number[];
    };
};
export type TokenPairsResponse = TokenPair[];
export type TokenInfo = Omit<TokenPair['info'], 'sign'>;
export type ListTokensResponse = TokenInfo[];
export type TokenAddress = {
    policyId: string;
    assetName: string;
} | {
    policyId: string;
    assetNameHex: string;
};
export type ApiDeps = {
    network: Network;
    client: AxiosInstance;
};
export type PriceAddress = {
    policyId: string;
    name: string;
};
type VolumeAggregator = {
    [key in Provider]?: {
        quote: number;
        base: number;
    };
};
export type PriceResponse = {
    baseDecimalPlaces: number;
    quoteDecimalPlaces: number;
    baseAddress: PriceAddress;
    quoteAddress: PriceAddress;
    askPrice: number;
    bidPrice: number;
    price: number;
    volume: {
        base: string;
        quote: string;
    };
    volumeAggregator: VolumeAggregator;
    volumeTotal: {
        base: number;
        quote: number;
    };
    volumeChange: {
        base: number;
        quote: number;
    };
    priceChange: {
        '24h': string;
        '7d': string;
    };
    marketCap: number;
};
export type LiquidityPoolResponse = LiquidityPool[];
export type LiquidityPool = {
    tokenA: {
        address: {
            policyId: string;
            name: string;
        };
        symbol?: string;
        image?: string;
        decimalPlaces: number;
        amount: string;
        status: string;
        priceAda: number;
    };
    tokenB: {
        address: {
            policyId: string;
            name: string;
        };
        symbol?: string;
        image?: string;
        decimalPlaces: number;
        amount: string;
        status: string;
        priceAda: number;
    };
    feeToken: {
        address: {
            policyId: string;
            name: string;
        };
        symbol?: string;
        image?: string;
        decimalPlaces: number;
    };
    batcherFee: string;
    lvlDeposit: string;
    poolFee: string;
    lpToken: {
        address?: {
            policyId: string;
            name: string;
        };
        amount?: string;
    };
    poolId: string;
    provider: Provider;
    txHash?: string;
    outputIdx?: number;
    volume24h?: number;
    volume7d?: number;
    liquidityApy?: number;
    priceASqrt?: any;
    priceBSqrt?: any;
    batcherAddress: string;
};
export {};
