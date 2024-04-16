import {Portfolio} from '@yoroi/types'
import {freeze} from 'immer'

export function createUnknownTokenInfo(
  additionalProperties: Pick<Portfolio.Token.Info, 'id' | 'name'>,
): Readonly<Portfolio.Token.Info> {
  return freeze(
    {
      reference: '',
      tag: '',
      ticker: '',
      website: '',
      decimals: 0,
      symbol: '',
      fingerprint: '',
      originalImage: '',
      nature: Portfolio.Token.Nature.Secondary,
      type: Portfolio.Token.Type.FT,
      application: Portfolio.Token.Application.General,
      status: Portfolio.Token.Status.Unknown,
      ...additionalProperties,
    },
    true,
  )
}
