import * as React from 'react'

import {logger} from '~/kernel/logger/logger'

import {WalletManager} from '../wallet-manager'

/**
 * Wrapper component that ensures wallet metadata is hydrated before rendering children.
 * This prevents race conditions where navigation checks for wallets before they're loaded from storage.
 */
export const WalletManagerHydrationWrapper: React.FC<
  React.PropsWithChildren<{
    walletManager: WalletManager
  }>
> = ({children, walletManager}) => {
  const [isHydrated, setIsHydrated] = React.useState(false)

  React.useEffect(() => {
    let isMounted = true

    walletManager
      .hydrate()
      .then(() => {
        if (isMounted) {
          setIsHydrated(true)
        }
      })
      .catch((error) => {
        logger.error('WalletManagerHydrationWrapper: hydration failed', {error})
        // Still render children even if hydration fails to prevent app from being stuck
        if (isMounted) {
          setIsHydrated(true)
        }
      })

    return () => {
      isMounted = false
    }
  }, [walletManager])

  if (!isHydrated) {
    return null
  }

  return <>{children}</>
}
