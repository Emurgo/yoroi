import {storageSerializer} from '@yoroi/common'
import {App, Portfolio} from '@yoroi/types'
import {freeze} from 'immer'
import {deserializers} from '../../transformers/deserializers'

export const portfolioBalanceStorageMaker = ({
  balanceStorage,
  primaryBreakdownStorage,
  primaryTokenId,
}: {
  balanceStorage: App.ObservableStorage<false, Portfolio.Token.Id>
  primaryBreakdownStorage: App.ObservableStorage<false, Portfolio.Token.Id>
  primaryTokenId: Portfolio.Token.Id
}): Portfolio.Storage.Balance => {
  const balances = {
    save: (
      entries: ReadonlyArray<[Portfolio.Token.Id, Portfolio.Token.Amount]>,
    ) =>
      balanceStorage.multiSet<Portfolio.Token.Amount>(
        entries,
        storageSerializer,
      ),
    read: (keys: ReadonlyArray<Portfolio.Token.Id>) =>
      balanceStorage.multiGet<Portfolio.Token.Amount>(
        keys,
        deserializers.tokenAmount,
      ),
    all: () =>
      balanceStorage.multiGet<Portfolio.Token.Amount>(
        balanceStorage.getAllKeys(),
        deserializers.tokenAmount,
      ),
    keys: () => balanceStorage.getAllKeys(),
    clear: () => balanceStorage.clear(),
  }

  const primaryBreakdown = {
    save: (breakdown: Readonly<Portfolio.PrimaryBreakdown>) =>
      primaryBreakdownStorage.setItem(
        primaryTokenId,
        breakdown,
        storageSerializer,
      ),
    read: () =>
      primaryBreakdownStorage.getItem<Portfolio.PrimaryBreakdown>(
        primaryTokenId,
        deserializers.primaryBreakdown,
      ),
    clear: () => primaryBreakdownStorage.clear(),
  }

  const clear = () => {
    balanceStorage.clear()
    primaryBreakdownStorage.clear()
  }

  return freeze(
    {
      balances,
      primaryBreakdown,
      clear,
    },
    true,
  )
}
