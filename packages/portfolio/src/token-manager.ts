import {App, Portfolio} from '@yoroi/types'
import {
  cacheManageMultiRequest,
  extractEntryCacheInfo,
  hasEntryValue,
  observerMaker,
} from '@yoroi/common'
import {freeze} from 'immer'

import {createCachedUnknownTokenInfo} from './helpers/create-cached-unknown-token-info'

export const portfolioTokenManagerMaker = (
  {
    api,
    storage,
  }: {
    api: Portfolio.Api.Api
    storage: Portfolio.Storage.Token
  },
  {
    observer = observerMaker<Portfolio.Event.TokenManager>(),
  }: {observer?: App.ObserverManager<Portfolio.Event.TokenManager>} = {},
): Portfolio.Manager.Token => {
  const cachedInfosWithoutRecord: Readonly<
    Map<Portfolio.Token.Id, App.CacheInfo>
  > = new Map()

  const hydrate = ({sourceId}: Portfolio.Event.SourceId) => {
    // load only the cache info, drop the record
    storage.token.infos
      .all()
      .map(extractEntryCacheInfo)
      .filter(hasEntryValue)
      .forEach(([id, value]) => cachedInfosWithoutRecord.set(id, freeze(value)))

    observer.notify({on: Portfolio.Event.ManagerOn.Hydrate, sourceId})
  }

  const sync = async ({
    secondaryTokenIds,
    sourceId,
  }: {
    secondaryTokenIds: ReadonlyArray<Portfolio.Token.Id>
  } & Portfolio.Event.SourceId) => {
    const {records, unknownIds, updatedIds, isInvalidated} =
      await cacheManageMultiRequest<Portfolio.Token.Id, Portfolio.Token.Info>({
        request: async (ids) => api.tokenInfos(ids),
        cachedInfosWithoutRecord: freeze(new Map(cachedInfosWithoutRecord)),
        ids: secondaryTokenIds,
        unknownRecordFactory: createCachedUnknownTokenInfo,
        persistance: freeze({
          save: storage.token.infos.save,
          read: storage.token.infos.read,
        }),
      })

    const recordsEntries = [...records.entries()]
    recordsEntries
      .map(extractEntryCacheInfo)
      .filter(hasEntryValue)
      .forEach(([id, record]) =>
        cachedInfosWithoutRecord.set(id, freeze(record)),
      )

    // if the cache was invalidated, notify
    if (isInvalidated)
      observer.notify({
        on: Portfolio.Event.ManagerOn.Sync,
        ids: [...updatedIds, ...unknownIds],
        sourceId,
      })

    // when using subscriptions, or streams, read from storage base on callback args, not from this return
    return records
  }

  const clear = () => {}

  const destroy = () => {
    observer.destroy()
  }

  return freeze(
    {
      hydrate,
      sync,

      subscribe: observer.subscribe,
      unsubscribe: observer.unsubscribe,
      observable$: observer.observable,

      destroy,
      clear,
    },
    true,
  )
}
