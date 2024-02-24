import {App, Portfolio} from '@yoroi/types'
import {freeze} from 'immer'

/**
 * Creates a portfolio storage maker.
 * @param {Object} options - The options for creating the portfolio storage.
 * @param {App.ObservableStorage<false, Portfolio.Token.Id>} options.sharedStorage - The shared storage for the portfolio.
 * @param {App.ObservableStorage<false>} options.balanceStorage - The wallet storage for the portfolio.
 * @returns {Object} - The portfolio storage maker.
 */
export const portfolioStorageMaker = ({
  tokenInfoStorage,
  tokenDiscoveryStorage,
  balanceStorage,
}: {
  tokenInfoStorage: App.ObservableStorage<false, Portfolio.Token.Id>
  tokenDiscoveryStorage: App.ObservableStorage<false, Portfolio.Token.Id>
  balanceStorage: App.ObservableStorage<false, Portfolio.Token.Id>
}) => {
  const infos = {
    save: (
      entries: ReadonlyArray<
        [Portfolio.Token.Id, App.CacheRecord<Portfolio.Token.Info>]
      >,
    ) =>
      tokenInfoStorage.multiSet<App.CacheRecord<Portfolio.Token.Info>>(entries),
    read: (keys: ReadonlyArray<Portfolio.Token.Id>) =>
      tokenInfoStorage.multiGet<App.CacheRecord<Portfolio.Token.Info>>(keys),
  }

  const discoveries = {
    save: (
      entries: ReadonlyArray<
        [Portfolio.Token.Id, App.CacheRecord<Portfolio.Token.Discovery>]
      >,
    ) =>
      tokenDiscoveryStorage.multiSet<
        App.CacheRecord<Portfolio.Token.Discovery>
      >(entries),
    read: (keys: ReadonlyArray<Portfolio.Token.Id>) =>
      tokenDiscoveryStorage.multiGet<
        App.CacheRecord<Portfolio.Token.Discovery>
      >(keys),
  }

  const balances = {
    save: (entries: ReadonlyArray<[Portfolio.Token.Id, Portfolio.Amount]>) =>
      tokenDiscoveryStorage.multiSet<Portfolio.Amount>(entries),
    read: (keys: ReadonlyArray<Portfolio.Token.Id>) =>
      tokenDiscoveryStorage.multiGet<Portfolio.Amount>(keys),
  }

  const clear = () => {
    tokenDiscoveryStorage.clear()
    tokenInfoStorage.clear()
    balanceStorage.clear()
  }

  return freeze(
    {
      token: {
        infos,
        discoveries,
      },
      balances,
      clear,
    },
    true,
  )
}
