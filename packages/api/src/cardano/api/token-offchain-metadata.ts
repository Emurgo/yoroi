import {z} from 'zod'
import {
  createTypeGuardFromSchema,
  fetcher,
  Fetcher,
  isRecord,
} from '@yoroi/common'

import {asSubject} from '../translators/transformers/asSubject'
import {Api, ApiTokenRegistryProperty} from '@yoroi/types'

export const getOffChainMetadata = (
  baseUrl: string,
  request: Fetcher = fetcher,
) => {
  const getTokenRegistryRecord = (
    tokenId: Api.Cardano.TokenId,
  ): Promise<Api.Cardano.OffChainMetadataResponse> =>
    request<Api.Cardano.OffChainMetadataResponse>({
      url: `${baseUrl}/metadata/${asSubject(tokenId)}`,
      method: 'GET',
      headers: {'Content-Type': 'application/json'},
    })
      .then((response) => {
        if (!isRecord(response))
          return Promise.resolve({[tokenId]: emptyOffChainMetadataRecord})

        const parsedEntry = parseTokenRegistryEntry(response)

        if (parsedEntry) {
          return Promise.resolve({
            [tokenId]: {
              tokenRegistry: parsedEntry,
              isValid: true,
            },
          })
        }

        return Promise.resolve({
          [tokenId]: {
            tokenRegistry: response,
            isValid: false,
          } as Api.Cardano.OffChainMetadataRecord,
        })
      })
      .catch((_e) => Promise.resolve({[tokenId]: emptyOffChainMetadataRecord}))

  return (tokenIds: Api.Cardano.OffChainMetadataRequest) =>
    Promise.all(
      tokenIds.map((tokenId) => getTokenRegistryRecord(tokenId)),
    ).then((responses) => {
      const result: Api.Cardano.OffChainMetadataResponse = {}
      responses.forEach((response) => {
        Object.assign(result, response)
      })
      return result
    })
}

const TokenRegistryPropertyNumberSchema: z.ZodSchema<
  ApiTokenRegistryProperty<number>
> = z.object({
  signatures: z.array(
    z.object({
      publicKey: z.string(),
      signature: z.string(),
    }),
  ),
  sequenceNumber: z.number(),
  value: z.number().optional(),
})

const TokenRegistryPropertyStringSchema: z.ZodSchema<
  ApiTokenRegistryProperty<string>
> = z.object({
  signatures: z.array(
    z.object({
      publicKey: z.string(),
      signature: z.string(),
    }),
  ),
  sequenceNumber: z.number(),
  value: z.string().optional(),
})

const TokenRegistryEntrySchema: z.ZodSchema<Api.Cardano.TokenRegistryEntry> =
  z.object({
    subject: z.string(),
    name: TokenRegistryPropertyStringSchema,
    description: TokenRegistryPropertyStringSchema.optional(),
    policy: z.string().optional(),
    logo: TokenRegistryPropertyStringSchema.optional(),
    ticker: TokenRegistryPropertyStringSchema.optional(),
    url: TokenRegistryPropertyStringSchema.optional(),
    decimals: TokenRegistryPropertyNumberSchema.optional(),
  })

export const isTokenRegistryEntry = createTypeGuardFromSchema(
  TokenRegistryEntrySchema,
)

const parseTokenRegistryEntry = (data: unknown) => {
  return isTokenRegistryEntry(data) ? data : undefined
}

export const emptyOffChainMetadataRecord: Readonly<Api.Cardano.OffChainMetadataRecord> =
  {
    tokenRegistry: undefined,
    isValid: false,
  } as const
