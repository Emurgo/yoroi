import {Portfolio} from '@yoroi/types'

import {primaryTokenId} from '../constants'

export function isPrimaryToken(info: Portfolio.Token.Info): boolean
export function isPrimaryToken(
  id: Portfolio.Token.Id | string | undefined | null,
): boolean

export function isPrimaryToken(
  infoOrId:
    | Portfolio.Token.Info
    | Portfolio.Token.Id
    | string
    | undefined
    | null,
) {
  if (infoOrId == null) return false
  if (typeof infoOrId === 'string') return infoOrId === primaryTokenId
  return infoOrId.nature === Portfolio.Token.Nature.Primary
}
