import {Portfolio} from '@yoroi/types'
import {z} from 'zod'

const regexId = /^(?:[a-fA-F0-9]+\.?[a-fA-F0-9]*|\.)$/
// TODO: https://github.com/colinhacks/zod/pull/1786 this needs to be migrated to .templateLiterals
export const TokenIdSchema = z.string().regex(regexId)

export const isTokenId = (data: unknown): data is Portfolio.Token.Id => {
  return TokenIdSchema.safeParse(data).success
}

export const parseTokenId = (data: unknown): Portfolio.Token.Id | undefined => {
  return isTokenId(data) ? data : undefined
}
