import {Wallet} from '@yoroi/types'

import * as React from 'react'

import {useWalletManager} from '@yoroi/wallet-manager/context/WalletManagerProvider'
import {useWalletMetas} from '@yoroi/wallet-manager/hooks/useWalletMetas'
import {WalletManager} from '@yoroi/wallet-manager/wallet-manager'
import {
  FavoriteContact,
  favoriteContactsStorage,
} from '~/kernel/storage/favorite-contacts-storage'

import {getOwnWalletDomains} from '../utils/getOwnWalletDomains'

/**
 * Helper function to merge stored favorites with own wallet domains
 */
const mergeFavorites = async (
  walletMetas: Wallet.Meta[],
  walletManager: WalletManager,
): Promise<FavoriteContact[]> => {
  // Get stored favorites
  const storedFavorites = await favoriteContactsStorage.getFavorites()

  // Get own wallet domains from all wallets
  const ownWalletDomains: Array<{domain: string; isOwnWallet: true}> = []
  for (const meta of walletMetas) {
    const wallet = walletManager.getWalletById(meta.id)
    if (wallet) {
      const domains = getOwnWalletDomains(wallet)
      ownWalletDomains.push(...domains)
    }
  }

  // Create a map of domains to avoid duplicates
  const favoritesMap = new Map<string, FavoriteContact>()

  // Add own wallet domains first (they take priority)
  for (const {domain, isOwnWallet} of ownWalletDomains) {
    favoritesMap.set(domain, {
      domain,
      addedAt: Date.now(),
      lastUsedAt: Date.now(),
      isOwnWallet,
    })
  }

  // Merge with stored favorites (exclude duplicates that are already shown as own wallets)
  for (const favorite of storedFavorites) {
    if (!favoritesMap.has(favorite.domain)) {
      // Only add if it's not already in own wallets
      favoritesMap.set(favorite.domain, favorite)
    } else {
      // Update existing favorite to mark as own wallet if it is, and merge lastUsedAt
      const existing = favoritesMap.get(favorite.domain)!
      favoritesMap.set(favorite.domain, {
        ...existing,
        isOwnWallet: true, // Keep as own wallet since it's detected
        lastUsedAt: Math.max(existing.lastUsedAt, favorite.lastUsedAt),
      })
    }
  }

  // Convert to array and sort: own wallets first, then by lastUsedAt (most recent first)
  return Array.from(favoritesMap.values()).sort((a, b) => {
    // Own wallets first
    if (a.isOwnWallet && !b.isOwnWallet) return -1
    if (!a.isOwnWallet && b.isOwnWallet) return 1
    // Then by lastUsedAt (most recent first)
    return b.lastUsedAt - a.lastUsedAt
  })
}

export const useFavoriteContacts = () => {
  const {walletManager} = useWalletManager()
  const walletMetas = useWalletMetas()
  const [favorites, setFavorites] = React.useState<FavoriteContact[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  // Load favorites from storage and combine with own wallet domains
  React.useEffect(() => {
    let cancelled = false

    const loadFavorites = async () => {
      setIsLoading(true)
      try {
        const sortedFavorites = await mergeFavorites(walletMetas, walletManager)

        if (!cancelled) {
          setFavorites(sortedFavorites)
        }
      } catch {
        // Silently fail - favorites list will remain empty
        if (!cancelled) {
          setFavorites([])
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadFavorites()

    return () => {
      cancelled = true
    }
  }, [walletMetas, walletManager])

  const addFavorite = React.useCallback(
    async (domain: string, isOwnWallet: boolean = false) => {
      await favoriteContactsStorage.addFavorite(domain, isOwnWallet)
      const sortedFavorites = await mergeFavorites(walletMetas, walletManager)
      setFavorites(sortedFavorites)
    },
    [walletMetas, walletManager],
  )

  const removeFavorite = React.useCallback(
    async (domain: string) => {
      // Remove from storage (even if it's an own wallet, remove from saved favorites)
      await favoriteContactsStorage.removeFavorite(domain)
      // Reload to get updated list (own wallets will still appear if they exist)
      const sortedFavorites = await mergeFavorites(walletMetas, walletManager)
      setFavorites(sortedFavorites)
    },
    [walletMetas, walletManager],
  )

  const markAsUsed = React.useCallback(
    async (domain: string) => {
      await favoriteContactsStorage.updateLastUsed(domain)
      // Reload favorites to ensure proper sorting
      const sortedFavorites = await mergeFavorites(walletMetas, walletManager)
      setFavorites(sortedFavorites)
    },
    [walletMetas, walletManager],
  )

  return {
    favorites,
    isLoading,
    addFavorite,
    removeFavorite,
    markAsUsed,
  }
}
