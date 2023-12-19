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

  it('showNotice.save', async () => {
    const showNotice = true
    await resolverStorage.showNotice.save(showNotice)
    expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
      resolverStorageNoticedKey,
      JSON.stringify(showNotice),
    )
  })

  it('showNotice.read', async () => {
    const showNotice = true
    mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(showNotice))
    const result = await resolverStorage.showNotice.read()
    expect(result).toEqual(showNotice)
    expect(mockedAsyncStorage.getItem).toHaveBeenCalledWith(
      resolverStorageNoticedKey,
    )
  })

  it('showNotice.read should fallback to true when empty / invalid', async () => {
    mockedAsyncStorage.getItem.mockResolvedValue(
      JSON.stringify('not a boolean'),
    )
    const result = await resolverStorage.showNotice.read()
    expect(result).toEqual(true)
    expect(mockedAsyncStorage.getItem).toHaveBeenCalledWith(
      resolverStorageNoticedKey,
    )
    mockedAsyncStorage.getItem.mockResolvedValue('[1, 2, ]')
    const result2 = await resolverStorage.showNotice.read()
    expect(result2).toEqual(true)
    expect(mockedAsyncStorage.getItem).toHaveBeenCalledWith(
      resolverStorageNoticedKey,
    )
  })

  it('showNotice.remove', async () => {
    await resolverStorage.showNotice.remove()
    expect(mockedAsyncStorage.removeItem).toHaveBeenCalledWith(
      resolverStorageNoticedKey,
    )
  })

  it('clear', async () => {
    await resolverStorage.clear()
    expect(mockedAsyncStorage.removeItem).toHaveBeenCalledTimes(1)
  })
})
