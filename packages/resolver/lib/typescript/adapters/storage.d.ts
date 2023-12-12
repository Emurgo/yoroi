import AsyncStorage from '@react-native-async-storage/async-storage';
import { Resolver, BaseStorage } from '@yoroi/types';
export declare function resolverStorageMaker(deps?: {
    storage: BaseStorage | typeof AsyncStorage;
}): Readonly<Resolver.Storage>;
export declare const resolverStorageNoticedKey = "resolver-notice";
export declare const parseBoolean: (data: unknown) => boolean | undefined;
export declare const isBoolean: (data: unknown) => data is boolean;
//# sourceMappingURL=storage.d.ts.map