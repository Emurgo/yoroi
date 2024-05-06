import {storageSerializer} from '@yoroi/common'
import {App, Portfolio} from '@yoroi/types'
import {freeze} from 'immer'
import {deserializers} from '../../transformers/deserializers'

export const portfolioBalanceStorageMaker = ({
  balanceStorage,
  primaryBreakdownStorage,
}: {
  balanceStorage: App.ObservableStorage<false, Portfolio.Token.Id>
  primaryBreakdownStorage: App.ObservableStorage<false, Portfolio.Token.Id>
}) => {
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
        deserializers.tokenBalance,
      ),
    all: () =>
      balanceStorage.multiGet<Portfolio.Token.Balance>(
        balanceStorage.getAllKeys(),
        deserializers.tokenBalance,
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
      primaryBalanceBreakdown,
      clear,
    },
    true,
  )
}
