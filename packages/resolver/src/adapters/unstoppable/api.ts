import {Api, Resolver} from '@yoroi/types'
import {fetchData, FetchData, handleApiError, isLeft} from '@yoroi/common'
import {z} from 'zod'
import {AxiosRequestConfig} from 'axios'

const initialDeps = {request: fetchData} as const

export const unstoppableApiGetCryptoAddress = (
  {apiKey}: {apiKey: string},
  {request}: {request: FetchData} = initialDeps,
) => {
  return async (
    resolve: Resolver.Receiver['resolve'],
    fetcherConfig?: AxiosRequestConfig,
  ): Promise<string> => {
    if (!resolve.includes('.')) throw new Resolver.Errors.InvalidDomain()

    if (!isUnstoppableDomain(resolve))
      throw new Resolver.Errors.UnsupportedTld()

    const config = {
      url: `${unstoppableApiConfig.mainnet.getCryptoAddress}${resolve}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    } as const

    try {
      const response = await request<UnstoppableApiGetCryptoAddressResponse>(
        config,
        fetcherConfig,
      )

      if (isLeft(response)) {
        const error = response.error as UnstoppableApiGetCryptoAddressError

        if (error.responseData?.message?.includes('Unsupported TLD'))
          throw new Resolver.Errors.UnsupportedTld()

        handleApiError(error)
      } else {
        const safeParsedAdaResponse = UnstoppableApiAdaResponseSchema.safeParse(
          response.value.data,
        )
        const safeParsedGeneralResponse =
          UnstoppableApiGeneralResponseSchema.safeParse(response.value.data)

        const hasCardanoAddress = safeParsedAdaResponse.success
        const hasOtherBlockchainAddress =
          !hasCardanoAddress &&
          safeParsedGeneralResponse.success &&
          Object.keys(response.value.data.records).length > 0
        const hasNotAnyAddress =
          !hasOtherBlockchainAddress && safeParsedGeneralResponse.success

        if (hasCardanoAddress) {
          const result = response.value.data.records['crypto.ADA.address']
          return result
        }

        if (hasOtherBlockchainAddress)
          throw new Resolver.Errors.WrongBlockchain()

        if (hasNotAnyAddress) {
          throw new Resolver.Errors.NotFound()
        }

        throw new Resolver.Errors.InvalidResponse()
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
    'crypto.ADA.address': string
  }
}

export type UnstoppableApiGetCryptoAddressError = {
  responseData: {
    message: string
  }
  status: number
  message: string
}

const UnstoppableApiAdaResponseSchema = z.object({
  records: z.object({
    'crypto.ADA.address': z.string(),
  }),
})

const UnstoppableApiGeneralResponseSchema = z.object({
  records: z.record(z.string(), z.string()),
})

// https://docs.unstoppabledomains.com/openapi/resolution/
export const unstoppableSupportedTlds = [
  '.x',
  '.polygon',
  '.nft',
  '.crypto',
  '.blockchain',
  '.bitcoin',
  '.dao',
  '.888',
  '.wallet',
  '.binanceus',
  '.hi',
  '.klever',
  '.kresus',
  '.anime',
  '.manga',
  '.go',
  '.zil',
  '.eth',
] as const
export const isUnstoppableDomain = (value: string) => {
  return unstoppableSupportedTlds.some((tld) => value.endsWith(tld))
}

export const unstoppableApiConfig = {
  mainnet: {
    getCryptoAddress: 'https://api.unstoppabledomains.com/resolve/domains/',
  },
} as const

export const handleUnstoppableApiError = (error: unknown): never => {
  if (error instanceof Api.Errors.NotFound) throw new Resolver.Errors.NotFound()

  throw error
}
