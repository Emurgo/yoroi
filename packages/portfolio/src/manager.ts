import {Api, App, Chain, Portfolio} from '@yoroi/types'
import {isExpired} from '@yoroi/common'
import {freeze} from 'immer'

import {
  AppApiRequestRecordWithCache,
  PortfolioApi,
  PortfolioManager,
  PortfolioStorage,
} from './types'
import {recordWithETag} from './transformers/record-with-etag'

export const portfolioManagerMaker = ({
  // network,
  api,
  // primaryTokenInfo,
  storage,
}: {
  network: Chain.Network
  api: Readonly<PortfolioApi>
  storage: Readonly<PortfolioStorage>
  primaryTokenInfo: Readonly<Portfolio.Token.Info>
}): PortfolioManager => {
  let isHydrated = false
  let balances: Readonly<Map<Portfolio.Token.Id, Portfolio.Token.Balance>>
  let cachedInfos: Readonly<Map<Portfolio.Token.Id, App.CacheInfo>>
  // let tokenInfoIds: Readonly<Set<Portfolio.Token.Id>>
  // let tokenDiscoveryKeys: ReadonlyArray<Portfolio.Token.Id>

  const hydrate = () => {
    balances = freeze(new Map(storage.balances.all()), true)
    cachedInfos = freeze(
      new Map(
        storage.token.infos
          .all()
          .map(([key, {expires, hash}]) => [key, {expires, hash}] as const),
      ),
      true,
    )

    isHydrated = true
  }

  const sync = async (
    amounts: {
      primary: {
        totalBalance: BigInt
        totalLockedInTxs: BigInt
        breakdown: Readonly<Portfolio.BalancePrimaryBreakdown>
      }
      secondary: {
        balance: Readonly<Map<Portfolio.Token.Id, BigInt>>
        lockedInTxs: Readonly<Map<Portfolio.Token.Id, BigInt>>
      }
    },
    toCache: Readonly<Set<Portfolio.Token.Id>>,
  ) => {
    if (!isHydrated) hydrate()
    const {primary, secondary} = amounts

    const recordsToFetch = getRecordsToFetch({
      newIds: [...secondary.balance.keys()],
      cachedInfos,
    })

    const tokenInfosResponse = await api.tokenInfos(recordsToFetch)

    recordsToFetch.forEach(([id]) => {
      const record = tokenInfosResponse[id]
      if (!record) throw new Api.Errors.ResponseMalformed()

      const [statusCode, tokenInfo, eTag, maxAge] = record

      if (statusCode === 304) {
        // keep the current record, but update the expires with the now() + maxAge
        return
      }

      // otherwise, update the record
    })
  }

  return freeze(
    {
      hydrate,
      sync,
    },
    true,
  )
}

export const getRecordsToFetch = ({
  newIds,
  cachedInfos,
}: {
  newIds: ReadonlyArray<Portfolio.Token.Id>
  cachedInfos: Readonly<Map<Portfolio.Token.Id, App.CacheInfo>>
}) => {
  const toFetch: Array<AppApiRequestRecordWithCache<Portfolio.Token.Id>> = []
  const fromCache: Array<Portfolio.Token.Id> = []
  newIds.forEach((id) => {
    const cachedRecord = cachedInfos.get(id)
    if (cachedRecord) {
      if (isExpired(cachedRecord)) {
        toFetch.push(recordWithETag(id, cachedRecord.hash))
      } else {
        fromCache.push(id)
      }
    } else {
      toFetch.push(recordWithETag(id))
    }
  })
  return {toFetch, fromCache}
}
