import {App, Portfolio} from '@yoroi/types'
import {freeze} from 'immer'

import {createUnknownTokenInfo} from './create-unknown-token-info'

export const createCachedUnknownTokenInfo = (
  id: Portfolio.Token.Id,
): Readonly<App.CacheRecord<Portfolio.Token.Info>> => {
  const [, assetNameHex] = id.split('.')
  const name = `Unknown (${assetNameHex})`
  const unknownTokenInfo = createUnknownTokenInfo({id, name})
  const cachedUnknownTokenInfo: Readonly<
    App.CacheRecord<Portfolio.Token.Info>
  > = freeze({expires: 0, hash: '', record: unknownTokenInfo} as const, true)
  return cachedUnknownTokenInfo
}
