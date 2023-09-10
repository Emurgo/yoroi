import {App, Balance} from '@yoroi/types'

import {portfolioManagerMaker} from './portfolioManager' // Replace 'your-module' with the actual module path

describe('portfolioManagerMaker', () => {
  it('should refresh tokens without avoidCache', async () => {
    // Arrange
    const mockApiTokens = jest.fn().mockResolvedValue(['tokenData1', 'tokenData2'])
    const mockStorageSave = jest.fn()
    const mockStorageGetAllKeys = jest.fn().mockResolvedValue(['token1', 'token2'])

    const mockStorage = {
      tokens: {
        saveMany: mockStorageSave,
        getAllKeys: mockStorageGetAllKeys,
      } as unknown as App.MultiStorage<Balance.Token>,
    }

    const mockApi = {
      tokens: mockApiTokens,
    }

    const portfolioManagerToInit = portfolioManagerMaker({storage: mockStorage, api: mockApi})
    const portfolioManager = await portfolioManagerToInit()

    // Act
    await portfolioManager.tokens.fetch(['token1', 'token2'])

    // Assert
    expect(mockStorageGetAllKeys).toHaveBeenCalledTimes(2)
    expect(mockApiTokens).not.toHaveBeenCalled()
    expect(mockStorageSave).not.toHaveBeenCalledWith()
  })

  it('should refresh tokens with avoidCache', async () => {
    // Arrange
    const mockApiTokens = jest.fn().mockResolvedValue(['tokenData1', 'tokenData2'])
    const mockStorageSave = jest.fn()
    const mockStorageGetAllKeys = jest.fn().mockResolvedValue(['token1', 'token2'])

    const mockStorage = {
      tokens: {
        saveMany: mockStorageSave,
        getAllKeys: mockStorageGetAllKeys,
      } as unknown as App.MultiStorage<Balance.Token>,
    }

    const mockApi = {
      tokens: mockApiTokens,
    }

    const portfolioManagerToInit = portfolioManagerMaker({storage: mockStorage, api: mockApi})
    const portfolioManager = await portfolioManagerToInit()

    // Act
    await portfolioManager.tokens.fetch(['token1', 'token2'], true)

    // Assert
    expect(mockStorageGetAllKeys).toHaveBeenCalledTimes(2)
    expect(mockApiTokens).toHaveBeenCalledWith(['token1', 'token2'])
    expect(mockStorageSave).toHaveBeenCalledWith(['tokenData1', 'tokenData2'])
  })
})
