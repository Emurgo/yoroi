import {useSelectedWallet} from '@yoroi/wallet-manager/hooks/useSelectedWallet'

import * as React from 'react'

import {makeWalletEncryptedStorage} from '~/kernel/storage/EncryptedStorage'

/**
 * Checks if the current wallet is a partial readonly wallet
 * (readonly wallet without accountPubKey, only has addresses)
 */
export const useIsPartialReadOnlyWallet = (): boolean => {
  const {wallet, meta} = useSelectedWallet()
  // Start with true for readonly wallets (assume partial until proven otherwise)
  // This prevents flash of Share section for partial readonly wallets
  const [isPartialReadOnly, setIsPartialReadOnly] = React.useState(
    meta.isReadOnly,
  )

  React.useEffect(() => {
    const checkPartialReadOnly = async () => {
      // Only check for readonly wallets
      if (!meta.isReadOnly) {
        setIsPartialReadOnly(false)
        return
      }

      try {
        const encryptedStorage = makeWalletEncryptedStorage(wallet.id)
        const accountPubKeyHex = await encryptedStorage.xpub.read(
          wallet.accountVisual,
        )

        // If accountPubKey doesn't exist, it's a partial readonly wallet
        setIsPartialReadOnly(!accountPubKeyHex)
      } catch (error) {
        // If reading fails, assume it's partial readonly
        setIsPartialReadOnly(true)
      }
    }

    checkPartialReadOnly()
  }, [wallet.id, wallet.accountVisual, meta.isReadOnly])

  return isPartialReadOnly
}
