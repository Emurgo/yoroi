"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supportedProviders = exports.supportedNetworks = exports.OpenSwapApi = void 0;
const orders_1 = require("./orders");
const token_pairs_1 = require("./token-pairs");
const tokens_1 = require("./tokens");
const config_1 = require("./config");
const price_1 = require("./price");
const pools_1 = require("./pools");
class OpenSwapApi {
    network;
    client;
    constructor(network, client = config_1.axiosClient) {
        this.network = network;
        this.client = client;
        if (!exports.supportedNetworks.includes(network)) {
            throw new Error(`Supported networks are ${exports.supportedNetworks.join(', ')}, got ${network}`);
        }
    }
    async createOrder(orderData) {
        return (0, orders_1.createOrder)({ network: this.network, client: this.client }, orderData);
    }
    async cancelOrder(orderData) {
        return (0, orders_1.cancelOrder)({ network: this.network, client: this.client }, orderData);
    }
    async getOrders(stakeKeyHash) {
        return (0, orders_1.getOrders)({ network: this.network, client: this.client }, { stakeKeyHash });
    }
    async getCompletedOrders(stakeKeyHash) {
        return (0, orders_1.getCompletedOrders)({ network: this.network, client: this.client }, { stakeKeyHash });
    }
    async getPrice({ baseToken, quoteToken, }) {
        return (0, price_1.getPrice)({ network: this.network, client: this.client }, { baseToken, quoteToken });
    }
    async getPoolsPair({ tokenA, tokenB, }) {
        return (0, pools_1.getPoolsPair)({ network: this.network, client: this.client }, { tokenA, tokenB });
    }
    async getLiquidityPools({ tokenA, tokenB, providers, }) {
        return (0, pools_1.getLiquidityPools)({ network: this.network, client: this.client }, { tokenA, tokenB, providers });
    }
    async getTokenPairs({ policyId = '', assetName = '' } = {}) {
        const tokenPairs = await (0, token_pairs_1.getTokenPairs)({ network: this.network, client: this.client }, { policyId, assetName });
        return tokenPairs;
    }
    async getTokens() {
        return (0, tokens_1.getTokens)({ network: this.network, client: this.client });
    }
}
exports.OpenSwapApi = OpenSwapApi;
exports.supportedNetworks = [
    'mainnet',
    'preprod',
];
exports.supportedProviders = [
    'minswap',
    'muesliswap_v1',
    'muesliswap_v3',
    'muesliswap_v4',
    'spectrum',
    'sundaeswap',
    'vyfi',
    'wingriders',
    'muesliswap_v2',
];
