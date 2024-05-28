import {createTypeGuardFromSchema} from '@yoroi/common'
import {Balance} from '@yoroi/types'
import {z} from 'zod'

import {BackendConfig} from '../../types'
import {checkedFetch} from './fetch'
import {getNFT} from './metadata'
import {fallbackTokenInfo, tokenInfo, toTokenSubject} from './utils'

export const getTokenInfo = async (
  tokenId: string,
  apiUrl: string,
  config: BackendConfig,
): Promise<Balance.TokenInfo> => {
  const nftPromise = getNFT(tokenId, config).then((nft) => {
    if (!nft) throw new Error('NFT not found')
    return nft
  })

  const tokenPromise = checkedFetch({
    endpoint: `${apiUrl}/${toTokenSubject(tokenId)}`,
    method: 'GET',
    payload: undefined,
  })
    .then((response) => (response ? parseTokenRegistryEntry(response) : null))
    .then((entry) => (entry ? tokenInfo(entry) : null))
    .then((token) => {
      if (!token) throw new Error('Token not found')
      return token
    })

  try {
    const result = await promiseAny<Balance.TokenInfo>([nftPromise, tokenPromise])
    return result ?? fallbackTokenInfo(tokenId)
  } catch (e) {
    return fallbackTokenInfo(tokenId)
  }
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

function promiseAny<T>(promises: Promise<T>[]): Promise<T> {
  return new Promise((resolve, reject) => {
    let rejectedCount = 0
    for (const promise of promises) {
      promise.then(resolve).catch(() => {
        rejectedCount++
        if (rejectedCount === promises.length) {
          reject(new Error('All promises were rejected'))
        }
      })
    }
  })
}
