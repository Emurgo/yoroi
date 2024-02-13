import type { ApiDeps, PriceAddress, PriceResponse } from './types';
export declare function getPrice(deps: ApiDeps, args: {
    baseToken: PriceAddress;
    quoteToken: PriceAddress;
}): Promise<PriceResponse>;
