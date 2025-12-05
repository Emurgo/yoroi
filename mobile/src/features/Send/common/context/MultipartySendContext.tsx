import {Portfolio} from '@yoroi/types'

import * as React from 'react'

type WalletAssets = Map<Portfolio.Token.Id, Portfolio.Token.Amount>

type MultipartySendContextValue = {
  selectedInputWalletIds: ReadonlyArray<string>
  setSelectedInputWalletIds: (ids: ReadonlyArray<string>) => void
  // Track which wallet is currently being edited (for adding assets)
  selectedWalletForAssets: string | null
  setSelectedWalletForAssets: (walletId: string | null) => void
  // Track assets per wallet
  walletAssets: Map<string, WalletAssets>
  setWalletAssets: (
    walletId: string,
    assets: WalletAssets | ((prev: WalletAssets) => WalletAssets),
  ) => void
  // Helper to get assets for a specific wallet
  getWalletAssets: (walletId: string) => WalletAssets
  // Helper to add/update asset for a wallet
  addWalletAsset: (
    walletId: string,
    tokenId: Portfolio.Token.Id,
    amount: Portfolio.Token.Amount,
  ) => void
  // Helper to remove asset from a wallet
  removeWalletAsset: (walletId: string, tokenId: Portfolio.Token.Id) => void
}

const MultipartySendContext = React.createContext<
  MultipartySendContextValue | undefined
>(undefined)

export const MultipartySendProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [selectedInputWalletIds, setSelectedInputWalletIds] = React.useState<
    ReadonlyArray<string>
  >([])
  const [selectedWalletForAssets, setSelectedWalletForAssets] = React.useState<
    string | null
  >(null)
  const [walletAssets, setWalletAssetsState] = React.useState<
    Map<string, WalletAssets>
  >(new Map())

  const setWalletAssets = React.useCallback(
    (
      walletId: string,
      assets: WalletAssets | ((prev: WalletAssets) => WalletAssets),
    ) => {
      setWalletAssetsState((prev) => {
        const updated = new Map(prev)
        const currentAssets = updated.get(walletId) ?? new Map()
        const newAssets =
          typeof assets === 'function' ? assets(currentAssets) : assets
        updated.set(walletId, newAssets)
        return updated
      })
    },
    [],
  )

  const getWalletAssets = React.useCallback(
    (walletId: string): WalletAssets => {
      return walletAssets.get(walletId) ?? new Map()
    },
    [walletAssets],
  )

  const addWalletAsset = React.useCallback(
    (
      walletId: string,
      tokenId: Portfolio.Token.Id,
      amount: Portfolio.Token.Amount,
    ) => {
      setWalletAssets(walletId, (prev) => {
        const updated = new Map(prev)
        updated.set(tokenId, amount)
        return updated
      })
    },
    [setWalletAssets],
  )

  const removeWalletAsset = React.useCallback(
    (walletId: string, tokenId: Portfolio.Token.Id) => {
      setWalletAssets(walletId, (prev) => {
        const updated = new Map(prev)
        updated.delete(tokenId)
        return updated
      })
    },
    [setWalletAssets],
  )

  const value = React.useMemo(
    () => ({
      selectedInputWalletIds,
      setSelectedInputWalletIds,
      selectedWalletForAssets,
      setSelectedWalletForAssets,
      walletAssets,
      setWalletAssets,
      getWalletAssets,
      addWalletAsset,
      removeWalletAsset,
    }),
    [
      selectedInputWalletIds,
      selectedWalletForAssets,
      walletAssets,
      setWalletAssets,
      getWalletAssets,
      addWalletAsset,
      removeWalletAsset,
    ],
  )

  return (
    <MultipartySendContext.Provider value={value}>
      {children}
    </MultipartySendContext.Provider>
  )
}

export const useMultipartySend = () => {
  const context = React.useContext(MultipartySendContext)
  if (context === undefined) {
    throw new Error(
      'useMultipartySend must be used within MultipartySendProvider',
    )
  }
  return context
}
