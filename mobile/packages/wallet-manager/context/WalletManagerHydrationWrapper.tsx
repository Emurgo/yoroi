import {getLogger} from '@yoroi/logger'

import * as React from 'react'

import {WalletManager} from '../wallet-manager'

const HYDRATION_TIMEOUT_MS = 30_000 // 30 seconds max for wallet hydration

/**
 * Wrapper component that ensures wallet metadata is hydrated before rendering children.
 * This prevents race conditions where navigation checks for wallets before they're loaded from storage.
 * Includes timeout protection to prevent infinite hangs.
 */
export const WalletManagerHydrationWrapper: React.FC<
  React.PropsWithChildren<{
    walletManager: WalletManager
    /** Optional timeout in milliseconds (default: 30000) */
    timeoutMs?: number
  }>
> = ({children, walletManager, timeoutMs = HYDRATION_TIMEOUT_MS}) => {
  const [isHydrated, setIsHydrated] = React.useState(false)
  const [hydrationError, setHydrationError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    let isMounted = true
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    // Set up timeout
    const timeoutPromise = new Promise<'timeout'>((resolve) => {
      timeoutId = setTimeout(() => resolve('timeout'), timeoutMs)
    })

    // Race between hydration and timeout
    Promise.race([walletManager.hydrate(), timeoutPromise])
      .then((result) => {
        if (!isMounted) return

        if (result === 'timeout') {
          getLogger().error(
            'WalletManagerHydrationWrapper: hydration timed out',
            {
              timeoutMs,
            },
          )
          setHydrationError(
            new Error(`Wallet hydration timed out after ${timeoutMs / 1000}s`),
          )
          // Still allow app to continue - wallets may load later
          setIsHydrated(true)
          return
        }

        setIsHydrated(true)
      })
      .catch((error) => {
        if (!isMounted) return

        getLogger().error('WalletManagerHydrationWrapper: hydration failed', {
          error,
        })
        setHydrationError(
          error instanceof Error ? error : new Error(String(error)),
        )
        // Still render children even if hydration fails to prevent app from being stuck
        setIsHydrated(true)
      })

    return () => {
      isMounted = false
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [walletManager, timeoutMs])

  // Log hydration error for debugging but don't block UI
  React.useEffect(() => {
    if (hydrationError) {
      getLogger().warn(
        'WalletManagerHydrationWrapper: App continuing despite hydration error',
        {
          error: hydrationError.message,
        },
      )
    }
  }, [hydrationError])

  if (!isHydrated) {
    return null
  }

  return <>{children}</>
}
