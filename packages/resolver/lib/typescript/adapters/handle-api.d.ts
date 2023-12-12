import { Resolver } from '@yoroi/types';
export declare const getHandleCryptoAddress: (receiverDomain: Resolver.Receiver['domain']) => Promise<string>;
export declare class HandleValidationError extends Error {
    constructor(message: string);
}
export declare class HandleUnknownError extends Error {
    constructor(message: string);
}
//# sourceMappingURL=handle-api.d.ts.map