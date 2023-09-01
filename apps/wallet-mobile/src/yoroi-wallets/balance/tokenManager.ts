import {Balance, Writable} from '@yoroi/types'
import {difference} from '@yoroi/wallets'

import {BalanceTokenManagerOptions} from './types'

export const tokenManagerMaker = ({storage, api}: BalanceTokenManagerOptions) => {
  const {tokens} = storage
  let knownTokenIds = new Set<Balance.Token['info']['id']>()

  const update = async (ids: ReadonlyArray<Balance.Token['info']['id']>, avoidCache = false): Promise<void> => {
    if (avoidCache) {
      const refreshedTokens = (await api.tokens(ids)) as Writable<Balance.Token>[]
      await tokens.saveMany(refreshedTokens)
    } else {
      const idsNotCached = difference(ids, Array.from(knownTokenIds))
      if (idsNotCached.length > 0) {
        const fetchedTokens = (await api.tokens(idsNotCached)) as Writable<Balance.Token>[]
        await tokens.saveMany(fetchedTokens)
      }
    }
    await hydrateKnownTokenIds()
  }

  const hydrateKnownTokenIds = () =>
    tokens.getAllKeys().then((cachedIds) => {
      knownTokenIds = new Set(cachedIds)
    })

  return async () => {
    await hydrateKnownTokenIds()

    return {
      hydrateKnownTokenIds,
      update,
      tokens,
    } as const
  }
}
