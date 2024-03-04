import { ZodError } from 'zod';
/**
 * Converts a ZodError or Error to a BanxaError.
 * @param error - The error to convert.
 * @throws An appropriate BanxaError based on zod error, or ignore it.
 */
export declare function handleZodErrors(error: ZodError | any): void;
//# sourceMappingURL=zod-errors.d.ts.map