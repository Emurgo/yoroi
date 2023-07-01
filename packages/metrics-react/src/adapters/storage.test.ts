import AsyncStorage from '@react-native-async-storage/async-storage'
import {Metrics} from '@yoroi/types'

import {makeMetricsStorage, metricsStorageEnabledKey} from './storage'

jest.mock('@react-native-async-storage/async-storage')

const mockedAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>

describe('makeMetricsStorage', () => {
  let metricsStorage: Metrics.Storage

  beforeEach(() => {
    metricsStorage = makeMetricsStorage()
    mockedAsyncStorage.setItem.mockClear()
    mockedAsyncStorage.getItem.mockClear()
    mockedAsyncStorage.removeItem.mockClear()
  })

  it('should save enabled state', async () => {
    const enabled = true
    await metricsStorage.enabled.save(enabled)
    expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
      metricsStorageEnabledKey,
      JSON.stringify(enabled),
    )
  })

  it('should read enabled state', async () => {
    const enabled = true
    mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(enabled))
    const result = await metricsStorage.enabled.read()
    expect(result).toEqual(enabled)
    expect(mockedAsyncStorage.getItem).toHaveBeenCalledWith(
      metricsStorageEnabledKey,
    )
  })

  it('should handle non-boolean values when reading enabled state', async () => {
    mockedAsyncStorage.getItem.mockResolvedValue(
      JSON.stringify('not a boolean'),
    )
    const result = await metricsStorage.enabled.read()
    expect(result).toEqual(false)
    expect(mockedAsyncStorage.getItem).toHaveBeenCalledWith(
      metricsStorageEnabledKey,
    )
  })

  it('should remove enabled state', async () => {
    await metricsStorage.enabled.remove()
    expect(mockedAsyncStorage.removeItem).toHaveBeenCalledWith(
      metricsStorageEnabledKey,
    )
  })
})
