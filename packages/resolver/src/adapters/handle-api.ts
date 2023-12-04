import {Api, Resolver} from '@yoroi/types'
import {fetchData, FetchData, handleApiError, isLeft} from '@yoroi/common'
import {z} from 'zod'

import {handleZodErrors} from './zod-errors'

export const handleApiGetCryptoAddress = ({
  request = fetchData,
}: {
  request?: FetchData
} = {}) => {
  return async (
    receiverDomain: Resolver.Receiver['domain'],
  ): Promise<string> => {
    try {
      if (!isAdaHandleDomain(receiverDomain)) throw new HandleApiErrorInvalidDomain()

      const sanitizedDomain = receiverDomain.replace(/^\$/, '')
      const config = {
        url: `${handleApiConfig.mainnet.getCryptoAddress}${sanitizedDomain}`,
      } as const

      const response = await request<HandleApiGetCryptoAddressResponse>(config)

      if (isLeft(response)) {
        handleApiError(response.error)
      } else {
        const parsedResponse = HandleApiResponseSchema.parse(response.value)
        return asResolverCryptoAddress(parsedResponse)
      }
    } catch (error: unknown) {
      return handleHandleApiError(error)
    }
  }
}

export const asResolverCryptoAddress = (
  handleCryptoAddress: Pick<
    HandleApiGetCryptoAddressResponse,
    'resolved_addresses'
  >,
) => handleCryptoAddress.resolved_addresses.ada

// https://github.com/koralabs/handles-public-api/blob/master/src/models/view/handle.view.model.ts
export type HandleApiGetCryptoAddressResponse = {
  hex: string
  name: string
  image: string
  standard_image: string
  holder: string
  holder_type: string
  length: number
  og_number: number
  //   export enum Rarity {
  //     basic = 'basic', // - 8-15 characters
  //     common = 'common', // - 4-7 characters
  //     rare = 'rare', // - 3 characters
  //     ultra_rare = 'ultra_rare', // - 2 characters
  //     legendary = 'legendary' // - 1 character
  // }
  rarity: string // translated to string only
  utxo: string
  characters: string
  numeric_modifiers: string
  default_in_wallet: string
  pfp_image?: string
  pfp_asset?: string
  bg_image?: string
  bg_asset?: string
  resolved_addresses: {
    ada: string
    eth?: string | undefined
    btc?: string | undefined
  }
  created_slot_number: number
  updated_slot_number: number
  has_datum: boolean
  svg_version: string
  image_hash: string
  standard_image_hash: string
  version: number
}

const HandleApiResponseSchema = z.object({
  resolved_addresses: z.object({
    ada: z.string(),
  }),
})
export const isAdaHandleDomain = (value: string) => value.startsWith('$')

export const handleApiConfig = {
  mainnet: {
    getCryptoAddress: 'https://api.handle.me/handles/',
  },
} as const

export const handleHandleApiError = (error: unknown): never => {
  const zodErrorMessage = handleZodErrors(error)
  if (zodErrorMessage) throw new HandleApiErrorInvalidResponse(zodErrorMessage)

  if (error instanceof Api.Errors.NotFound) throw new HandleApiErrorNotFound()

  throw error
}

export class HandleApiErrorInvalidResponse extends Error {}
export class HandleApiErrorInvalidDomain extends Error {}
export class HandleApiErrorNotFound extends Error {}
