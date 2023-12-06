import {Api, Resolver} from '@yoroi/types'
import {fetchData, FetchData, handleApiError, isLeft} from '@yoroi/common'
import {z} from 'zod'

import {handleZodErrors} from './zod-errors'

const initialDeps = {request: fetchData} as const

export const unstoppableApiGetCryptoAddress = (
  {apiKey}: {apiKey: string},
  {request}: {request: FetchData} = initialDeps,
) => {
  return async (
    receiverDomain: Resolver.Receiver['domain'],
  ): Promise<string> => {
    if (!isUnstoppableHandleDomain(receiverDomain))
      throw new UnstoppableApiErrorInvalidDomain()

    const config = {
      url: `${unstoppableApiConfig.mainnet.getCryptoAddress}${receiverDomain}`,
      headers: {
        'Content-Type': 'application/json',
        'Bearer': apiKey,
      },
    } as const

    try {
      const response = await request<UnstoppableApiGetCryptoAddressResponse>(
        config,
      )

      if (isLeft(response)) {
        handleApiError(response.error)
      } else {
        const parsedResponse = UnstoppableApiResponseSchema.parse(
          response.value,
        )

        const result = parsedResponse.records['crypto.ADA.address']
        if (!result) throw new UnstoppableApiErrorNotFound()
        return result
      }
    } catch (error: unknown) {
      return handleUnstoppableApiError(error)
    }
  }
}

// https://docs.unstoppabledomains.com/openapi/resolution/#operation/DomainsController.getDomain
export type UnstoppableApiGetCryptoAddressResponse = {
  meta: {
    domain: string
    tokenId: string
    namehash: string
    blockchain: string
    networkId: number
    owner: string
    resolver: string
    registry: string
    reverse: boolean
    type: string
  }
  records: {
    'crypto.ADA.address'?: string
  }
}

const UnstoppableApiResponseSchema = z.object({
  records: z.object({
    'crypto.ADA.address': z.string().optional(),
  }),
})
export const isUnstoppableHandleDomain = (value: string) => value.includes('.')

export const unstoppableApiConfig = {
  mainnet: {
    getCryptoAddress: 'https://api.unstoppabledomains.com/resolve/domains/',
  },
} as const

export const handleUnstoppableApiError = (error: unknown): never => {
  const zodErrorMessage = handleZodErrors(error)
  if (zodErrorMessage)
    throw new UnstoppableApiErrorInvalidResponse(zodErrorMessage)

  if (error instanceof Api.Errors.NotFound)
    throw new UnstoppableApiErrorNotFound()

  throw error
}

export class UnstoppableApiErrorInvalidResponse extends Error {}
export class UnstoppableApiErrorInvalidDomain extends Error {}
export class UnstoppableApiErrorNotFound extends Error {}
