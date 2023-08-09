import * as React from 'react';
import { UseMutationOptions } from 'react-query';
import { Swap } from '@yoroi/types';
import { SwapState } from './swapState';
export declare const SwapProvider: ({ children, swapManager, initialState, }: {
    children: React.ReactNode;
    swapManager: Readonly<Swap.Manager>;
    initialState?: Readonly<Partial<Readonly<{
        createOrder: ({
            amounts: {
                sell: import("@yoroi/types/src/balance/token").BalanceAmount;
                buy: import("@yoroi/types/src/balance/token").BalanceAmount;
            };
            address: string;
            slippage: number;
        } & {
            protocol: Pick<import("@yoroi/types/src/swap/protocol").SwapProtocol, number | "toString" | "charAt" | "charCodeAt" | "concat" | "indexOf" | "lastIndexOf" | "localeCompare" | "match" | "replace" | "search" | "slice" | "split" | "substring" | "toLowerCase" | "toLocaleLowerCase" | "toUpperCase" | "toLocaleUpperCase" | "trim" | "length" | "substr" | "valueOf" | "codePointAt" | "includes" | "endsWith" | "normalize" | "repeat" | "startsWith" | "anchor" | "big" | "blink" | "bold" | "fixed" | "fontcolor" | "fontsize" | "italics" | "link" | "small" | "strike" | "sub" | "sup" | "padStart" | "padEnd" | "trimEnd" | "trimStart" | "trimLeft" | "trimRight" | "matchAll" | "replaceAll" | "at">;
            poolId: string | undefined;
        } & {
            type: import("@yoroi/types/src/swap/order").SwapOrderType;
            datum: string;
            datumHash: string;
        }) | ({
            amounts: {
                sell: import("@yoroi/types/src/balance/token").BalanceAmount;
                buy: import("@yoroi/types/src/balance/token").BalanceAmount;
            };
            address: string;
            slippage: number;
        } & {
            protocol: "sundaeswap";
            poolId: string;
        } & {
            type: import("@yoroi/types/src/swap/order").SwapOrderType;
            datum: string;
            datumHash: string;
        });
        unsignedTx: any;
    }>>> | undefined;
}) => JSX.Element;
export declare const useSwap: () => React.PropsWithChildren<Readonly<{
    createOrder: ({
        amounts: {
            sell: import("@yoroi/types/src/balance/token").BalanceAmount;
            buy: import("@yoroi/types/src/balance/token").BalanceAmount;
        };
        address: string;
        slippage: number;
    } & {
        protocol: Pick<import("@yoroi/types/src/swap/protocol").SwapProtocol, number | "toString" | "charAt" | "charCodeAt" | "concat" | "indexOf" | "lastIndexOf" | "localeCompare" | "match" | "replace" | "search" | "slice" | "split" | "substring" | "toLowerCase" | "toLocaleLowerCase" | "toUpperCase" | "toLocaleUpperCase" | "trim" | "length" | "substr" | "valueOf" | "codePointAt" | "includes" | "endsWith" | "normalize" | "repeat" | "startsWith" | "anchor" | "big" | "blink" | "bold" | "fixed" | "fontcolor" | "fontsize" | "italics" | "link" | "small" | "strike" | "sub" | "sup" | "padStart" | "padEnd" | "trimEnd" | "trimStart" | "trimLeft" | "trimRight" | "matchAll" | "replaceAll" | "at">;
        poolId: string | undefined;
    } & {
        type: import("@yoroi/types/src/swap/order").SwapOrderType;
        datum: string;
        datumHash: string;
    }) | ({
        amounts: {
            sell: import("@yoroi/types/src/balance/token").BalanceAmount;
            buy: import("@yoroi/types/src/balance/token").BalanceAmount;
        };
        address: string;
        slippage: number;
    } & {
        protocol: "sundaeswap";
        poolId: string;
    } & {
        type: import("@yoroi/types/src/swap/order").SwapOrderType;
        datum: string;
        datumHash: string;
    });
    unsignedTx: any;
}> & Readonly<{
    orderTypeChanged: (orderType: import("@yoroi/types/src/swap/order").SwapOrderType) => void;
    fromAmountChanged: (fromAmount: import("@yoroi/types/src/balance/token").BalanceAmount) => void;
    toAmountChanged: (toAmount: import("@yoroi/types/src/balance/token").BalanceAmount) => void;
    protocolChanged: (protocol: import("@yoroi/types/src/swap/protocol").SwapProtocol) => void;
    poolIdChanged: (poolId: string) => void;
    slippageChanged: (slippage: number) => void;
    txPayloadChanged: (txPayload: import("@yoroi/types/src/swap/order").SwapCreateOrderResponse) => void;
}> & Readonly<{
    unsignedTxChanged: (unsignedTx: any) => void;
    resetState: () => void;
}> & Readonly<{
    clearStorage: () => Promise<void>;
    slippage: {
        read(): Promise<number>;
        remove(): Promise<void>;
        save(slippage: number): Promise<void>;
        key: string;
    };
    order: {
        cancel: (orderData: import("@yoroi/types/src/swap/order").SwapCancelOrderData) => Promise<string>;
        create: (orderData: import("@yoroi/types/src/swap/order").SwapCreateOrderData) => Promise<import("@yoroi/types/src/swap/order").SwapCreateOrderResponse>;
        list: {
            byStatusOpen: () => Promise<import("@yoroi/types/src/swap/order").SwapOpenOrder[]>;
        };
    };
    pairs: {
        list: {
            byToken: (tokenBase: string) => Promise<import("@yoroi/types/src/balance/token").BalanceToken[]>;
        };
    };
    pools: {
        list: {
            byPair: (args: {
                tokenA: string;
                tokenB: string;
            }) => Promise<import("@yoroi/types/src/swap/pool").SwapPool[]>;
        };
    };
}>>;
export declare const useSwapSlippage: () => number;
export declare const useSwapSetSlippage: (options?: UseMutationOptions<void, Error, number, unknown> | undefined) => any;
export declare const useSwapSettings: () => {
    slippage: number;
    setSlippage: (newSlippage: number) => any;
};
//# sourceMappingURL=reactjs.d.ts.map