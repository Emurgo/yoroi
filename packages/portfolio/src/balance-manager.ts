import {App, Portfolio} from '@yoroi/types'
import {
  hasEntryValue,
  hasValue,
  observerMaker,
  queueTaskMaker,
} from '@yoroi/common'
import {freeze} from 'immer'
import {filter} from 'rxjs'

import {sortTokenAmountsByInfo} from './helpers/sorting'
import {isEventTokenManagerSync} from './validators/token-manager-event-sync'
import {isFt} from './helpers/is-ft'
import {isNft} from './helpers/is-nft'

export const portfolioBalanceManagerMaker = (
  {
    tokenManager,
    primaryTokenInfo,
    storage,
    sourceId,
  }: {
    tokenManager: Portfolio.Manager.Token
    storage: Portfolio.Storage.Balance
    primaryTokenInfo: Portfolio.Token.Info
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
  let secondaries: Readonly<Map<Portfolio.Token.Id, Portfolio.Token.Amount>> =
    freeze(new Map())
  let sortedBalances: Readonly<{
    all: ReadonlyArray<Portfolio.Token.Amount>
    nfts: ReadonlyArray<Portfolio.Token.Amount>
    fts: ReadonlyArray<Portfolio.Token.Amount>
  }> = freeze({
    all: [],
    nfts: [],
    fts: [],
  })
  let primaryBreakdown: Readonly<Portfolio.PrimaryBreakdown> = freeze(
    {
      lockedAsStorageCost: 0n,
      availableRewards: 0n,
      totalFromTxs: 0n,
    },
    true,
  )
  let primaryBalance: Readonly<Portfolio.Token.Amount> = freeze(
    {
      quantity: 0n,
      info: primaryTokenInfo,
    },
    true,
  )

  const sortBalances = balancesSorter({
    primaryTokenInfo,
  })
  const updatePrimary = primaryUpdater({
    primaryTokenInfo,
    storagePrimaryBreakdown: storage.primaryBreakdown,
  })

  const subscription = tokenManager.observable$
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
    const cachedPrimaryBreakdown = freeze(storage.primaryBreakdown.read(), true)
    const lockedAsStorageCost =
      cachedPrimaryBreakdown?.lockedAsStorageCost ?? 0n
    const totalFromTxs = cachedPrimaryBreakdown?.totalFromTxs ?? 0n
    const availableRewards = cachedPrimaryBreakdown?.availableRewards ?? 0n

    const balance = totalFromTxs + availableRewards

    const newPrimaryBreakdown: Readonly<Portfolio.PrimaryBreakdown> = freeze({
      lockedAsStorageCost,
      availableRewards,
      totalFromTxs,
    })

    const newPrimaryBalance: Readonly<Portfolio.Token.Amount> = freeze(
      {
        quantity: balance,
        info: primaryTokenInfo,
      },
      true,
    )
    secondaries = freeze(
      new Map(storage.balances.all().filter(hasEntryValue)),
      true,
    )
    const sorted = sortBalances({
      balances: [...secondaries.values(), newPrimaryBalance],
    })
    sortedBalances = splitByType(sorted)
    primaryBreakdown = newPrimaryBreakdown
    primaryBalance = newPrimaryBalance
    isHydrated = true

    observer.notify({on: Portfolio.Event.ManagerOn.Hydrate, sourceId})
  }

  const refresh = () =>
    syncBalances({
      primaryStated: primaryBreakdown,
      secondaryBalances: secondaries,
    })

  const updatePrimaryStated = ({
    lockedAsStorageCost,
    totalFromTxs,
  }: Pick<
    Portfolio.PrimaryBreakdown,
    'totalFromTxs' | 'lockedAsStorageCost'
  >) => {
    // state
    const {availableRewards} = primaryBreakdown
    const newPrimaryBreakdown: Readonly<Portfolio.PrimaryBreakdown> = {
      availableRewards,
      // args
      lockedAsStorageCost,
      totalFromTxs,
    }
    const newPrimaryBalance = updatePrimary(newPrimaryBreakdown)
    primaryBreakdown = newPrimaryBreakdown
    primaryBalance = newPrimaryBalance
    observer.notify({
      on: Portfolio.Event.ManagerOn.Sync,
      sourceId,
      mode: 'primary-stated',
    })
  }

  const updatePrimaryDerived = ({
    availableRewards,
  }: Pick<Portfolio.PrimaryBreakdown, 'availableRewards'>) => {
    // state
    const {totalFromTxs, lockedAsStorageCost} = primaryBreakdown
    const newPrimaryBreakdown: Readonly<Portfolio.PrimaryBreakdown> = {
      lockedAsStorageCost,
      totalFromTxs,
      // args
      availableRewards,
    }
    const newPrimaryBalance = updatePrimary(newPrimaryBreakdown)
    primaryBreakdown = newPrimaryBreakdown
    primaryBalance = newPrimaryBalance
    observer.notify({
      on: Portfolio.Event.ManagerOn.Sync,
      sourceId,
      mode: 'primary-derived',
    })
  }

  const syncBalances = ({
    primaryStated,
    secondaryBalances,
  }: {
    primaryStated: Readonly<
      Pick<Portfolio.PrimaryBreakdown, 'totalFromTxs' | 'lockedAsStorageCost'>
    >
    secondaryBalances: Readonly<
      Map<Portfolio.Token.Id, Pick<Portfolio.Token.Amount, 'quantity'>>
    >
  }) => {
    queue.enqueue(
      () =>
        new Promise<void>((resolve, reject) => {
          const asyncExecutor = async () => {
            const secondaryTokenIds = [...secondaryBalances.keys()]
            const tokenInfos = await tokenManager.sync({
              secondaryTokenIds,
              sourceId,
            })

            const newBalances: Map<Portfolio.Token.Id, Portfolio.Token.Amount> =
              new Map()
            secondaryBalances.forEach(({quantity}, id) => {
              const cachedTokenInfo = tokenInfos.get(id)
              if (!cachedTokenInfo)
                return reject(
                  new App.Errors.InvalidState(
                    'Missing token info in cache should never happen',
                  ),
                )

              const secondaryBalance: Portfolio.Token.Amount = {
                info: cachedTokenInfo.record,
                quantity,
              }
              newBalances.set(id, secondaryBalance)
            })

            const {availableRewards} = primaryBreakdown
            const {totalFromTxs, lockedAsStorageCost} = primaryStated
            const newPrimaryBreakdown: Readonly<Portfolio.PrimaryBreakdown> = {
              totalFromTxs,
              lockedAsStorageCost,
              availableRewards,
            }

            // persist
            storage.balances.clear()
            storage.balances.save([...newBalances.entries()])
            const newPrimaryBalance = updatePrimary(newPrimaryBreakdown)

            // update state
            secondaries = freeze(newBalances, true)
            const sorted = sortBalances({
              balances: [...secondaries.values(), newPrimaryBalance],
            })
            sortedBalances = splitByType(sorted)
            primaryBreakdown = newPrimaryBreakdown
            primaryBalance = newPrimaryBalance

            observer.notify({
              on: Portfolio.Event.ManagerOn.Sync,
              sourceId,
              mode: 'all',
            })
            resolve()
          }
          asyncExecutor()
        }),
    )
  }

  const getPrimaryBreakdown = () => {
    return primaryBreakdown
  }

  const getPrimaryBalance = () => {
    return primaryBalance
  }

  const getBalances = () => {
    return sortedBalances
  }

  const destroy = () => {
    observer.destroy()
    queue.destroy()
    tokenManager.unsubscribe(subscription)
  }

  const clear = () => {
    queue.enqueue(
      () =>
        new Promise<void>((resolve) => {
          const asyncExecutor = async () => {
            storage.balances.clear()
            storage.primaryBreakdown.clear()

            secondaries = freeze(new Map(), true)
            primaryBreakdown = freeze(
              {
                lockedAsStorageCost: 0n,
                availableRewards: 0n,
                totalFromTxs: 0n,
              },
              true,
            )
            primaryBalance = freeze(
              {
                quantity: 0n,
                info: primaryTokenInfo,
              },
              true,
            )
            sortedBalances = freeze(
              {
                all: [],
                nfts: [],
                fts: [],
              },
              true,
            )

            observer.notify({
              on: Portfolio.Event.ManagerOn.Clear,
              sourceId,
            })

            resolve()
          }
          asyncExecutor()
        }),
    )
  }

  return freeze(
    {
      hydrate,
      refresh,

      syncBalances,
      updatePrimaryDerived,
      updatePrimaryStated,

      subscribe: observer.subscribe,
      unsubscribe: observer.unsubscribe,
      observable$: observer.observable,

      getPrimaryBreakdown,
      getPrimaryBalance,
      getBalances,

      destroy,
      clear,
    },
    true,
  )
}

const balancesSorter =
  ({primaryTokenInfo}: {primaryTokenInfo: Portfolio.Token.Info}) =>
  ({
    balances,
  }: {
    balances: ReadonlyArray<Portfolio.Token.Amount | null | undefined>
  }) =>
    freeze(
      sortTokenAmountsByInfo({
        amounts: balances.filter(hasValue),
        primaryTokenInfo,
      }),
      true,
    )

const isNotTriggeredBySelf =
  (sourceId: Portfolio.Event.SourceId['sourceId']) =>
  (dtoEvent: Portfolio.Event.TokenManager) =>
    dtoEvent.sourceId !== sourceId

const hasStaleTokenInfo =
  (secondaries: Readonly<Map<`${string}.${string}`, Portfolio.Token.Amount>>) =>
  (dtoEvent: Portfolio.Event.TokenManagerSync) =>
    dtoEvent.ids.some((id) => secondaries.has(id))

const refreshTokenInfos = async ({
  tokenManager,
  secondaries,
  sourceId,
}: {
  tokenManager: Portfolio.Manager.Token
  secondaries: Readonly<Map<Portfolio.Token.Id, Portfolio.Token.Amount | null>>
} & Portfolio.Event.SourceId) => {
  const tokenInfos = await tokenManager.sync({
    secondaryTokenIds: [...secondaries.keys()],
    sourceId,
  })

  const newBalances: Array<[Portfolio.Token.Id, Portfolio.Token.Amount]> = [
    ...secondaries.values(),
  ]
    .filter(hasValue)
    .map((balance) => {
      const newBalance: Portfolio.Token.Amount = {
        ...balance,
        info: tokenInfos.get(balance.info.id)?.record ?? balance.info,
      }
      return [newBalance.info.id, newBalance]
    })

  return freeze(new Map(newBalances), true)
}

const splitByType = (sortedBalances: ReadonlyArray<Portfolio.Token.Amount>) => {
  return freeze(
    {
      all: sortedBalances,
      fts: sortedBalances.filter(({info}) => isFt(info)),
      nfts: sortedBalances.filter(({info}) => isNft(info)),
    },
    true,
  )
}

const primaryUpdater =
  ({
    storagePrimaryBreakdown,
    primaryTokenInfo,
  }: Readonly<{
    storagePrimaryBreakdown: Portfolio.Storage.Balance['primaryBreakdown']
    primaryTokenInfo: Portfolio.Token.Info
  }>) =>
  (
    newPrimaryBreakdown: Readonly<Portfolio.PrimaryBreakdown>,
  ): Readonly<Portfolio.Token.Amount> => {
    storagePrimaryBreakdown.clear()
    storagePrimaryBreakdown.save(newPrimaryBreakdown)
    const {availableRewards, totalFromTxs} = newPrimaryBreakdown
    return freeze(
      {
        info: primaryTokenInfo,
        quantity: availableRewards + totalFromTxs,
      },
      true,
    )
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
