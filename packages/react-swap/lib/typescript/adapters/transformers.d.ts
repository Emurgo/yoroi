import { Swap, Balance } from '@yoroi/types';
import { Order, Pool, Token } from '@yoroi/api-openswap';
export declare const asOpenswapTokenId: (yoroiTokenId: string) => {
    policyId: string;
    assetName: string;
};
export declare const asYoroiTokenId: ({ policyId, name, }: {
    policyId: string;
    name: string;
}) => Balance.Token['info']['id'];
export declare const asOpenswapAmount: (yoroiAmount: Balance.Amount) => {
    readonly amount: any;
    readonly assetName: string;
    readonly policyId: string;
};
export declare const asYoroiOrder: (openswapOrder: Order) => {
    readonly from: import("@yoroi/types/src/balance/token").BalanceAmount;
    readonly to: import("@yoroi/types/src/balance/token").BalanceAmount;
    readonly deposit: import("@yoroi/types/src/balance/token").BalanceAmount;
    readonly provider: import("@yoroi/types/src/swap/protocol").SwapProtocol;
    readonly utxo: string;
};
export declare const asYoroiBalanceToken: (openswapToken: Token) => Balance.Token;
export declare const asYoroiPool: (openswapPool: Pool) => Swap.Pool;
export declare const asYoroiAmount: (openswapAmount: {
    amount: string;
    token: string;
}) => Balance.Amount;
export declare const asYoroiPools: (openswapPools: Pool[]) => Swap.Pool[];
export declare const asYoroiBalanceTokens: (openswapTokens: Token[]) => Balance.Token[];
export declare const asYoroiOrders: (openswapOrders: Order[]) => Swap.OpenOrder[];
export declare const asTokenFingerprint: ({ policyId, assetNameHex, }: {
    policyId: string;
    assetNameHex: string | undefined;
}) => string;
export declare const asUtf8: (hex: string) => string;
//# sourceMappingURL=transformers.d.ts.map