import {Portfolio} from '@yoroi/types'
import {freeze} from 'immer'

export function createPrimaryTokenInfo(
  additionalProperties: Omit<Portfolio.Token.Info, 'id' | 'nature' | 'type'>,
): Readonly<Portfolio.Token.Info> {
  return freeze(
    {
      id: '.', // Enforcing the use of '.' for primary tokens
      nature: Portfolio.Token.Nature.Primary,
      type: Portfolio.Token.Type.FT,
      ...additionalProperties,
    },
    true,
  )
}
