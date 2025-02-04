import {hexToAscii} from '@yoroi/common'
import {Portfolio} from '@yoroi/types'
import {freeze} from 'immer'

export function createUnknownTokenInfo({
  id,
  name,
}: Pick<Portfolio.Token.Info, 'id'> &
  Partial<Pick<Portfolio.Token.Info, 'name'>>): Readonly<Portfolio.Token.Info> {
  const [, assetNameHex] = id.split('.')
  const assetNameAscii = hexToAscii(assetNameHex ?? '')

  return freeze(
    {
      id,
      name: name ?? `${assetNameAscii} (unknown)`,
      reference: '',
      tag: '',
      ticker: '',
      website: '',
      decimals: 0,
      symbol: '',
      fingerprint: '',
      originalImage: '',
      description: '',
      nature: Portfolio.Token.Nature.Secondary,
      type: Portfolio.Token.Type.FT,
      application: Portfolio.Token.Application.General,
      status: Portfolio.Token.Status.Unknown,
    },
    true,
  )
}
