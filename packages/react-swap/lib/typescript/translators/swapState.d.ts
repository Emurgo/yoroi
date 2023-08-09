import { Balance, Swap } from '@yoroi/types';
export declare type SwapState = Readonly<{
    createOrder: Swap.CreateOrderData & {
        type: Swap.OrderType;
        datum: string;
        datumHash: string;
    };
    unsignedTx: any | undefined;
}>;
export declare type SwapCreateOrderActions = Readonly<{
    orderTypeChanged: (orderType: Swap.OrderType) => void;
    fromAmountChanged: (fromAmount: Balance.Amount) => void;
    toAmountChanged: (toAmount: Balance.Amount) => void;
    protocolChanged: (protocol: Swap.Protocol) => void;
    poolIdChanged: (poolId: string) => void;
    slippageChanged: (slippage: number) => void;
    txPayloadChanged: (txPayload: Swap.CreateOrderResponse) => void;
}>;
export declare enum SwapCreateOrderActionType {
    OrderTypeChanged = "orderTypeChanged",
    FromAmountChanged = "fromAmountChanged",
    ToAmountChanged = "toAmountChanged",
    ProtocolChanged = "protocolChanged",
    PoolIdChanged = "poolIdChanged",
    SlippageChanged = "slippageChanged",
    TxPayloadChanged = "txPayloadChanged"
}
declare type SwapCreateOrderAction = {
    type: SwapCreateOrderActionType.OrderTypeChanged;
    orderType: Swap.OrderType;
} | {
    type: SwapCreateOrderActionType.FromAmountChanged;
    fromAmount: Balance.Amount;
} | {
    type: SwapCreateOrderActionType.ToAmountChanged;
    toAmount: Balance.Amount;
} | {
    type: SwapCreateOrderActionType.ProtocolChanged;
    protocol: Swap.Protocol;
} | {
    type: SwapCreateOrderActionType.PoolIdChanged;
    poolId: string;
} | {
    type: SwapCreateOrderActionType.SlippageChanged;
    slippage: number;
} | {
    type: SwapCreateOrderActionType.TxPayloadChanged;
    txPayload: Swap.CreateOrderResponse;
};
export declare type SwapActions = Readonly<{
    unsignedTxChanged: (unsignedTx: any | undefined) => void;
    resetState: () => void;
}>;
export declare enum SwapActionType {
    UnsignedTxChanged = "unsignedTxChanged",
    ResetState = "resetState"
}
declare type SwapAction = {
    type: SwapActionType.UnsignedTxChanged;
    unsignedTx: any | undefined;
} | {
    type: SwapActionType.ResetState;
};
export declare const combinedSwapReducers: (state: SwapState, action: SwapCreateOrderAction | SwapAction) => {
    readonly createOrder: Swap.CreateOrderData & {
        type: Swap.OrderType;
        datum: string;
        datumHash: string;
    };
    readonly unsignedTx: any | undefined;
};
export declare const defaultSwapState: SwapState;
export declare const defaultSwapActions: {
    readonly unsignedTxChanged: (unsignedTx: any | undefined) => void;
    readonly resetState: () => void;
    readonly orderTypeChanged: (orderType: Swap.OrderType) => void;
    readonly fromAmountChanged: (fromAmount: Balance.Amount) => void;
    readonly toAmountChanged: (toAmount: Balance.Amount) => void;
    readonly protocolChanged: (protocol: Swap.Protocol) => void;
    readonly poolIdChanged: (poolId: string) => void;
    readonly slippageChanged: (slippage: number) => void;
    readonly txPayloadChanged: (txPayload: Swap.CreateOrderResponse) => void;
};
export {};
//# sourceMappingURL=swapState.d.ts.map