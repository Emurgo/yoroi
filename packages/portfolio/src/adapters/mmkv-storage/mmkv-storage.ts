import {App, Portfolio} from '@yoroi/types'
import {freeze} from 'immer'

/**
 * Creates a portfolio storage maker.
 * @param {Object} options - The options for creating the portfolio storage.
 * @param {App.ObservableStorage<false, Portfolio.Token.Id>} options.sharedStorage - The shared storage for the portfolio.
 * @param {App.ObservableStorage<false>} options.walletStorage - The wallet storage for the portfolio.
 * @returns {Object} - The portfolio storage maker.
 */
export const portfolioStorageMaker = ({
  tokenInfoStorage,
  tokenDiscoveryStorage,
  walletStorage,
}: {
  tokenInfoStorage: App.ObservableStorage<false, Portfolio.Token.Id>
  tokenDiscoveryStorage: App.ObservableStorage<false, Portfolio.Token.Id>
  walletStorage: App.ObservableStorage<false>
}) => {
  console.log('walletStorage', walletStorage)

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

  const clear = () => {
    tokenDiscoveryStorage.clear()
    tokenInfoStorage.clear()
    walletStorage.clear()
  }

  return freeze(
    {
      token: {
        infos,
        discoveries,
      },
      clear,
    },
    true,
  )
}
