import AsyncStorage from '@react-native-async-storage/async-storage'

import {swapStorageMaker, swapStorageSettingsKey} from './storage'

jest.mock('@react-native-async-storage/async-storage', () => {
  const mockStorage: Record<string, string> = {}
  return {
    __esModule: true,
    default: {
      getItem: jest.fn((key: string) =>
        Promise.resolve(mockStorage[key] || null),
      ),
      setItem: jest.fn((key: string, value: string) => {
        mockStorage[key] = value
        return Promise.resolve()
      }),
      removeItem: jest.fn((key: string) => {
        delete mockStorage[key]
        return Promise.resolve()
      }),
    },
  }
})
const mockedAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>

describe('swapStorageMaker', () => {
  let storage: ReturnType<typeof swapStorageMaker>

  beforeEach(() => {
    jest.clearAllMocks()
    storage = swapStorageMaker()
  })

  it('should save settings', async () => {
    const settings = {
      slippage: 0.5,
      routingPreference: 'auto' as const,
    }
    await storage.settings.save(settings)
    expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
      swapStorageSettingsKey,
      JSON.stringify(settings),
    )
  })

  it('should read settings', async () => {
    const settings = {
      slippage: 0.2,
      routingPreference: 'auto' as const,
    }
    mockedAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(settings))
    const result = await storage.settings.read()
    expect(result).toEqual(settings)
    expect(mockedAsyncStorage.getItem).toHaveBeenCalledWith(
      swapStorageSettingsKey,
    )
  })

  it('should fallback to default settings on invalid data', async () => {
    mockedAsyncStorage.getItem.mockResolvedValueOnce('not-json')
    const result = await storage.settings.read()
    expect(result).toEqual({
      slippage: 1,
      routingPreference: 'auto',
    })
  })

  it('should remove settings', async () => {
    await storage.settings.remove()
    expect(mockedAsyncStorage.removeItem).toHaveBeenCalledWith(
      swapStorageSettingsKey,
    )
  })

  it('should clear all swap storage', async () => {
    await storage.clear()
    expect(mockedAsyncStorage.removeItem).toHaveBeenCalledWith(
      swapStorageSettingsKey,
    )
  })
})
