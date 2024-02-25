import {storageSerializer} from '@yoroi/common'
import {App, Portfolio} from '@yoroi/types'
import {freeze} from 'immer'
import {storageDeserializers} from './transformers'

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
      tokenInfoStorage.multiSet<App.CacheRecord<Portfolio.Token.Info>>(
        entries,
        storageSerializer,
      ),
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
      >(entries, storageSerializer),
    read: (keys: ReadonlyArray<Portfolio.Token.Id>) =>
      tokenDiscoveryStorage.multiGet<
        App.CacheRecord<Portfolio.Token.Discovery>
      >(keys, storageDeserializers.tokenDiscovery),
  }

  const balances = {
    save: (entries: ReadonlyArray<[Portfolio.Token.Id, Portfolio.Amount]>) =>
      balanceStorage.multiSet<Portfolio.Amount>(entries, storageSerializer),
    read: (keys: ReadonlyArray<Portfolio.Token.Id>) =>
      balanceStorage.multiGet<Portfolio.Amount>(
        keys,
        storageDeserializers.balance,
      ),
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
