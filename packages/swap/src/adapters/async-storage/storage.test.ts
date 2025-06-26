import {swapStorageMaker, swapStorageSettingsKey} from './storage'
import AsyncStorage from '@react-native-async-storage/async-storage'

jest.mock('@react-native-async-storage/async-storage', () => {
  const mock = require('@react-native-async-storage/async-storage/jest/async-storage-mock')
  return {
    __esModule: true,
    default: mock,
    ...mock,
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
