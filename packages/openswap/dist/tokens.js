"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTokens = void 0;
const config_1 = require("./config");
async function getTokens(deps) {
    const { network, client } = deps;
    if (network === 'preprod')
        return [];
    const apiUrl = config_1.SWAP_API_ENDPOINTS[network].getTokens;
    const response = await client.get('', {
        baseURL: apiUrl,
    });
    if (response.status !== 200) {
        throw new Error('Failed to fetch tokens', { cause: response.data });
    }
    return response.data;
}
exports.getTokens = getTokens;
