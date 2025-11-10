import * as React from 'react'

type WalletNameOverrideContextType = {
  walletNameOverride: string | undefined
  setWalletNameOverride: (value: string | undefined) => void
}

const WalletNameOverrideContext = React.createContext<
  WalletNameOverrideContextType | undefined
>(undefined)

export const WalletNameOverrideProvider = ({
  children,
}: React.PropsWithChildren) => {
  const [walletNameOverride, setWalletNameOverrideState] = React.useState<
    string | undefined
  >(undefined)

  const setWalletNameOverride = React.useCallback(
    (value: string | undefined) => {
      if (value === undefined || value.trim() === '') {
        setWalletNameOverrideState(undefined)
      } else {
        // Limit to 15 characters
        const trimmed = value.trim().slice(0, 15)
        setWalletNameOverrideState(trimmed)
      }
    },
    [],
  )

  const value = React.useMemo(
    () => ({
      walletNameOverride,
      setWalletNameOverride,
    }),
    [walletNameOverride, setWalletNameOverride],
  )

  return (
    <WalletNameOverrideContext.Provider value={value}>
      {children}
    </WalletNameOverrideContext.Provider>
  )
}

export const useWalletNameOverride = () => {
  const context = React.useContext(WalletNameOverrideContext)
  // Return default values if not in provider (for DevMenu which is outside BrowseDappScreen)
  if (context === undefined) {
    return {
      walletNameOverride: undefined,
      setWalletNameOverride: () => {
        // No-op if not in provider
      },
    }
  }
  return context
}
