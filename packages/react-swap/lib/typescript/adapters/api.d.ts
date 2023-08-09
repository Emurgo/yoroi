import { Swap } from '@yoroi/types';
import { OpenSwapApi } from '@yoroi/api-openswap';
export declare const makeSwapApi: ({ network, stakingKey }: {
    network: 1 | 0 | 300;
    stakingKey: string;
}, deps?: {
    openswap?: OpenSwapApi | undefined;
} | undefined) => Swap.Api;
//# sourceMappingURL=api.d.ts.map