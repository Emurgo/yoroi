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

  it('notice.save', async () => {
    const notice = true
    await resolverStorage.notice.save(notice)
    expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
      resolverStorageNoticedKey,
      JSON.stringify(notice),
    )
  })

  it('notice.read', async () => {
    const notice = true
    mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(notice))
    const result = await resolverStorage.notice.read()
    expect(result).toEqual(notice)
    expect(mockedAsyncStorage.getItem).toHaveBeenCalledWith(
      resolverStorageNoticedKey,
    )
  })

  it('notice.read should fallback to false when wrong data', async () => {
    mockedAsyncStorage.getItem.mockResolvedValue(
      JSON.stringify('not a boolean'),
    )
    const result = await resolverStorage.notice.read()
    expect(result).toEqual(false)
    expect(mockedAsyncStorage.getItem).toHaveBeenCalledWith(
      resolverStorageNoticedKey,
    )
    mockedAsyncStorage.getItem.mockResolvedValue('[1, 2, ]')
    const result2 = await resolverStorage.notice.read()
    expect(result2).toEqual(false)
    expect(mockedAsyncStorage.getItem).toHaveBeenCalledWith(
      resolverStorageNoticedKey,
    )
  })

  it('notice.remove', async () => {
    await resolverStorage.notice.remove()
    expect(mockedAsyncStorage.removeItem).toHaveBeenCalledWith(
      resolverStorageNoticedKey,
    )
  })

  it('clear', async () => {
    await resolverStorage.clear()
    expect(mockedAsyncStorage.removeItem).toHaveBeenCalledTimes(1)
  })
})
