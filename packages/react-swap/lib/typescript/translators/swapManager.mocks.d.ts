import { Swap } from '@yoroi/types';
export declare const swapManagerMocks: {
    cancelOrderResponse: string;
    createOrderResponse: import("@yoroi/types/src/swap/order").SwapCreateOrderResponse;
    listOrdersByStatusOpenResponse: import("@yoroi/types/src/swap/order").SwapOpenOrder[];
    listPoolsByPairResponse: import("@yoroi/types/src/swap/pool").SwapPool[];
    listPairsByTokenResponse: import("@yoroi/types/src/balance/token").BalanceToken[];
    slippageResponse: number;
    createOrder: {
        success: () => Promise<import("@yoroi/types/src/swap/order").SwapCreateOrderResponse>;
        delayed: (timeout: number) => Promise<unknown>;
        loading: () => Promise<unknown>;
        error: {
            unknown: () => Promise<never>;
        };
    };
    cancelOrder: {
        success: () => Promise<string>;
        delayed: (timeout?: number | undefined) => Promise<unknown>;
        loading: () => Promise<unknown>;
        error: {
            unknown: () => Promise<never>;
        };
    };
    getOrders: {
        success: () => Promise<import("@yoroi/types/src/swap/order").SwapOpenOrder[]>;
        delayed: (timeout?: number | undefined) => Promise<unknown>;
        empty: () => Promise<never[]>;
        loading: () => Promise<unknown>;
        error: {
            unknown: () => Promise<never>;
        };
    };
    getPools: {
        success: () => Promise<import("@yoroi/types/src/swap/pool").SwapPool[]>;
        delayed: (timeout?: number | undefined) => Promise<unknown>;
        empty: () => Promise<never[]>;
        loading: () => Promise<unknown>;
        error: {
            unknown: () => Promise<never>;
        };
    };
    getTokens: {
        success: () => Promise<import("@yoroi/types/src/balance/token").BalanceToken[]>;
        delayed: (timeout?: number | undefined) => Promise<unknown>;
        empty: () => Promise<never[]>;
        loading: () => Promise<unknown>;
        error: {
            unknown: () => Promise<never>;
        };
    };
    slippage: {
        success: {
            read: () => Promise<number>;
            remove: () => Promise<void>;
            save: () => Promise<void>;
            key: string;
        };
        empty: {
            read: () => Promise<undefined>;
            remove: () => Promise<void>;
            save: () => Promise<void>;
            key: string;
        };
        error: {
            unknown: {
                read: () => Promise<never>;
                remove: () => Promise<never>;
                save: () => Promise<never>;
                key: string;
            };
        };
    };
    clear: {
        success: () => Promise<void>;
        error: {
            unknown: () => Promise<never>;
        };
    };
};
export declare const mockSwapManager: Readonly<Swap.Manager>;
export declare const mockSwapManagerDefault: Readonly<Swap.Manager>;
//# sourceMappingURL=swapManager.mocks.d.ts.map