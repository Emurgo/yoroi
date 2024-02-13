import type { ApiDeps, LiquidityPoolResponse, PoolPairResponse, Provider, TokenAddress } from './types';
export declare function getLiquidityPools(deps: ApiDeps, args: {
    tokenA: string;
    tokenB: string;
    providers: ReadonlyArray<Provider>;
}): Promise<LiquidityPoolResponse>;
export declare function getPoolsPair(deps: ApiDeps, args: {
    tokenA: TokenAddress;
    tokenB: TokenAddress;
}): Promise<PoolPairResponse>;
