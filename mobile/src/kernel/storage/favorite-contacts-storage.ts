import {parseSafe} from '@yoroi/common'

import {rootStorage} from './storages'

export type FavoriteContact = {
  domain: string
  addedAt: number
  lastUsedAt: number
  isOwnWallet: boolean
}

const FAVORITES_STORAGE_KEY = 'favoriteContacts'

const favoritesStorage = rootStorage.join('favorites/')

const parseFavorites = (data: unknown): FavoriteContact[] => {
  const parsed = parseSafe(data)
  if (!Array.isArray(parsed)) return []
  return parsed.filter(
    (item): item is FavoriteContact =>
      typeof item === 'object' &&
      item !== null &&
      typeof item.domain === 'string' &&
      typeof item.addedAt === 'number' &&
      typeof item.lastUsedAt === 'number' &&
      typeof item.isOwnWallet === 'boolean',
  )
}

export const favoriteContactsStorage = {
  async getFavorites(): Promise<FavoriteContact[]> {
    const data = await favoritesStorage.getItem(FAVORITES_STORAGE_KEY)
    return parseFavorites(data)
  },

  async addFavorite(domain: string, isOwnWallet: boolean): Promise<void> {
    const favorites = await this.getFavorites()
    const existingIndex = favorites.findIndex((f) => f.domain === domain)

    const now = Date.now()
    if (existingIndex >= 0) {
      // Update existing favorite
      favorites[existingIndex] = {
        ...favorites[existingIndex]!,
        isOwnWallet,
        lastUsedAt: now,
      }
    } else {
      // Add new favorite
      favorites.push({
        domain,
        addedAt: now,
        lastUsedAt: now,
        isOwnWallet,
      })
    }

    await favoritesStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify(favorites),
    )
  },

  async removeFavorite(domain: string): Promise<void> {
    const favorites = await this.getFavorites()
    const filtered = favorites.filter((f) => f.domain !== domain)
    await favoritesStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify(filtered),
    )
  },

  async updateLastUsed(domain: string): Promise<void> {
    const favorites = await this.getFavorites()
    const existingIndex = favorites.findIndex((f) => f.domain === domain)

    if (existingIndex >= 0) {
      favorites[existingIndex]!.lastUsedAt = Date.now()
      await favoritesStorage.setItem(
        FAVORITES_STORAGE_KEY,
        JSON.stringify(favorites),
      )
    } else {
      // If not in favorites but was used, add it
      await this.addFavorite(domain, false)
    }
  },
} as const
