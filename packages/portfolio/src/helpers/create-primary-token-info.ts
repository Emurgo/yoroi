import {Portfolio} from '@yoroi/types'

export function createPrimaryTokenInfo(
  additionalProperties: Omit<Portfolio.Token.Info, 'id' | 'nature' | 'type'>,
): Readonly<Portfolio.Token.Info> {
  return Object.freeze({
    id: '.', // Enforcing the use of '.' for primary tokens
    nature: Portfolio.Token.Nature.Primary,
    type: Portfolio.Token.Type.FT,
    ...additionalProperties,
  })
}
