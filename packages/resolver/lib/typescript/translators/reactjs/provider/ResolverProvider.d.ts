import { Resolver } from '@yoroi/types';
import * as React from 'react';
type ResolverActions = {
    saveResolverNoticeStatus: Resolver.Storage['notice']['save'];
    readResolverNoticeStatus: Resolver.Storage['notice']['read'];
    getCryptoAddress: Resolver.Api['getCryptoAddress'];
    resolvedAddressSelectedChanged: (resolvedAddressSelected: ResolverState['resolvedAddressSelected']) => void;
    resetState: () => void;
};
type ResolverState = {
    resolvedAddressSelected: Resolver.AddressResponse | null;
};
type ResolverProviderContext = React.PropsWithChildren<ResolverState & ResolverActions>;
export declare const defaultResolverActions: ResolverActions;
export declare const defaultResolverState: ResolverState;
export declare const ResolverProvider: ({ children, resolverModule, }: {
    children: React.ReactNode;
    resolverModule: Resolver.Module;
}) => JSX.Element;
export declare const useResolver: () => ResolverProviderContext;
export type ResolverAction = {
    type: 'resolvedAddressSelectedChanged';
    resolvedAddressSelected: ResolverState['resolvedAddressSelected'];
} | {
    type: 'resetState';
};
export declare const resolverReducer: (state: ResolverState, action: ResolverAction) => ResolverState;
export {};
//# sourceMappingURL=ResolverProvider.d.ts.map