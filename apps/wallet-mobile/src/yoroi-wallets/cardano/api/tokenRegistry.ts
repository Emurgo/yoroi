import {z} from 'zod'

import {Logger} from '../../logging'
import {createTypeGuardFromSchema} from '../../utils'
import {checkedFetch} from './fetch'
import {fallbackTokenInfo, tokenInfo, toTokenSubject} from './utils'

export const getTokenInfo = async (tokenId: string, apiUrl: string) => {
  const response = await checkedFetch({
    endpoint: `${apiUrl}/${toTokenSubject(tokenId)}`,
    method: 'GET',
    payload: undefined,
  }).catch((error) => {
    Logger.error(error)

    return undefined
  })

  const entry = parseTokenRegistryEntry(response)

  return entry ? tokenInfo(entry) : fallbackTokenInfo(tokenId)
}

const parseTokenRegistryEntry = (data: unknown) => {
  return isTokenRegistryEntry(data) ? data : undefined
}

// Token Registry
// 721: https://github.com/cardano-foundation/cardano-token-registry#semantic-content-of-registry-entries
export type TokenRegistryEntry = {
  subject: string
  name: Property<string>

  description?: Property<string>
  policy?: string
  logo?: Property<string>
  ticker?: Property<string>
  url?: Property<string>
  decimals?: Property<number>
}

type Signature = {
  publicKey: string
  signature: string
}

type Property<T> = {
  signatures: Array<Signature>
  sequenceNumber: number
  value?: T
}

const PropertyNumberSchema: z.ZodSchema<Property<number>> = z.object({
  signatures: z.array(
    z.object({
      publicKey: z.string(),
      signature: z.string(),
    }),
  ),
  sequenceNumber: z.number(),
  value: z.number().optional(),
})

const PropertyStringSchema: z.ZodSchema<Property<string>> = z.object({
  signatures: z.array(
    z.object({
      publicKey: z.string(),
      signature: z.string(),
    }),
  ),
  sequenceNumber: z.number(),
  value: z.string().optional(),
})

const TokenRegistryEntrySchema: z.ZodSchema<TokenRegistryEntry> = z.object({
  subject: z.string(),
  name: PropertyStringSchema,
  description: PropertyStringSchema.optional(),
  policy: z.string().optional(),
  logo: PropertyStringSchema.optional(),
  ticker: PropertyStringSchema.optional(),
  url: PropertyStringSchema.optional(),
  decimals: PropertyNumberSchema.optional(),
})

const isTokenRegistryEntry = createTypeGuardFromSchema(TokenRegistryEntrySchema)
