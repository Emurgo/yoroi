import {fetcher} from '@yoroi/common'
import {Resolver} from '@yoroi/types'
import {z} from 'zod'
import {handleZodErrors} from './zod-errors'

export const getHandleCryptoAddress = async (
  receiverDomain: Resolver.Receiver['domain'],
): Promise<string> => {
  try {
    if (!/^\$/.test(receiverDomain))
      throw new HandleValidationError(
        `${receiverDomain} it is not a handle. Missing '$'.`,
      )

    const handle = receiverDomain.replace(/^\$/, '')

    const config = {
      method: 'get',
      url: `https://api.handle.me/handles/${handle}`,
      headers: {Accept: 'application/json'},
    }

    const response = await fetcher(config)

    const validatedHandleResponse = HandleResponseSchema.parse(response)

    const address = validatedHandleResponse.resolved_addresses.ada
    return address
  } catch (error: unknown) {
    const zodErrorMessage = handleZodErrors(error)

    if (zodErrorMessage) throw new HandleValidationError(zodErrorMessage)
    throw new HandleUnknownError(JSON.stringify(error))
  }
}

const HandleResponseSchema = z.object({
  resolved_addresses: z.object({
    ada: z.string(),
  }),
})

class HandleValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'HandleValidationError'
  }
}

class HandleUnknownError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'HandleUnknownError'
  }
}
