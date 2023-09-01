/* eslint-disable @typescript-eslint/no-explicit-any */
import {App} from '@yoroi/types'
import {mountMultiStorage as originalMultiStorage} from '@yoroi/wallets'

import {tokenManagerStorageMaker} from './storage' // Replace with the actual file path

const mountMultiStorage = originalMultiStorage as jest.MockedFunction<typeof originalMultiStorage>
jest.mock('@yoroi/wallets')

describe('tokenManagerStorageMaker', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should return a BalanceStorage with tokens', () => {
    // Arrange
    const mockStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      multiGet: jest.fn(),
      multiSet: jest.fn(),
      multiRemove: jest.fn(),
    }
    const mockMultiStorage: App.MultiStorage<any> = {
      getAllKeys: jest.fn(),
      readMany: jest.fn(),
      readAll: jest.fn(),
      clear: jest.fn(),
      saveMany: jest.fn(),
    }
    mountMultiStorage.mockReturnValue(mockMultiStorage)

    // Act
    const result = tokenManagerStorageMaker(mockStorage as unknown as App.Storage)

    // Assert
    expect(result).toEqual({
      tokens: mockMultiStorage,
    })
    expect(mountMultiStorage).toHaveBeenCalledWith({
      storage: mockStorage,
      keyExtractor: expect.any(Function),
      dataFolder: 'multi-tokens/',
    })
  })
})
