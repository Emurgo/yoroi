import {parseBoolean, useAsyncStorage} from '@yoroi/common'
import {useSelectedWallet} from '@yoroi/wallet-manager'

import * as React from 'react'

const storageRootDAppExplorer = 'dapp-explorer'
const storageDAppWelcome = 'dapp-explorer-welcome-dialog'

export const useShowWelcomeDApp = () => {
  const {wallet} = useSelectedWallet()
  const storage = useAsyncStorage()

  // Memoize walletStorage to prevent unnecessary re-renders
  const walletStorage = React.useMemo(
    () => storage.join(`wallet/${wallet.id}/${storageRootDAppExplorer}/`),
    [storage, wallet.id],
  )

  const [localValue, setLocalValue] = React.useState<boolean | undefined>(
    undefined,
  )

  React.useEffect(() => {
    const asyncEffect = async () => {
      try {
        const storedStorage = await walletStorage.getItem(storageDAppWelcome)

        // parseBoolean handles both cases: if it's already a boolean, return it; if it's a string, parse it
        // If storage has a boolean value, use it. Otherwise default to false (first-time user should see modal)
        const value = parseBoolean(storedStorage) ?? false

        setLocalValue(value)
      } catch (error) {
        // On error, default to false (show modal)
        setLocalValue(false)
      }
    }
    asyncEffect()
  }, [wallet.id, walletStorage])

  const updateValue = React.useCallback(
    async (value: boolean) => {
      try {
        await walletStorage.setItem(storageDAppWelcome, value)
        setLocalValue(value)
      } catch (error) {
        // Silently fail - state will be out of sync but user can retry
      }
    },
    [walletStorage],
  )

  return [localValue, updateValue] as const
}
