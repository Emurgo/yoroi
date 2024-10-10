import {storageSerializer} from '@yoroi/common'
import {App, Portfolio} from '@yoroi/types'
import {freeze} from 'immer'

export const portfolioTokenStorageMaker = ({
  tokenInfoStorage,
}: {
  tokenInfoStorage: App.ObservableStorage<false, Portfolio.Token.Id>
}): Portfolio.Storage.Token => {
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

  const clear = () => {
    tokenInfoStorage.clear()
  }

  return freeze(
    {
      token: {
        infos,
      },
      clear,
    },
    true,
  )
}
