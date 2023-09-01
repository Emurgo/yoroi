import {createTypeGuardFromSchema, isRecord} from '@yoroi/wallets'
import {z} from 'zod'

import {checkedFetch} from '../../../cardano/api/fetch'
import {toTokenSubject} from '../../../cardano/api/utils'
import {
  ApiOffChainMetadataRecord,
  ApiOffChainMetadataRequest,
  ApiOffChainMetadataResponse,
  ApiTokenId,
  ApiTokenRegistryEntry,
  ApiTokenRegistryProperty,
} from './types'

export const getOffChainMetadata = (baseUrl: string, fetch = checkedFetch) => {
  const getTokenRegistryRecord = (tokenId: ApiTokenId): Promise<ApiOffChainMetadataResponse> =>
    fetch({
      endpoint: `${baseUrl}/metadata/${toTokenSubject(tokenId)}`,
      method: 'GET',
      headers: {'Content-Type': 'application/json'},
      payload: undefined,
    })
      .then((response) => {
        if (!isRecord(response)) return Promise.resolve({[tokenId]: emptyOffChainMetadataRecord})

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
          } as ApiOffChainMetadataRecord,
        })
      })
      .catch((_e) => Promise.resolve({[tokenId]: emptyOffChainMetadataRecord}))

  return (tokenIds: ApiOffChainMetadataRequest) =>
    Promise.all(tokenIds.map((tokenId) => getTokenRegistryRecord(tokenId))).then((responses) => {
      const result: ApiOffChainMetadataResponse = {}
      responses.forEach((response) => {
        Object.assign(result, response)
      })
      return result
    })
}

const TokenRegistryPropertyNumberSchema: z.ZodSchema<ApiTokenRegistryProperty<number>> = z.object({
  signatures: z.array(
    z.object({
      publicKey: z.string(),
      signature: z.string(),
    }),
  ),
  sequenceNumber: z.number(),
  value: z.number().optional(),
})

const TokenRegistryPropertyStringSchema: z.ZodSchema<ApiTokenRegistryProperty<string>> = z.object({
  signatures: z.array(
    z.object({
      publicKey: z.string(),
      signature: z.string(),
    }),
  ),
  sequenceNumber: z.number(),
  value: z.string().optional(),
})

const TokenRegistryEntrySchema: z.ZodSchema<ApiTokenRegistryEntry> = z.object({
  subject: z.string(),
  name: TokenRegistryPropertyStringSchema,
  description: TokenRegistryPropertyStringSchema.optional(),
  policy: z.string().optional(),
  logo: TokenRegistryPropertyStringSchema.optional(),
  ticker: TokenRegistryPropertyStringSchema.optional(),
  url: TokenRegistryPropertyStringSchema.optional(),
  decimals: TokenRegistryPropertyNumberSchema.optional(),
})

export const isTokenRegistryEntry = createTypeGuardFromSchema(TokenRegistryEntrySchema)

const parseTokenRegistryEntry = (data: unknown) => {
  return isTokenRegistryEntry(data) ? data : undefined
}

export const emptyOffChainMetadataRecord: Readonly<ApiOffChainMetadataRecord> = {
  tokenRegistry: undefined,
  isValid: false,
} as const
