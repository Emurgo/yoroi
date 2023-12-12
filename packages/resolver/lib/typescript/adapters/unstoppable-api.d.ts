import { Resolver } from '@yoroi/types';
export declare const getUnstoppableCryptoAddress: (receiverDomain: Resolver.Receiver['domain'], apiKey: string) => Promise<string>;
export declare class UnstoppableValidationError extends Error {
    constructor(message: string);
}
export declare class UnstoppableUnknownError extends Error {
    constructor(message: string);
}
//# sourceMappingURL=unstoppable-api.d.ts.map