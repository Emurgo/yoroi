import {useQuery} from '@tanstack/react-query'
import {
  isBoolean,
  parseSafe,
  useAsyncStorage,
  useMutationWithInvalidations,
} from '@yoroi/common'

import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'

const storageRootDAppExplorer = 'dapp-explorer'
const storageDAppWelcome = 'dapp-explorer-welcome-dialog'

export const useShowWelcomeDApp = () => {
  const {wallet} = useSelectedWallet()
  const storage = useAsyncStorage()
  const walletStorage = storage.join(
    `wallet/${wallet.id}/${storageRootDAppExplorer}/`,
  )
  const queryKey = [wallet.id, storageDAppWelcome]

  const mutation = useMutationWithInvalidations({
    mutationFn: (value: boolean) =>
      walletStorage.setItem(storageDAppWelcome, value),
    invalidateQueries: [queryKey],
  })

  const query = useQuery({
    suspense: true,
    queryKey,
    queryFn: async () => {
      const storedStorage = await walletStorage.getItem(storageDAppWelcome)
      const parsed = parseSafe(storedStorage)
      return isBoolean(parsed) ? parsed : false
    },
  })

  return [query.data, mutation.mutate] as const
}
