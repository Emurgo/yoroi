import {App} from '@yoroi/types'

import {migrateInstallationId, to6_0_0} from './6_0_0'
import {installationIdStorageKeyManager} from '~/kernel/storage/storages'

// Mock the installationIdStorageKeyManager
jest.mock('~/kernel/storage/storages', () => ({
  installationIdStorageKeyManager: {
    read: jest.fn(),
    save: jest.fn(),
  },
}))

describe('6_0_0 migrations', () => {
  let storage: App.Storage
  let mockInstallationIdStorageKeyManager: jest.Mocked<typeof installationIdStorageKeyManager>

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Create mock storage
    storage = {
      join: jest.fn().mockReturnThis(),
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      getAllKeys: jest.fn(),
      multiGet: jest.fn(),
      multiSet: jest.fn(),
      multiRemove: jest.fn(),
      removeFolder: jest.fn(),
      clear: jest.fn(),
    } as never

    // Get the mocked installationIdStorageKeyManager
    mockInstallationIdStorageKeyManager = installationIdStorageKeyManager as jest.Mocked<typeof installationIdStorageKeyManager>
    
    // Reset the save mock to default behavior
    mockInstallationIdStorageKeyManager.save.mockReturnValue(undefined)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('migrateInstallationId', () => {
    it('should do nothing when installationId already exists in new storage', async () => {
      // Arrange
      const existingInstallationId = 'existing-uuid-123'
      mockInstallationIdStorageKeyManager.read.mockReturnValue(existingInstallationId)

      // Act
      await migrateInstallationId(storage)

      // Assert
      expect(mockInstallationIdStorageKeyManager.read).toHaveBeenCalledTimes(1)
      expect(storage.join).not.toHaveBeenCalled()
      expect(storage.getItem).not.toHaveBeenCalled()
      expect(mockInstallationIdStorageKeyManager.save).not.toHaveBeenCalled()
    })

    it('should migrate installationId from old storage when it exists', async () => {
      // Arrange
      const oldInstallationId = 'old-uuid-456'
      mockInstallationIdStorageKeyManager.read.mockReturnValue(undefined)
      storage.join = jest.fn().mockReturnValue({
        getItem: jest.fn().mockResolvedValue(oldInstallationId),
      })

      // Act
      await migrateInstallationId(storage)

      // Assert
      expect(mockInstallationIdStorageKeyManager.read).toHaveBeenCalledTimes(1)
      expect(storage.join).toHaveBeenCalledWith('appSettings/')
      expect(mockInstallationIdStorageKeyManager.save).toHaveBeenCalledWith(oldInstallationId)
    })

    it('should do nothing when old installationId does not exist', async () => {
      // Arrange
      mockInstallationIdStorageKeyManager.read.mockReturnValue(undefined)
      storage.join = jest.fn().mockReturnValue({
        getItem: jest.fn().mockResolvedValue(null),
      })

      // Act
      await migrateInstallationId(storage)

      // Assert
      expect(mockInstallationIdStorageKeyManager.read).toHaveBeenCalledTimes(1)
      expect(storage.join).toHaveBeenCalledWith('appSettings/')
      expect(mockInstallationIdStorageKeyManager.save).not.toHaveBeenCalled()
    })

    it('should do nothing when old installationId is undefined', async () => {
      // Arrange
      mockInstallationIdStorageKeyManager.read.mockReturnValue(undefined)
      storage.join = jest.fn().mockReturnValue({
        getItem: jest.fn().mockResolvedValue(undefined),
      })

      // Act
      await migrateInstallationId(storage)

      // Assert
      expect(mockInstallationIdStorageKeyManager.read).toHaveBeenCalledTimes(1)
      expect(storage.join).toHaveBeenCalledWith('appSettings/')
      expect(mockInstallationIdStorageKeyManager.save).not.toHaveBeenCalled()
    })

    it('should handle empty string installationId from old storage', async () => {
      // Arrange
      const oldInstallationId = ''
      mockInstallationIdStorageKeyManager.read.mockReturnValue(undefined)
      storage.join = jest.fn().mockReturnValue({
        getItem: jest.fn().mockResolvedValue(oldInstallationId),
      })

      // Act
      await migrateInstallationId(storage)

      // Assert
      expect(mockInstallationIdStorageKeyManager.read).toHaveBeenCalledTimes(1)
      expect(storage.join).toHaveBeenCalledWith('appSettings/')
      expect(mockInstallationIdStorageKeyManager.save).toHaveBeenCalledWith(oldInstallationId)
    })

    it('should handle storage errors gracefully', async () => {
      // Arrange
      mockInstallationIdStorageKeyManager.read.mockReturnValue(undefined)
      storage.join = jest.fn().mockReturnValue({
        getItem: jest.fn().mockRejectedValue(new Error('Storage error')),
      })

      // Act & Assert
      await expect(migrateInstallationId(storage)).rejects.toThrow('Storage error')
      expect(mockInstallationIdStorageKeyManager.read).toHaveBeenCalledTimes(1)
      expect(storage.join).toHaveBeenCalledWith('appSettings/')
      expect(mockInstallationIdStorageKeyManager.save).not.toHaveBeenCalled()
    })

    it('should handle storage key manager read errors gracefully', async () => {
      // Arrange
      mockInstallationIdStorageKeyManager.read.mockImplementation(() => {
        throw new Error('Storage key manager error')
      })

      // Act & Assert
      await expect(migrateInstallationId(storage)).rejects.toThrow('Storage key manager error')
      expect(mockInstallationIdStorageKeyManager.read).toHaveBeenCalledTimes(1)
      expect(storage.join).not.toHaveBeenCalled()
    })

    it('should handle storage key manager save errors gracefully', async () => {
      // Arrange
      const oldInstallationId = 'old-uuid-789'
      mockInstallationIdStorageKeyManager.read.mockReturnValue(undefined)
      mockInstallationIdStorageKeyManager.save.mockImplementation(() => {
        throw new Error('Save error')
      })
      storage.join = jest.fn().mockReturnValue({
        getItem: jest.fn().mockResolvedValue(oldInstallationId),
      })

      // Act & Assert
      await expect(migrateInstallationId(storage)).rejects.toThrow('Save error')
      expect(mockInstallationIdStorageKeyManager.read).toHaveBeenCalledTimes(1)
      expect(storage.join).toHaveBeenCalledWith('appSettings/')
      expect(mockInstallationIdStorageKeyManager.save).toHaveBeenCalledWith(oldInstallationId)
    })
  })

  describe('to6_0_0', () => {
    it('should be the same as migrateInstallationId', () => {
      // Assert
      expect(to6_0_0).toBe(migrateInstallationId)
    })

    it('should work as an alias for migrateInstallationId', async () => {
      // Arrange
      const oldInstallationId = 'alias-test-uuid'
      mockInstallationIdStorageKeyManager.read.mockReturnValue(undefined)
      storage.join = jest.fn().mockReturnValue({
        getItem: jest.fn().mockResolvedValue(oldInstallationId),
      })

      // Act
      await to6_0_0(storage)

      // Assert
      expect(mockInstallationIdStorageKeyManager.read).toHaveBeenCalledTimes(1)
      expect(storage.join).toHaveBeenCalledWith('appSettings/')
      expect(mockInstallationIdStorageKeyManager.save).toHaveBeenCalledWith(oldInstallationId)
    })
  })

  describe('integration scenarios', () => {
    it('should handle the complete migration flow for a new user', async () => {
      // Arrange - Simulate a new user with no existing installationId
      mockInstallationIdStorageKeyManager.read.mockReturnValue(undefined)
      storage.join = jest.fn().mockReturnValue({
        getItem: jest.fn().mockResolvedValue(null),
      })

      // Act
      await migrateInstallationId(storage)

      // Assert
      expect(mockInstallationIdStorageKeyManager.read).toHaveBeenCalledTimes(1)
      expect(storage.join).toHaveBeenCalledWith('appSettings/')
      expect(mockInstallationIdStorageKeyManager.save).not.toHaveBeenCalled()
    })

    it('should handle the complete migration flow for an existing user', async () => {
      // Arrange - Simulate an existing user with installationId in old storage
      const existingInstallationId = 'existing-user-uuid'
      mockInstallationIdStorageKeyManager.read.mockReturnValue(undefined)
      storage.join = jest.fn().mockReturnValue({
        getItem: jest.fn().mockResolvedValue(existingInstallationId),
      })

      // Act
      await migrateInstallationId(storage)

      // Assert
      expect(mockInstallationIdStorageKeyManager.read).toHaveBeenCalledTimes(1)
      expect(storage.join).toHaveBeenCalledWith('appSettings/')
      expect(mockInstallationIdStorageKeyManager.save).toHaveBeenCalledWith(existingInstallationId)
    })

    it('should handle the complete migration flow for a user who already migrated', async () => {
      // Arrange - Simulate a user who already has the new storage format
      const alreadyMigratedInstallationId = 'already-migrated-uuid'
      mockInstallationIdStorageKeyManager.read.mockReturnValue(alreadyMigratedInstallationId)

      // Act
      await migrateInstallationId(storage)

      // Assert
      expect(mockInstallationIdStorageKeyManager.read).toHaveBeenCalledTimes(1)
      expect(storage.join).not.toHaveBeenCalled()
      expect(mockInstallationIdStorageKeyManager.save).not.toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('should handle null values from old storage', async () => {
      // Arrange
      mockInstallationIdStorageKeyManager.read.mockReturnValue(undefined)
      storage.join = jest.fn().mockReturnValue({
        getItem: jest.fn().mockResolvedValue(null),
      })

      // Act
      await migrateInstallationId(storage)

      // Assert
      expect(mockInstallationIdStorageKeyManager.read).toHaveBeenCalledTimes(1)
      expect(storage.join).toHaveBeenCalledWith('appSettings/')
      expect(mockInstallationIdStorageKeyManager.save).not.toHaveBeenCalled()
    })

    it('should handle undefined values from old storage', async () => {
      // Arrange
      mockInstallationIdStorageKeyManager.read.mockReturnValue(undefined)
      storage.join = jest.fn().mockReturnValue({
        getItem: jest.fn().mockResolvedValue(undefined),
      })

      // Act
      await migrateInstallationId(storage)

      // Assert
      expect(mockInstallationIdStorageKeyManager.read).toHaveBeenCalledTimes(1)
      expect(storage.join).toHaveBeenCalledWith('appSettings/')
      expect(mockInstallationIdStorageKeyManager.save).not.toHaveBeenCalled()
    })

    it('should handle non-string values from old storage', async () => {
      // Arrange
      const nonStringInstallationId = 123
      mockInstallationIdStorageKeyManager.read.mockReturnValue(undefined)
      storage.join = jest.fn().mockReturnValue({
        getItem: jest.fn().mockResolvedValue(nonStringInstallationId),
      })

      // Act
      await migrateInstallationId(storage)

      // Assert
      expect(mockInstallationIdStorageKeyManager.read).toHaveBeenCalledTimes(1)
      expect(storage.join).toHaveBeenCalledWith('appSettings/')
      expect(mockInstallationIdStorageKeyManager.save).toHaveBeenCalledWith(nonStringInstallationId)
    })

    it('should handle very long installationId strings', async () => {
      // Arrange
      const longInstallationId = 'a'.repeat(1000)
      mockInstallationIdStorageKeyManager.read.mockReturnValue(undefined)
      storage.join = jest.fn().mockReturnValue({
        getItem: jest.fn().mockResolvedValue(longInstallationId),
      })

      // Act
      await migrateInstallationId(storage)

      // Assert
      expect(mockInstallationIdStorageKeyManager.read).toHaveBeenCalledTimes(1)
      expect(storage.join).toHaveBeenCalledWith('appSettings/')
      expect(mockInstallationIdStorageKeyManager.save).toHaveBeenCalledWith(longInstallationId)
    })
  })
})
