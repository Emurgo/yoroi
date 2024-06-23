import {isBoolean, useAsyncStorage} from '@yoroi/common'
import * as React from 'react'
import {useMutation, UseMutationOptions, useQuery, UseQueryOptions} from 'react-query'

import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'

const storageRootDAppExplorer = 'dapp-explorer'
const storageDAppWelcome = 'dapp-explorer-welcome-dialog'
const isShowWelcomeDAppKey = 'isShowWelcomeDApp'

const useSetShowWelcomeDApp = (options?: UseMutationOptions<void, Error, boolean>) => {
  const {wallet} = useSelectedWallet()
  const storage = useAsyncStorage()
  const dAppExplorerStorage = storage.join(`wallet/${wallet.id}/${storageRootDAppExplorer}/`)

  const mutation = useMutation({
    mutationFn: (show) => dAppExplorerStorage.setItem(storageDAppWelcome, show),
    ...options,
  })

  return mutation.mutate
}

const useShowedWelcomeDApp = (options?: UseQueryOptions<boolean, Error, boolean>) => {
  const {wallet} = useSelectedWallet()
  const storage = useAsyncStorage()
  const dAppExplorerStorage = storage.join(`wallet/${wallet.id}/${storageRootDAppExplorer}/`)

  const query = useQuery({
    queryKey: [wallet.id, isShowWelcomeDAppKey],
    ...options,
    queryFn: async () => {
      const isShowed = await dAppExplorerStorage.getItem(storageDAppWelcome)

      return isBoolean(isShowed)
    },
  })

  return query
}

export const useShowWelcomeDApp = () => {
  const {data: isShowedWelcomeDApp, isLoading: loadingGetShowedWelcomeDApp} = useShowedWelcomeDApp()
  const setShowingWelcomeDApp = useSetShowWelcomeDApp()

  return {
    loadingGetShowedWelcomeDApp,
    isShowedWelcomeDApp,
    setShowedWelcomeDApp: React.useCallback(
      (options?: UseMutationOptions<void, Error, boolean>) => setShowingWelcomeDApp(true, options),
      [setShowingWelcomeDApp],
    ),
  }
}
