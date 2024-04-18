import {Api, Resolver} from '@yoroi/types'
import {fetchData, FetchData, getApiError, isLeft} from '@yoroi/common'
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

        throw getApiError(error)
      } else {
        // parsing
        const safeParsedAdaResponse = UnstoppableApiAdaResponseSchema.safeParse(
          response.value.data,
        )
        const safeParsedGeneralResponse =
          UnstoppableApiGeneralResponseSchema.safeParse(response.value.data)

        // checking
        const hasCardanoAddress = safeParsedAdaResponse.success
        const hasOtherBlockchainAddress = safeParsedGeneralResponse.success

        if (hasCardanoAddress)
          return response.value.data.records['crypto.ADA.address']

        if (hasOtherBlockchainAddress)
          throw new Resolver.Errors.WrongBlockchain()

        throw new Resolver.Errors.InvalidResponse()
      }
    } catch (error: unknown) {
      throw getUnstoppableApiError(error)
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
  meta: z.object({
    blockchain: z.string(),
  }),
  records: z.record(z.string(), z.string()),
})

// curl https://api.unstoppabledomains.com/resolve/supported_tlds
export const unstoppableSupportedTlds = [
  'x',
  'polygon',
  'nft',
  'crypto',
  'blockchain',
  'bitcoin',
  'dao',
  '888',
  'wallet',
  'binanceus',
  'hi',
  'klever',
  'kresus',
  'anime',
  'manga',
  'go',
  'altimist',
  'pudgy',
  'unstoppable',
  'austin',
  'bitget',
  'pog',
  'clay',
  'zil',
  'eth',
] as const

export const isUnstoppableDomain = (value: string) => {
  return unstoppableSupportedTlds.some((tld) => value.endsWith(tld))
}

export const unstoppableApiConfig = {
  mainnet: {
    getCryptoAddress: 'https://api.unstoppabledomains.com/resolve/domains/',
  },
} as const

export const getUnstoppableApiError = (error: unknown) => {
  if (error instanceof Api.Errors.NotFound)
    return new Resolver.Errors.NotFound()

  return error
}
