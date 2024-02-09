"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompletedOrders = exports.getOrders = exports.cancelOrder = exports.createOrder = void 0;
const config_1 = require("./config");
async function createOrder(deps, args) {
    const { network, client } = deps;
    const apiUrl = config_1.SWAP_API_ENDPOINTS[network].constructSwapDatum;
    const response = await client.get('/', {
        baseURL: apiUrl,
        params: {
            walletAddr: args.walletAddress,
            protocol: args.protocol,
            poolId: args.poolId,
            sellTokenPolicyID: args.sell.policyId,
            sellTokenNameHex: args.sell.assetName,
            sellAmount: args.sell.amount,
            buyTokenPolicyID: args.buy.policyId,
            buyTokenNameHex: args.buy.assetName,
            buyAmount: args.buy.amount,
        },
    });
    if (response.status !== 200) {
        throw new Error('Failed to construct swap datum', {
            cause: response.data,
        });
    }
    if (response.data.status === 'failed') {
        throw new Error(response.data.reason ?? 'Unexpected error occurred');
    }
    return response.data;
}
exports.createOrder = createOrder;
async function cancelOrder(deps, args) {
    const { network, client } = deps;
    const apiUrl = config_1.SWAP_API_ENDPOINTS[network].cancelSwapTransaction;
    const response = await client.get('/', {
        baseURL: apiUrl,
        params: {
            wallet: args.walletAddress,
            utxo: args.orderUTxO,
            collateralUtxo: args.collateralUTxO,
        },
    });
    if (response.status !== 200) {
        throw new Error('Failed to cancel swap transaction', {
            cause: response.data,
        });
    }
    return response.data.cbor;
}
exports.cancelOrder = cancelOrder;
async function getOrders(deps, args) {
    const { network, client } = deps;
    const { stakeKeyHash } = args;
    const apiUrl = config_1.SWAP_API_ENDPOINTS[network].getOrders;
    const response = await client.get(apiUrl, {
        params: {
            'stake-key-hash': stakeKeyHash,
        },
    });
    if (response.status !== 200) {
        throw new Error(`Failed to get orders for ${stakeKeyHash}`, {
            cause: response.data,
        });
    }
    return response.data;
}
exports.getOrders = getOrders;
async function getCompletedOrders(deps, args) {
    const { network, client } = deps;
    const { stakeKeyHash } = args;
    const apiUrl = config_1.SWAP_API_ENDPOINTS[network].getCompletedOrders;
    const response = await client.get(apiUrl, {
        params: {
            'stake-key-hash': stakeKeyHash,
            'canceled': 'n',
            'open': 'n',
            'matched': 'y',
            'v2_only': 'y',
        },
    });
    if (response.status !== 200) {
        throw new Error(`Failed to get orders for ${stakeKeyHash}`, {
            cause: response.data,
        });
    }
    return response.data.filter((order) => order.status === 'matched');
}
exports.getCompletedOrders = getCompletedOrders;
