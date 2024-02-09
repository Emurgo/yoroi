export declare const SWAP_API_ENDPOINTS: {
    readonly mainnet: {
        readonly getPrice: "https://api.muesliswap.com/price";
        readonly getPoolsPair: "https://onchain2.muesliswap.com/pools/pair";
        readonly getLiquidityPools: "https://api.muesliswap.com/liquidity/pools";
        readonly getOrders: "https://onchain2.muesliswap.com/orders/all/";
        readonly getCompletedOrders: "https://api.muesliswap.com/orders/v2";
        readonly getTokenPairs: "https://api.muesliswap.com/list";
        readonly getTokens: "https://api.muesliswap.com/token-list";
        readonly constructSwapDatum: "https://aggregator.muesliswap.com/constructSwapDatum";
        readonly cancelSwapTransaction: "https://aggregator.muesliswap.com/cancelSwapTransaction";
    };
    readonly preprod: {
        readonly getPrice: "https://preprod.api.muesliswap.com/price";
        readonly getPoolsPair: "https://preprod.pools.muesliswap.com/pools/pair";
        readonly getLiquidityPools: "https://preprod.api.muesliswap.com/liquidity/pools";
        readonly getOrders: "https://preprod.pools.muesliswap.com/orders/all/";
        readonly getCompletedOrders: "https://api.muesliswap.com/orders/v2";
        readonly getTokenPairs: "https://preprod.api.muesliswap.com/list";
        readonly getTokens: "https://preprod.api.muesliswap.com/token-list";
        readonly constructSwapDatum: "https://aggregator.muesliswap.com/constructTestnetSwapDatum";
        readonly cancelSwapTransaction: "https://aggregator.muesliswap.com/cancelTestnetSwapTransaction";
    };
};
export declare const axiosClient: import("axios").AxiosInstance;
