import { AxiosInstance } from 'axios';
import { CancelOrderRequest, CreateOrderRequest, Network, Provider, PriceAddress, TokenAddress } from './types';
export declare class OpenSwapApi {
    readonly network: Network;
    private readonly client;
    constructor(network: Network, client?: AxiosInstance);
    createOrder(orderData: CreateOrderRequest): Promise<import("./types").CreateOrderResponse>;
    cancelOrder(orderData: CancelOrderRequest): Promise<string>;
    getOrders(stakeKeyHash: string): Promise<import("./types").OpenOrderResponse>;
    getCompletedOrders(stakeKeyHash: string): Promise<import("./types").CompletedOrderResponse>;
    getPrice({ baseToken, quoteToken, }: {
        baseToken: PriceAddress;
        quoteToken: PriceAddress;
    }): Promise<import("./types").PriceResponse>;
    getPoolsPair({ tokenA, tokenB, }: {
        tokenA: TokenAddress;
        tokenB: TokenAddress;
    }): Promise<import("./types").PoolPairResponse>;
    getLiquidityPools({ tokenA, tokenB, providers, }: {
        tokenA: string;
        tokenB: string;
        providers: ReadonlyArray<Provider>;
    }): Promise<import("./types").LiquidityPoolResponse>;
    getTokenPairs({ policyId, assetName }?: {
        policyId?: string | undefined;
        assetName?: string | undefined;
    }): Promise<import("./types").TokenPairsResponse>;
    getTokens(): Promise<import("./types").ListTokensResponse>;
}
export declare const supportedNetworks: ReadonlyArray<Network>;
export declare const supportedProviders: ReadonlyArray<Provider>;
