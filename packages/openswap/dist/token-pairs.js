"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTokenPairs = void 0;
const config_1 = require("./config");
async function getTokenPairs(deps, { policyId = '', assetName = '' } = {}) {
    const { network, client } = deps;
    if (network === 'preprod')
        return [];
    const apiUrl = config_1.SWAP_API_ENDPOINTS[network].getTokenPairs;
    const response = await client.get('', {
        baseURL: apiUrl,
        params: {
            'base-policy-id': policyId,
            'base-tokenname': assetName,
        },
    });
    if (response.status !== 200) {
        throw new Error('Failed to fetch token pairs', { cause: response.data });
    }
    return response.data;
}
exports.getTokenPairs = getTokenPairs;
