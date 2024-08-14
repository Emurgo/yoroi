import {Portfolio} from '@yoroi/types'
import {freeze} from 'immer'

import {primaryTokenId} from '../constants'

export function createPrimaryTokenInfo(
  additionalProperties: Omit<
    Portfolio.Token.Info,
    'id' | 'nature' | 'type' | 'application' | 'fingerprint' | 'status'
  >,
): Readonly<Portfolio.Token.Info> {
  return freeze(
    {
      id: primaryTokenId,
      nature: Portfolio.Token.Nature.Primary,
      type: Portfolio.Token.Type.FT,
      application: Portfolio.Token.Application.Coin,
      fingerprint: '',
      status: Portfolio.Token.Status.Valid,
      ...additionalProperties,
    },
    true,
  )
}
