import { z } from 'zod';
export declare const parseBoolean: (data: unknown) => boolean | undefined;
export declare const parseString: (data: unknown) => string | undefined;
export declare const parseSafe: (text: any) => unknown;
export declare const isBoolean: (data: unknown) => data is boolean;
export declare const isString: (data: unknown) => data is string;
export declare const isNonNullable: <T>(data: T | null | undefined) => data is T;
export declare const isNumber: (data: unknown) => data is number;
export declare const createTypeGuardFromSchema: <T>(schema: z.ZodType<T, z.ZodTypeDef, T>) => (data: unknown) => data is T;
export declare const isRecord: (data: unknown) => data is Record<string, unknown>;
export declare const isArray: (data: unknown) => data is unknown[];
export declare function isArrayOfType<T>(data: unknown, predicate: (data: unknown) => data is T): data is Array<T>;
//# sourceMappingURL=parsers.d.ts.map