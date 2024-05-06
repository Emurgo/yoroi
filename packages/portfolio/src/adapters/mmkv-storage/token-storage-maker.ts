import {storageSerializer} from '@yoroi/common'
import {App, Portfolio} from '@yoroi/types'
import {freeze} from 'immer'

import {deserializers} from '../../transformers/deserializers'

export const portfolioTokenStorageMaker = ({
  tokenInfoStorage,
  tokenDiscoveryStorage,
}: {
  tokenInfoStorage: App.ObservableStorage<false, Portfolio.Token.Id>
  tokenDiscoveryStorage: App.ObservableStorage<false, Portfolio.Token.Id>
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
      >(keys, deserializers.tokenDiscoveryWithCache),
    all: () =>
      tokenDiscoveryStorage.multiGet<
        App.CacheRecord<Portfolio.Token.Discovery>
      >(tokenDiscoveryStorage.getAllKeys()),
    keys: () => tokenDiscoveryStorage.getAllKeys(),
    clear: () => tokenDiscoveryStorage.clear(),
  }

  const clear = () => {
    tokenDiscoveryStorage.clear()
    tokenInfoStorage.clear()
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
