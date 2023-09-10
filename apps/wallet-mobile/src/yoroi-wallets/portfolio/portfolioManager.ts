import {Balance, Writable} from '@yoroi/types'
import {difference} from '@yoroi/wallets'

import {PortfolioManagerOptions} from './types'

export const portfolioManagerMaker = ({storage, api}: PortfolioManagerOptions) => {
  const {tokens} = storage
  let knownTokenIds = new Set<Balance.Token['info']['id']>()

  const fetch = async (ids: ReadonlyArray<Balance.Token['info']['id']>, avoidCache = false): Promise<void> => {
    if (avoidCache) {
      const refreshedTokens = await api.tokens(ids)
      // storage api expects the data to be writable but it must not touch the original data
      await tokens.saveMany(refreshedTokens as unknown as Writable<Balance.Token>[])
    } else {
      const idsNotCached = difference(ids, Array.from(knownTokenIds))
      if (idsNotCached.length > 0) {
        const fetchedTokens = await api.tokens(idsNotCached)
        // storageh api expects the data to be writable but it must not touch the original data
        await tokens.saveMany(fetchedTokens as unknown as Writable<Balance.Token>[])
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
      tokens: {
        readMany: tokens.readMany,
        fetch,
      },
    } as const
  }
}
