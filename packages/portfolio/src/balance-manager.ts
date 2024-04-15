import {App, Portfolio} from '@yoroi/types'
import {
  hasEntryValue,
  hasValue,
  observerMaker,
  queueTaskMaker,
} from '@yoroi/common'
import {freeze} from 'immer'
import {filter} from 'rxjs'

import {sortTokenBalances} from './helpers/sorting'
import {TokenInfoAndDiscovery} from './types'
import {isEventTokenManagerSync} from './validators/token-manager-event-sync'
import {isFt} from './helpers/is-ft'
import {isNft} from './helpers/is-nft'

export const portfolioBalanceManagerMaker = (
  {
    tokenManager,
    primaryToken,
    storage,
    sourceId,
  }: {
    tokenManager: Portfolio.Manager.Token
    storage: Portfolio.Storage.Balance
    primaryToken: TokenInfoAndDiscovery
  } & Portfolio.Event.SourceId,
  {
    observer = observerMaker<Portfolio.Event.BalanceManager>(),
    queue = queueTaskMaker(),
  }: {
    observer?: App.ObserverManager<Portfolio.Event.BalanceManager>
    queue?: App.QueueTaskManager
  } = {},
): Portfolio.Manager.Balance => {
  let isHydrated = false
  let secondaries: Readonly<Map<Portfolio.Token.Id, Portfolio.Token.Balance>> =
    freeze(new Map())
  let sortedBalances: Readonly<{
    all: ReadonlyArray<Portfolio.Token.Balance>
    nfts: ReadonlyArray<Portfolio.Token.Balance>
    fts: ReadonlyArray<Portfolio.Token.Balance>
  }> = freeze({
    all: [],
    nfts: [],
    fts: [],
  })
  let primaryBreakdown: Readonly<Portfolio.BalancePrimaryBreakdown> = freeze(
    {
      info: primaryToken.info,
      balance: 0n,
      lockedInBuiltTxs: 0n,
      minRequiredByTokens: 0n,
      records: [],
    },
    true,
  )

  const sort = sortTokenBalancesWrapper({
    primaryTokenInfo: primaryToken.info,
  })
  const updatePrimary = primaryTokenUpdaterWrapper({
    primaryTokenInfo: primaryToken.info,
    storagePrimaryBalanceBreakdown: storage.primaryBalanceBreakdown,
  })

  const subscription = tokenManager.observable
    .pipe(
      filter(() => isHydrated),
      filter((dtoEvent) => isNotTriggeredBySelf(sourceId)(dtoEvent)),
      filter(
        (dtoEvent) =>
          isEventTokenManagerSync(dtoEvent) &&
          hasStaleTokenInfo(secondaries)(dtoEvent),
      ),
    )
    .subscribe(() => {
      queue.enqueue(
        () =>
          new Promise<void>((resolve) => {
            const asyncExecutor = async () => {
              secondaries = await refreshTokenInfos({
                tokenManager,
                secondaries,
                sourceId,
              })

              resolve()
            }
            asyncExecutor()
          }),
      )
    })

  const hydrate = () => {
    const cachedPrimaryBreakdown = freeze(
      storage.primaryBalanceBreakdown.read(primaryToken.info.id),
      true,
    )
    if (cachedPrimaryBreakdown) {
      primaryBreakdown = cachedPrimaryBreakdown
    }
    const primaryTokenBalance: Readonly<Portfolio.Token.Balance> = freeze(
      {
        balance: primaryBreakdown.balance,
        lockedInBuiltTxs: primaryBreakdown.lockedInBuiltTxs,
        info: primaryToken.info,
      },
      true,
    )
    secondaries = freeze(
      new Map(storage.balances.all().filter(hasEntryValue)),
      true,
    )
    const sorted = sort({
      balances: [...secondaries.values(), primaryTokenBalance],
    })
    sortedBalances = splitByType(sorted)
    isHydrated = true

    observer.notify({on: Portfolio.Event.ManagerOn.Hydrate, sourceId})
  }

  const refresh = async () =>
    sync({primaryBalance: primaryBreakdown, secondaryBalances: secondaries})

  const sync = ({
    primaryBalance,
    secondaryBalances,
  }: {
    primaryBalance: Readonly<Omit<Portfolio.BalancePrimaryBreakdown, 'info'>>
    secondaryBalances: Readonly<
      | Map<Portfolio.Token.Id, Omit<Portfolio.Token.Balance, 'info'>>
      | Map<Portfolio.Token.Id, Portfolio.Token.Balance>
    >
  }) => {
    if (!isHydrated) hydrate()

    queue.enqueue(
      () =>
        new Promise<void>((resolve, reject) => {
          const asyncExecutor = async () => {
            const secondaryTokenIds = [...secondaryBalances.keys()]
            const tokenInfos = await tokenManager.sync({
              secondaryTokenIds,
              sourceId,
            })

            const newBalances: Map<
              Portfolio.Token.Id,
              Portfolio.Token.Balance
            > = new Map()
            secondaryBalances.forEach(({balance, lockedInBuiltTxs}, id) => {
              const cachedTokenInfo = tokenInfos.get(id)
              if (!cachedTokenInfo)
                return reject(
                  new App.Errors.InvalidState(
                    'Missing token info in cache should never happen',
                  ),
                )

              const tokenBalance: Portfolio.Token.Balance = {
                info: cachedTokenInfo.record,
                balance,
                lockedInBuiltTxs,
              }
              newBalances.set(id, tokenBalance)
            })

            // persist
            storage.balances.clear()
            storage.balances.save([...newBalances.entries()])

            const {newPrimaryBreakdown, newPrimaryTokenBalance} =
              updatePrimary(primaryBalance)

            // update state
            secondaries = freeze(newBalances, true)
            const sorted = sort({
              balances: [...secondaries.values(), newPrimaryTokenBalance],
            })
            sortedBalances = splitByType(sorted)
            primaryBreakdown = newPrimaryBreakdown

            observer.notify({on: Portfolio.Event.ManagerOn.Sync, sourceId})
            resolve()
          }
          asyncExecutor()
        }),
    )
  }

  function getPrimaryBreakdown() {
    return primaryBreakdown
  }

  function getBalances() {
    return sortedBalances
  }

  function destroy() {
    observer.destroy()
    queue.destroy()
    tokenManager.unsubscribe(subscription)
  }

  return freeze(
    {
      hydrate,
      refresh,
      sync,

      subscribe: observer.subscribe,
      unsubscribe: observer.unsubscribe,
      observable: observer.observable,

      getPrimaryBreakdown,
      getBalances,
      destroy,
    },
    true,
  )
}

const sortTokenBalancesWrapper =
  ({primaryTokenInfo}: {primaryTokenInfo: Portfolio.Token.Info}) =>
  ({
    balances,
  }: {
    balances: ReadonlyArray<Portfolio.Token.Balance | null | undefined>
  }) =>
    freeze(
      sortTokenBalances({
        tokenBalances: balances.filter(hasValue),
        primaryTokenInfo,
      }),
      true,
    )

const isNotTriggeredBySelf =
  (sourceId: Portfolio.Event.SourceId['sourceId']) =>
  (dtoEvent: Portfolio.Event.TokenManager) =>
    dtoEvent.sourceId !== sourceId

const hasStaleTokenInfo =
  (
    secondaries: Readonly<Map<`${string}.${string}`, Portfolio.Token.Balance>>,
  ) =>
  (dtoEvent: Portfolio.Event.TokenManagerSync) =>
    dtoEvent.ids.some((id) => secondaries.has(id))

const refreshTokenInfos = async ({
  tokenManager,
  secondaries,
  sourceId,
}: {
  tokenManager: Portfolio.Manager.Token
  secondaries: Readonly<Map<Portfolio.Token.Id, Portfolio.Token.Balance | null>>
} & Portfolio.Event.SourceId) => {
  const tokenInfos = await tokenManager.sync({
    secondaryTokenIds: [...secondaries.keys()],
    sourceId,
  })

  const newBalances: Array<[Portfolio.Token.Id, Portfolio.Token.Balance]> = [
    ...secondaries.values(),
  ]
    .filter(hasValue)
    .map((balance) => {
      const newBalance: Portfolio.Token.Balance = {
        ...balance,
        info: tokenInfos.get(balance.info.id)?.record ?? balance.info,
      }
      return [newBalance.info.id, newBalance]
    })

  return freeze(new Map(newBalances), true)
}

const splitByType = (
  sortedBalances: ReadonlyArray<Portfolio.Token.Balance>,
) => {
  return freeze(
    {
      all: sortedBalances,
      fts: sortedBalances.filter(({info}) => isFt(info)),
      nfts: sortedBalances.filter(({info}) => isNft(info)),
    },
    true,
  )
}

const primaryTokenUpdaterWrapper =
  ({
    storagePrimaryBalanceBreakdown,
    primaryTokenInfo,
  }: Readonly<{
    storagePrimaryBalanceBreakdown: Portfolio.Storage.Balance['primaryBalanceBreakdown']
    primaryTokenInfo: Portfolio.Token.Info
  }>) =>
  (
    primaryBalance: Readonly<Omit<Portfolio.BalancePrimaryBreakdown, 'info'>>,
  ) => {
    const newPrimaryBreakdown: Readonly<Portfolio.BalancePrimaryBreakdown> = {
      ...primaryBalance,
      info: primaryTokenInfo,
    }
    const newPrimaryTokenBalance: Readonly<Portfolio.Token.Balance> = freeze(
      {
        balance: primaryBalance.balance,
        lockedInBuiltTxs: primaryBalance.lockedInBuiltTxs,
        info: primaryTokenInfo,
      },
      true,
    )
    storagePrimaryBalanceBreakdown.clear()
    storagePrimaryBalanceBreakdown.save(newPrimaryBreakdown)
    return freeze({newPrimaryBreakdown, newPrimaryTokenBalance}, true)
  }

// TODO list
// - [ ] Allow users to specify custom properties
// - [ ] Allow users to create baskets for tokens
// - [ ] Allow users to add tokens to baskets
// - [ ] Allow users to remove tokens from baskets
// - [ ] Allow users to delete baskets
// - [ ] - getBaskets + Baskets event
// - [ ] Allow users to mark tokens as favorite
// - [ ] Allow users to mark to auto-garbage tokens
// - [ ] Allow users to ban tokens (mark as scam)
// - [ ] - override token info + discovery + Event
