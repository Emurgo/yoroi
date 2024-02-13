import type { ApiDeps, TokenPairsResponse } from './types';
export declare function getTokenPairs(deps: ApiDeps, { policyId, assetName }?: {
    policyId?: string | undefined;
    assetName?: string | undefined;
}): Promise<TokenPairsResponse>;
