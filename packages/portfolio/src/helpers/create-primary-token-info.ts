import {Portfolio} from '@yoroi/types'
import {freeze} from 'immer'

export function createPrimaryTokenInfo(
  additionalProperties: Omit<
    Portfolio.Token.Info,
    'id' | 'nature' | 'type' | 'application' | 'fingerprint' | 'status'
  >,
): Readonly<Portfolio.Token.Info> {
  return freeze(
    {
      id: '.', // Enforcing the use of '.' for primary tokens
      nature: Portfolio.Token.Nature.Primary,
      type: Portfolio.Token.Type.FT,
      application: Portfolio.Token.Application.Token,
      fingerprint: '',
      status: Portfolio.Token.Status.Normal,
      ...additionalProperties,
    },
    true,
  )
}
