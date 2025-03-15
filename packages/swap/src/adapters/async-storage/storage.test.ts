import AsyncStorage from '@react-native-async-storage/async-storage'
import {Swap} from '@yoroi/types'

import {swapStorageMaker, swapStorageConfigKey} from './storage'

jest.mock('@react-native-async-storage/async-storage')

const mockedAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>

describe('swapStorageMaker', () => {
  let swapStorage: Swap.Storage

  beforeEach(() => {
    jest.clearAllMocks()
    swapStorage = swapStorageMaker()
  })

  it('config.save', async () => {
    const config = {
      slippage: 0.1,
      routingPreference: 'auto',
    } as const
    await swapStorage.config.save(config)
    expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
      swapStorageConfigKey,
      JSON.stringify(config),
    )
  })

  it('config.read', async () => {
    const config = {
      slippage: 0.1,
      routingPreference: 'auto',
    }
    mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(config))
    const result = await swapStorage.config.read()
    expect(result).toEqual(config)
    expect(mockedAsyncStorage.getItem).toHaveBeenCalledWith(
      swapStorageConfigKey,
    )
  })

  it('config.read should fallback to default when wrong data', async () => {
    const defaultConfig = {
      slippage: 1,
      routingPreference: 'auto',
    }
    mockedAsyncStorage.getItem.mockResolvedValue('[1, 2, ]')
    const result2 = await swapStorage.config.read()
    expect(result2).toEqual(defaultConfig)
    expect(mockedAsyncStorage.getItem).toHaveBeenCalledWith(
      swapStorageConfigKey,
    )
  })

  it('config.remove', async () => {
    await swapStorage.config.remove()
    expect(mockedAsyncStorage.removeItem).toHaveBeenCalledWith(
      swapStorageConfigKey,
    )
  })

  it('clear', async () => {
    await swapStorage.clear()
    expect(mockedAsyncStorage.removeItem).toHaveBeenCalledTimes(1)
  })
})
