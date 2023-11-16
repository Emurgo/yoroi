import {fetcher} from '@yoroi/common'
import {Resolver} from '@yoroi/types'
import {z} from 'zod'

export const getHandleCryptoAddress = async (
  receiverDomain: Resolver.Receiver['domain'],
): Promise<Resolver.AddressResponse> => {
  const result: Resolver.AddressResponse = {
    error: null,
    address: null,
  }

  const handle = receiverDomain.replace(/^\$/, '') // if the user uses '$' he is looking for a handle address

  const config = {
    method: 'get',
    url: `https://api.handle.me/handles/${handle}`,
    headers: {Accept: 'application/json'},
  }

  const response = await fetcher(config)

  const validatedHandleResponse = HandleResponseSchema.parse(response)

  result.address = validatedHandleResponse.resolved_addresses.ada
  return result
}

export const HandleResponseSchema = z.object({
  resolved_addresses: z.object({
    ada: z.string(),
  }),
})
