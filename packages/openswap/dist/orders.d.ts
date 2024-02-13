import type { ApiDeps, CancelOrderRequest, CreateOrderRequest, CreateOrderResponse, CompletedOrderResponse, OpenOrderResponse } from './types';
export declare function createOrder(deps: ApiDeps, args: CreateOrderRequest): Promise<CreateOrderResponse>;
export declare function cancelOrder(deps: ApiDeps, args: CancelOrderRequest): Promise<string>;
export declare function getOrders(deps: ApiDeps, args: {
    stakeKeyHash: string;
}): Promise<OpenOrderResponse>;
export declare function getCompletedOrders(deps: ApiDeps, args: {
    stakeKeyHash: string;
}): Promise<CompletedOrderResponse>;
