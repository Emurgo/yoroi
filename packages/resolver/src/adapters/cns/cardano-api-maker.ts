import {CardanoApi} from '@yoroi/api'
import {FetchData, fetchData, getApiError, isLeft} from '@yoroi/common'
import {Api, Resolver} from '@yoroi/types'
import {AxiosRequestConfig} from 'axios'
import {z} from 'zod'

import {CNSUserRecord} from './types'

export const makeCnsCardanoApi = (
  baseUrl: string,
  request: FetchData = fetchData,
) => {
  const getAssetAddress = async (
    policyId: string,
    assetName: string,
    fetcherConfig?: AxiosRequestConfig,
  ): Promise<string | undefined> => {
    const response = await request<string | undefined>(
      {
        url: `${baseUrl}/api/asset/accounts?policy=${policyId}&asset=${assetName}`,
      },
      fetcherConfig,
    )

    if (isLeft(response)) throw getApiError(response.error)

    const validatedResponse = getAssetAddressSchema.safeParse(
      response.value.data,
    )
    if (validatedResponse.success) {
      return response.value.data?.[0]
    }

    throw new Resolver.Errors.NotFound()
  }

  const getMetadata = async (
    policyId: string,
    assetName: string,
    fetcherConfig?: AxiosRequestConfig,
  ): Promise<Api.Cardano.NftMetadata | undefined> => {
    const id: Api.Cardano.TokenId = `${policyId}.${assetName}`

    const getOnChainMetadatas = CardanoApi.getOnChainMetadatas(`${baseUrl}/api`)
    const response = await getOnChainMetadatas([id], fetcherConfig)
    const validatedResponse = CNSMetadataSchema.safeParse(response)

    if (validatedResponse.success) {
      return response[id]?.mintNftRecordSelected
    }

    throw new Resolver.Errors.NotFound()
  }

  const getAssetInlineDatum = async (
    policyId: string,
    assetName: string,
    addresses: Array<string>,
    fetcherConfig?: AxiosRequestConfig,
  ): Promise<CNSUserRecord | undefined> => {
    const response = await request<AssetInlineDatumResponse>(
      {
        url: `${baseUrl}/api/txs/utxoForAddresses`,
        method: 'post',
        data: {addresses, asset: {policy: policyId, name: assetName}},
      },
      fetcherConfig,
    )

    if (isLeft(response)) throw getApiError(response.error)

    const validatedResponse = assetInlineDatumResponseSchema.safeParse(
      response.value.data,
    )
    if (validatedResponse.success) {
      return response.value.data[0]?.inline_datum?.plutus_data
    }

    throw new Resolver.Errors.NotFound()
  }

  return {
    getAssetAddress,
    getMetadata,
    getAssetInlineDatum,
  } as const
}

export type AssetInlineDatumResponse = Array<{
  inline_datum: {plutus_data: CNSUserRecord}
}>

const cnsUserRecordSchema = z.object({
  constructor: z.literal(0),
  fields: z.tuple([
    z.object({
      map: z.array(
        z.object({
          k: z.object({
            bytes: z.string(),
          }),
          v: z.union([
            z.object({
              constructor: z.literal(0),
              fields: z.tuple([
                z.object({
                  constructor: z.literal(0),
                  fields: z.tuple([
                    z.object({
                      bytes: z.string(),
                    }),
                  ]),
                }),
                z.union([
                  z.object({
                    constructor: z.literal(1),
                    fields: z.tuple([]),
                  }),
                  z.object({
                    constructor: z.literal(0),
                    fields: z.tuple([
                      z.object({
                        constructor: z.literal(0),
                        fields: z.array(
                          z.object({
                            constructor: z.literal(0),
                            fields: z.array(
                              z.object({
                                bytes: z.string(),
                              }),
                            ),
                          }),
                        ),
                      }),
                    ]),
                  }),
                ]),
              ]),
            }),
            z.object({
              constructor: z.literal(0),
              fields: z.tuple([
                z.object({
                  constructor: z.literal(1),
                  fields: z.tuple([
                    z.object({
                      bytes: z.string(),
                    }),
                  ]),
                }),
                z.union([
                  z.object({
                    constructor: z.literal(1),
                    fields: z.tuple([]),
                  }),
                  z.object({
                    constructor: z.literal(0),
                    fields: z.tuple([
                      z.object({
                        constructor: z.literal(0),
                        fields: z.array(
                          z.object({
                            constructor: z.literal(0),
                            fields: z.array(
                              z.object({
                                bytes: z.string(),
                              }),
                            ),
                          }),
                        ),
                      }),
                    ]),
                  }),
                ]),
              ]),
            }),
          ]),
        }),
      ),
    }),
    z.object({
      map: z.array(
        z.object({
          k: z.object({
            bytes: z.string(),
          }),
          v: z.object({
            bytes: z.string(),
          }),
        }),
      ),
    }),
    z.object({
      map: z.array(
        z.object({
          k: z.object({
            bytes: z.string(),
          }),
          v: z.object({
            bytes: z.string(),
          }),
        }),
      ),
    }),
  ]),
})
const assetInlineDatumResponseSchema = z.array(
  z.object({
    inline_datum: z.object({
      plutus_data: cnsUserRecordSchema,
    }),
  }),
)

const getAssetAddressSchema = z.array(z.string())
const CNSMetadataSchema = z.record(
  z.object({
    mintNftRecordSelected: z.object({
      name: z.string(),
      image: z.string(),
      expiry: z.number(),
      origin: z.string(),
      cnsType: z.string(),
      mediaType: z.string(),
      description: z.string(),
      virtualSubdomainLimits: z.number(),
      virtualSubdomainEnabled: z.union([
        z.literal('Enabled'),
        z.literal('Disabled'),
      ]),
    }),
  }),
)

export type CnsCardanoApi = ReturnType<typeof makeCnsCardanoApi>
