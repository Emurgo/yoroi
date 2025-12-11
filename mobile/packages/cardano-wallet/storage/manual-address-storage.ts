import {parseSafe} from '@yoroi/common'
import {App} from '@yoroi/types'

export type ManualAddressReason = 'used' | 'utxo' | 'airdrop'

export type ManualAddress = {
  accountIndex: number
  addressIndex: number
  address: string
  derivationPath: string
  reasons: ManualAddressReason[]
  addedAt: string
}

const STORAGE_KEY = 'manualAddresses'

const parseManualAddresses = (data: unknown): ManualAddress[] => {
  const parsed = parseSafe(data)
  if (Array.isArray(parsed)) {
    return parsed.filter(isManualAddress)
  }
  return []
}

const isManualAddress = (data: unknown): data is ManualAddress => {
  if (
    data &&
    typeof data === 'object' &&
    'accountIndex' in data &&
    'addressIndex' in data &&
    'address' in data &&
    'derivationPath' in data &&
    'reasons' in data &&
    'addedAt' in data
  ) {
    const candidate = data as ManualAddress
    return (
      typeof candidate.accountIndex === 'number' &&
      typeof candidate.addressIndex === 'number' &&
      typeof candidate.address === 'string' &&
      typeof candidate.derivationPath === 'string' &&
      Array.isArray(candidate.reasons) &&
      candidate.reasons.every(
        (r) => r === 'used' || r === 'utxo' || r === 'airdrop',
      ) &&
      typeof candidate.addedAt === 'string'
    )
  }
  return false
}

export const makeManualAddressStorage = (storage: App.Storage) => {
  return {
    /**
     * Add or update a manual address
     * If address exists, merges reasons
     */
    add: async (address: ManualAddress): Promise<void> => {
      const addresses =
        (await storage.getItem(STORAGE_KEY, parseManualAddresses)) ?? []
      const existingIndex = addresses.findIndex(
        (a) => a.address === address.address,
      )

      if (existingIndex >= 0) {
        // Merge reasons
        const existing = addresses[existingIndex]!
        const mergedReasons = Array.from(
          new Set([...existing.reasons, ...address.reasons]),
        ) as ManualAddressReason[]
        addresses[existingIndex] = {
          ...existing,
          reasons: mergedReasons,
        }
      } else {
        addresses.push(address)
      }

      await storage.setItem(STORAGE_KEY, addresses)
    },

    /**
     * Get all manual addresses
     */
    getAll: async (): Promise<ManualAddress[]> => {
      return (await storage.getItem(STORAGE_KEY, parseManualAddresses)) ?? []
    },

    /**
     * Get manual addresses for a specific account
     */
    getByAccount: async (accountIndex: number): Promise<ManualAddress[]> => {
      const addresses =
        (await storage.getItem(STORAGE_KEY, parseManualAddresses)) ?? []
      return addresses.filter((a) => a.accountIndex === accountIndex)
    },

    /**
     * Remove a manual address
     */
    remove: async (address: string): Promise<void> => {
      const addresses =
        (await storage.getItem(STORAGE_KEY, parseManualAddresses)) ?? []
      const filtered = addresses.filter((a) => a.address !== address)
      await storage.setItem(STORAGE_KEY, filtered)
    },

    /**
     * Clear all manual addresses
     */
    clear: async (): Promise<void> => {
      await storage.removeItem(STORAGE_KEY)
    },

    /**
     * Check if an address is manually tracked
     */
    has: async (address: string): Promise<boolean> => {
      const addresses =
        (await storage.getItem(STORAGE_KEY, parseManualAddresses)) ?? []
      return addresses.some((a) => a.address === address)
    },
  } as const
}

export type ManualAddressStorage = ReturnType<typeof makeManualAddressStorage>
