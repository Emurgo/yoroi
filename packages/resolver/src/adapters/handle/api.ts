import {Api, Resolver} from '@yoroi/types'
import {fetchData, FetchData, getApiError, isLeft} from '@yoroi/common'

import {z} from 'zod'
import {AxiosRequestConfig} from 'axios'

import {handleZodErrors} from '../zod-errors'

const initialDeps = {request: fetchData, isMainnet: true} as const

export const handleApiGetCryptoAddress = ({
  request,
  isMainnet = true,
}: {request: FetchData; isMainnet?: boolean} = initialDeps) => {
  return async (
    resolve: Resolver.Receiver['resolve'],
    fetcherConfig?: AxiosRequestConfig,
  ): Promise<string> => {
    if (!isAdaHandleDomain(resolve)) throw new Resolver.Errors.InvalidDomain()

    const sanitizedDomain = resolve.replace(/^\$/, '')
    const config = {
      url: `${
        isMainnet
          ? handleApiConfig.mainnet.getCryptoAddress
          : handleApiConfig.preprod.getCryptoAddress
      }${sanitizedDomain}`,
    } as const

    try {
      const response = await request<HandleApiGetCryptoAddressResponse>(
        config,
        fetcherConfig,
      )

      if (isLeft(response)) throw getApiError(response.error)

      const parsedResponse = HandleApiResponseSchema.parse(response.value.data)
      return parsedResponse.resolved_addresses.ada
    } catch (error: unknown) {
      throw getHandleApiError(error)
    }
  }
}

// https://github.com/koralabs/handles-public-api/blob/8837b6812d613368ec1f3dc201d301c75396ccd6/models/view/handle.view.model.ts
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
    [key: string]: string
  }
  created_slot_number: number
  updated_slot_number: number
  has_datum: boolean
  image_hash: string
  standard_image_hash: string
  svg_version: string
  last_update_address?: string
  version: number
  handle_type: string
  payment_key_hash?: string
  pz_enabled?: boolean

  sub_rarity?: string
  sub_length?: number
  sub_characters?: string
  sub_numeric_modifiers?: string
  last_edited_time?: number

  original_address?: string
  virtual?: {
    expires_time: number
    public_mint: boolean
  }
  drep?: {
    type: 'drep' | 'cc_hot' | 'cc_cold'
    cred: 'key' | 'script'
    hex: string
    cip_105: string
    cip_129: string
  }
  policy: string
}

const HandleApiResponseSchema = z.object({
  resolved_addresses: z.object({
    ada: z.string(),
  }),
})
export const isAdaHandleDomain = (value: string) =>
  value.startsWith('$') && value.length > 1

export const handleApiConfig = {
  mainnet: {
    getCryptoAddress: 'https://api.handle.me/handles/',
    // https://docs.adahandle.com/official-policy-ids
    policyId: 'f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a',
  },
  preprod: {
    getCryptoAddress: 'https://preprod.api.handle.me/handles/',
    // https://docs.adahandle.com/official-policy-ids
    policyId: '8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe3',
  },
} as const

export const getHandleApiError = (error: unknown) => {
  const zodErrorMessage = handleZodErrors(error)
  if (zodErrorMessage)
    return new Resolver.Errors.InvalidResponse(zodErrorMessage)

  if (error instanceof Api.Errors.NotFound)
    return new Resolver.Errors.NotFound()

  return error
}
