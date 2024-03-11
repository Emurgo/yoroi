import {storageSerializer} from '@yoroi/common'
import {App, Portfolio} from '@yoroi/types'
import {freeze} from 'immer'
import {deserializer} from '../../transformers/deserializer'

export const portfolioStorageMaker = ({
  tokenInfoStorage,
  tokenDiscoveryStorage,
  balanceStorage,
  primaryBreakdownStorage,
}: {
  tokenInfoStorage: App.ObservableStorage<false, Portfolio.Token.Id>
  tokenDiscoveryStorage: App.ObservableStorage<false, Portfolio.Token.Id>
  balanceStorage: App.ObservableStorage<false, Portfolio.Token.Id>
  primaryBreakdownStorage: App.ObservableStorage<false, Portfolio.Token.Id>
}) => {
  const infos = {
    save: (
      entries: ReadonlyArray<
        [Portfolio.Token.Id, App.CacheRecord<Portfolio.Token.Info>]
      >,
    ) =>
      tokenInfoStorage.multiSet<App.CacheRecord<Portfolio.Token.Info>>(
        entries,
        storageSerializer,
      ),
    read: (keys: ReadonlyArray<Portfolio.Token.Id>) =>
      tokenInfoStorage.multiGet<App.CacheRecord<Portfolio.Token.Info>>(keys),
    all: () =>
      tokenInfoStorage.multiGet<App.CacheRecord<Portfolio.Token.Info>>(
        tokenInfoStorage.getAllKeys(),
      ),
    keys: () => tokenInfoStorage.getAllKeys(),
    clear: () => tokenInfoStorage.clear(),
  }

  const discoveries = {
    save: (
      entries: ReadonlyArray<
        [Portfolio.Token.Id, App.CacheRecord<Portfolio.Token.Discovery>]
      >,
    ) =>
      tokenDiscoveryStorage.multiSet<
        App.CacheRecord<Portfolio.Token.Discovery>
      >(entries, storageSerializer),
    read: (keys: ReadonlyArray<Portfolio.Token.Id>) =>
      tokenDiscoveryStorage.multiGet<
        App.CacheRecord<Portfolio.Token.Discovery>
      >(keys, deserializer.tokenDiscoveryWithCache),
    all: () =>
      tokenDiscoveryStorage.multiGet<
        App.CacheRecord<Portfolio.Token.Discovery>
      >(tokenDiscoveryStorage.getAllKeys()),
    keys: () => tokenDiscoveryStorage.getAllKeys(),
    clear: () => tokenDiscoveryStorage.clear(),
  }

  const balances = {
    save: (
      entries: ReadonlyArray<[Portfolio.Token.Id, Portfolio.Token.Balance]>,
    ) =>
      balanceStorage.multiSet<Portfolio.Token.Balance>(
        entries,
        storageSerializer,
      ),
    read: (keys: ReadonlyArray<Portfolio.Token.Id>) =>
      balanceStorage.multiGet<Portfolio.Token.Balance>(
        keys,
        deserializer.tokenBalance,
      ),
    all: () =>
      balanceStorage.multiGet<Portfolio.Token.Balance>(
        balanceStorage.getAllKeys(),
      ),
    keys: () => balanceStorage.getAllKeys(),
    clear: () => balanceStorage.clear(),
  }

  const primaryBalanceBreakdown = {
    save: (breakdown: Readonly<Portfolio.BalancePrimaryBreakdown>) =>
      primaryBreakdownStorage.setItem(
        breakdown.info.id,
        breakdown,
        storageSerializer,
      ),
    read: (key: Portfolio.Token.Id) =>
      primaryBreakdownStorage.getItem<Portfolio.BalancePrimaryBreakdown>(
        key,
        deserializer.primaryBreakdown,
      ),
    clear: () => primaryBreakdownStorage.clear(),
  }

  const clear = () => {
    tokenDiscoveryStorage.clear()
    tokenInfoStorage.clear()
    balanceStorage.clear()
    primaryBreakdownStorage.clear()
  }

  return freeze(
    {
      token: {
        infos,
        discoveries,
      },
      balances,
      primaryBalanceBreakdown,
      clear,
    },
    true,
  )
}
