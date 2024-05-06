import {App} from '@yoroi/types'

import {isArray} from '../utils/parsers'

export function isExpired([_, cacheInfo]: [unknown, App.CacheInfo]): boolean
export function isExpired(cacheInfo: App.CacheInfo): boolean
export function isExpired(
  cacheInfo: App.CacheInfo | [unknown, App.CacheInfo],
): boolean {
  const expires = isArray(cacheInfo) ? cacheInfo[1].expires : cacheInfo.expires
  return expires < Date.now()
}
