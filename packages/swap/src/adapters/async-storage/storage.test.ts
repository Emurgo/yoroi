import AsyncStorage from '@react-native-async-storage/async-storage'
import {Swap} from '@yoroi/types'

import {swapStorageMaker, swapStorageSettingsKey} from './storage'

jest.mock('@react-native-async-storage/async-storage')

const mockedAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>

describe('swapStorageMaker', () => {
  let swapStorage: Swap.Storage

  beforeEach(() => {
    jest.clearAllMocks()
    swapStorage = swapStorageMaker()
  })

  it('settings.save', async () => {
    const settings = {
      slippage: 0.1,
      routingPreference: 'auto',
    } as const
    await swapStorage.settings.save(settings)
    expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
      swapStorageSettingsKey,
      JSON.stringify(settings),
    )
  })

  it('settings.read', async () => {
    const settings = {
      slippage: 0.1,
      routingPreference: 'auto',
    }
    mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(settings))
    const result = await swapStorage.settings.read()
    expect(result).toEqual(settings)
    expect(mockedAsyncStorage.getItem).toHaveBeenCalledWith(
      swapStorageSettingsKey,
    )
  })

  it('settings.read should fallback to default when wrong data', async () => {
    const defaultSettings = {
      slippage: 1,
      routingPreference: 'auto',
    }
    mockedAsyncStorage.getItem.mockResolvedValue('[1, 2, ]')
    const result2 = await swapStorage.settings.read()
    expect(result2).toEqual(defaultSettings)
    expect(mockedAsyncStorage.getItem).toHaveBeenCalledWith(
      swapStorageSettingsKey,
    )
  })

  it('settings.remove', async () => {
    await swapStorage.settings.remove()
    expect(mockedAsyncStorage.removeItem).toHaveBeenCalledWith(
      swapStorageSettingsKey,
    )
  })

  it('clear', async () => {
    await swapStorage.clear()
    expect(mockedAsyncStorage.removeItem).toHaveBeenCalledTimes(1)
  })
})
