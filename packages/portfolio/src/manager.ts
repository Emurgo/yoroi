import {Api, App, Chain, Nullable, Portfolio} from '@yoroi/types'
import {isExpired, observerMaker} from '@yoroi/common'
import {freeze} from 'immer'

import {
  AppApiRequestRecordWithCache,
  HttpStatusCode,
  PortfolioApi,
  PortfolioStorage,
} from './types'
import {recordWithETag} from './transformers/record-with-etag'
import {parseTokenInfoResponseWithCacheRecord} from './validators/token-info'

export const portfolioManagerMaker = ({
  // network,
  api,
  primaryTokenInfo,
  storage,
}: {
  network: Chain.Network
  api: Readonly<PortfolioApi>
  storage: Readonly<PortfolioStorage>
  primaryTokenInfo: Readonly<Portfolio.Token.Info>
}) => {
  let isHydrated = false
  let balances: Readonly<
    Map<Portfolio.Token.Id, Nullable<Portfolio.Token.Balance>>
  > = freeze(new Map())
  let cachedInfos: Readonly<Map<Portfolio.Token.Id, App.CacheInfo>> = freeze(
    new Map(),
  )
  let primaryBreakdown: Readonly<Portfolio.BalancePrimaryBreakdown> = freeze(
    {
      info: primaryTokenInfo,
      balance: BigInt(0),
      lockedInBuiltTxs: BigInt(0),
      minRequiredByTokens: BigInt(0),
      records: [],
    },
    true,
  )
  let observer = freeze(observerMaker<'sync'>(), true)
  // let tokenInfoIds: Readonly<Set<Portfolio.Token.Id>>
  // let tokenDiscoveryKeys: ReadonlyArray<Portfolio.Token.Id>

  const hydrate = () => {
    balances = freeze(new Map(storage.balances.all()), true)
    cachedInfos = freeze(
      new Map(
        storage.token.infos
          .all()
          .filter(
            (
              entry,
            ): entry is [
              Portfolio.Token.Id,
              App.CacheRecord<Portfolio.Token.Info>,
            ] => entry[1] !== null,
          )
          .map(([key, {expires, hash}]) => [key, {expires, hash}]),
      ),
      true,
    )
    const cachedPrimaryBreakdown = freeze(
      storage.primaryBalanceBreakdown.read(primaryTokenInfo.id),
      true,
    )
    if (cachedPrimaryBreakdown) {
      primaryBreakdown = cachedPrimaryBreakdown
    }

    isHydrated = true
  }

  const sync = async ({
    primaryBalance,
    secondaryBalances,
  }: {
    primaryBalance: Readonly<Omit<Portfolio.BalancePrimaryBreakdown, 'info'>>
    secondaryBalances: Readonly<
      Map<Portfolio.Token.Id, Portfolio.Token.Balance>
    >
  }) => {
    if (!isHydrated) hydrate()

    const {toFetch, fromCache} = getRecordsSource({
      newIds: [...secondaryBalances.keys()],
      cachedInfos,
    })

    const tokenInfosResponse = await api.tokenInfos(toFetch)
    const toReplace: Map<
      Portfolio.Token.Id,
      App.CacheRecord<Portfolio.Token.Info>
    > = new Map()
    const toRefresh: Map<Portfolio.Token.Id, number> = new Map()

    toFetch.forEach(([id]) => {
      const record = tokenInfosResponse[id]
      // api should respond with empty token when not found
      if (!record) throw new Api.Errors.ResponseMalformed()
      const parsed = parseTokenInfoResponseWithCacheRecord(record)
      if (!parsed) throw new Api.Errors.ResponseMalformed()
      const [statusCode] = parsed

      // refresh expires
      if (statusCode === HttpStatusCode.NotModified) {
        const [, maxAge] = parsed
        toRefresh.set(id, Date.now() + maxAge)
        return
      }

      // replace record
      const [, tokenInfo, eTag, maxAge] = parsed
      toReplace.set(id, {
        hash: eTag,
        expires: Date.now() + maxAge,
        record: tokenInfo,
      })
    })

    // add records to refresh into toReplace
    const recordsToRefresh = new Map(
      storage.token.infos.read([...toRefresh.keys()]),
    )
    recordsToRefresh.forEach((record, id) => {
      const expires = toRefresh.get(id)
      if (expires != null && record) {
        toReplace.set(id, {...record, expires})
      }
    })

    storage.token.infos.save([...toReplace.entries()])

    const cachedTokenInfos = new Map([
      ...toReplace.entries(),
      ...storage.token.infos.read(fromCache),
    ])

    // balances must never be consumed from storage directly
    // it can be empty while syncing
    // therefore memory only
    const newPrimaryBreakdown: Readonly<Portfolio.BalancePrimaryBreakdown> =
      freeze(
        {
          info: primaryTokenInfo,
          ...primaryBalance,
        },
        true,
      )
    storage.primaryBalanceBreakdown.clear()
    storage.primaryBalanceBreakdown.save(newPrimaryBreakdown)
    primaryBreakdown = newPrimaryBreakdown

    const newBalances: Map<Portfolio.Token.Id, Portfolio.Token.Balance> =
      new Map()
    secondaryBalances.forEach(({balance, lockedInBuiltTxs}, id) => {
      const cachedTokenInfo = cachedTokenInfos.get(id)
      if (!cachedTokenInfo) throw new App.Errors.InvalidState()
      const tokenBalance: Portfolio.Token.Balance = {
        info: cachedTokenInfo.record,
        balance,
        lockedInBuiltTxs,
      }
      newBalances.set(id, tokenBalance)
    })
    storage.balances.clear()
    storage.balances.save([...newBalances.entries()])
    balances = freeze(newBalances, true)

    observer.notify('sync')
  }

  return freeze(
    {
      hydrate,
      sync,
      primaryBreakdown,
      balances,
      observer,
    },
    true,
  )
}

export const getRecordsSource = ({
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
