import AsyncStorage from '@react-native-async-storage/async-storage'
import {Resolver} from '@yoroi/types'

import {resolverStorageMaker, resolverStorageNoticedKey} from './storage'

jest.mock('@react-native-async-storage/async-storage')

const mockedAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>

describe('resolverStorageMaker', () => {
  let resolverStorage: Resolver.Storage

  beforeEach(() => {
    jest.clearAllMocks()
    resolverStorage = resolverStorageMaker()
  })

  it('noticed.save', async () => {
    const noticed = true
    await resolverStorage.noticed.save(noticed)
    expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
      resolverStorageNoticedKey,
      JSON.stringify(noticed),
    )
  })

  it('noticed.read', async () => {
    const noticed = true
    mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(noticed))
    const result = await resolverStorage.noticed.read()
    expect(result).toEqual(noticed)
    expect(mockedAsyncStorage.getItem).toHaveBeenCalledWith(
      resolverStorageNoticedKey,
    )
  })

  it('noticed.read should fallback to false when wrong data', async () => {
    mockedAsyncStorage.getItem.mockResolvedValue(
      JSON.stringify('not a boolean'),
    )
    const result = await resolverStorage.noticed.read()
    expect(result).toEqual(false)
    expect(mockedAsyncStorage.getItem).toHaveBeenCalledWith(
      resolverStorageNoticedKey,
    )
    mockedAsyncStorage.getItem.mockResolvedValue('[1, 2, ]')
    const result2 = await resolverStorage.noticed.read()
    expect(result2).toEqual(false)
    expect(mockedAsyncStorage.getItem).toHaveBeenCalledWith(
      resolverStorageNoticedKey,
    )
  })

  it('noticed.remove', async () => {
    await resolverStorage.noticed.remove()
    expect(mockedAsyncStorage.removeItem).toHaveBeenCalledWith(
      resolverStorageNoticedKey,
    )
  })

  it('clear', async () => {
    await resolverStorage.clear()
    expect(mockedAsyncStorage.removeItem).toHaveBeenCalledTimes(1)
  })
})
