"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrice = void 0;
const config_1 = require("./config");
async function getPrice(deps, args) {
    const { baseToken, quoteToken } = args;
    const { network, client } = deps;
    const params = {
        'base-policy-id': baseToken.policyId,
        'base-token-name': baseToken.policyId,
        'quote-policy-id': quoteToken.policyId,
        'quote-token-name': quoteToken.policyId,
    };
    const apiUrl = config_1.SWAP_API_ENDPOINTS[network].getPrice;
    const response = await client.get('', {
        baseURL: apiUrl,
        params,
    });
    if (response.status !== 200) {
        throw new Error('Failed to fetch price for token pair', {
            cause: response.data,
        });
    }
    return response.data;
}
exports.getPrice = getPrice;
