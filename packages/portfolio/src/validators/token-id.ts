import {Portfolio} from '@yoroi/types'
import {z} from 'zod'

export const TokenIdSchema = z.string().regex(/^[\w-]+\.[\w-]+$/)

export const isTokenId = (data: unknown): data is Portfolio.Token.Id => {
  return TokenIdSchema.safeParse(data).success
}

export const parseTokenId = (data: unknown): Portfolio.Token.Id | undefined => {
  return isTokenId(data) ? data : undefined
}
