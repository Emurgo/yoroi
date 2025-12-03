import {isBoolean, parseSafe, useAsyncStorage} from '@yoroi/common'

import * as React from 'react'

import {useSelectedWallet} from '@yoroi/wallet-manager/hooks/useSelectedWallet'

const storageRootDAppExplorer = 'dapp-explorer'
const storageDAppWelcome = 'dapp-explorer-welcome-dialog'

export const useShowWelcomeDApp = () => {
  const {wallet} = useSelectedWallet()
  const storage = useAsyncStorage()
  const walletStorage = storage.join(
    `wallet/${wallet.id}/${storageRootDAppExplorer}/`,
  )

  const [localValue, setLocalValue] = React.useState<boolean | undefined>(
    undefined,
  )

  React.useEffect(() => {
    const asyncEffect = async () => {
      const storedStorage = await walletStorage.getItem(storageDAppWelcome)
      const parsed = parseSafe(storedStorage)
      const value = isBoolean(parsed) ? parsed : false
      setLocalValue(value)
    }
    asyncEffect()
  }, [walletStorage])

  const updateValue = React.useCallback(
    async (value: boolean) => {
      await walletStorage.setItem(storageDAppWelcome, value)
      setLocalValue(value)
    },
    [walletStorage],
  )

  return [localValue, updateValue] as const
}
