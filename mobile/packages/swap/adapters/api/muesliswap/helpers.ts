import {difference} from '@yoroi/common'

import {Dex} from './types'

export function getAllowedDexes({
  blocked = [],
}: {
  blocked?: ReadonlyArray<Dex>
} = {}): ReadonlyArray<Dex> {
  const dexesWithoutUnsupported = Object.values(Dex).filter(
    (dex) => dex !== Dex.Unsupported,
  )
  return difference(dexesWithoutUnsupported, blocked)
}
