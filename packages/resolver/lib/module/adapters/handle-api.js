import { fetcher } from '@yoroi/common/src';
import { z } from 'zod';
import { handleZodErrors } from './zod-errors';
export const getHandleCryptoAddress = async receiverDomain => {
  try {
    const validatedHandle = stringWithDollarSchema.parse(receiverDomain);
    const handle = validatedHandle.replace(/^\$/, '');
    const config = {
      method: 'get',
      url: `https://api.handle.me/handles/${handle}`,
      headers: {
        Accept: 'application/json'
      }
    };
    const response = await fetcher(config);
    const validatedHandleResponse = HandleResponseSchema.parse(response);
    const address = validatedHandleResponse.resolved_addresses.ada;
    return address;
  } catch (error) {
    const zodErrorMessage = handleZodErrors(error);
    if (zodErrorMessage) throw new HandleValidationError(zodErrorMessage);
    throw new HandleUnknownError(JSON.stringify(error));
  }
};
const HandleResponseSchema = z.object({
  resolved_addresses: z.object({
    ada: z.string()
  })
});
const stringWithDollarSchema = z.string().refine(value => {
  return value.startsWith('$');
}, {
  message: "The domain must start with a '$' symbol"
});
export class HandleValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'HandleValidationError';
  }
}
export class HandleUnknownError extends Error {
  constructor(message) {
    super(message);
    this.name = 'HandleUnknownError';
  }
}
//# sourceMappingURL=handle-api.js.map