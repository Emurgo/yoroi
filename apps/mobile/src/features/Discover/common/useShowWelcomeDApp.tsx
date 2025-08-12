import {isBoolean, parseSafe, useAsyncStorage} from '@yoroi/common'
import * as React from 'react'

import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {usePromise} from '~/hooks/usePromise'

const storageRootDAppExplorer = 'dapp-explorer'
const storageDAppWelcome = 'dapp-explorer-welcome-dialog'

export const useShowWelcomeDApp = () => {
  const {wallet} = useSelectedWallet()
  const storage = useAsyncStorage()
  const walletStorage = storage.join(
    `wallet/${wallet.id}/${storageRootDAppExplorer}/`,
  )

  const [localValue, setLocalValue] = React.useState<boolean>(false)

  const result = usePromise({
    promise: async () => {
      const storedStorage = await walletStorage.getItem(storageDAppWelcome)
      const parsed = parseSafe(storedStorage)
      return isBoolean(parsed) ? parsed : false
    },
    shouldSuspend: true,
  })

  // TODO: REVISIT when usePromise is better defined
  React.useEffect(() => {
    if (result.value !== undefined) {
      setLocalValue(result.value)
    }
  }, [result.value])

  const updateValue = React.useCallback(
    async (value: boolean) => {
      await walletStorage.setItem(storageDAppWelcome, value)
      setLocalValue(value)
    },
    [walletStorage],
  )

  return [localValue, updateValue] as const
}
