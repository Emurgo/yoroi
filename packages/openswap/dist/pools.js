"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPoolsPair = exports.getLiquidityPools = void 0;
const config_1 = require("./config");
async function getLiquidityPools(deps, args) {
    const { tokenA, tokenB, providers } = args;
    const { network, client } = deps;
    const params = {
        'token-a': tokenA,
        'token-b': tokenB,
        'providers': providers.join(','),
    };
    const apiUrl = config_1.SWAP_API_ENDPOINTS[network].getLiquidityPools;
    const response = await client.get('', {
        baseURL: apiUrl,
        params,
    });
    if (response.status !== 200) {
        throw new Error('Failed to fetch liquidity pools for token pair', {
            cause: response.data,
        });
    }
    return response.data;
}
exports.getLiquidityPools = getLiquidityPools;
async function getPoolsPair(deps, args) {
    const { tokenA, tokenB } = args;
    const { network, client } = deps;
    const params = {
        'policy-id1': tokenA.policyId,
        'policy-id2': tokenB.policyId,
    };
    if ('assetName' in tokenA)
        params.tokenname1 = tokenA.assetName;
    if ('assetName' in tokenB)
        params.tokenname2 = tokenB.assetName;
    // note: {tokenname-hex} will overwrites {tokenname}
    if ('assetNameHex' in tokenA)
        params['tokenname-hex1'] = tokenA.assetNameHex;
    if ('assetNameHex' in tokenB)
        params['tokenname-hex2'] = tokenB.assetNameHex;
    const apiUrl = config_1.SWAP_API_ENDPOINTS[network].getPoolsPair;
    const response = await client.get('', {
        baseURL: apiUrl,
        params,
    });
    if (response.status !== 200) {
        throw new Error('Failed to fetch pools pair for token pair', {
            cause: response.data,
        });
    }
    return response.data;
}
exports.getPoolsPair = getPoolsPair;
