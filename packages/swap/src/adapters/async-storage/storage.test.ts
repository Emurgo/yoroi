import AsyncStorage from '@react-native-async-storage/async-storage'
import {Swap} from '@yoroi/types'

import {swapStorageMaker, swapStorageSlippageKey} from './storage'

jest.mock('@react-native-async-storage/async-storage')

const mockedAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>

describe('swapStorageMaker', () => {
  let swapStorage: Swap.Storage

  beforeEach(() => {
    jest.clearAllMocks()
    swapStorage = swapStorageMaker()
  })

  it('slippage.save', async () => {
    const slippage = 0.1
    await swapStorage.slippage.save(slippage)
    expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
      swapStorageSlippageKey,
      JSON.stringify(slippage),
    )
  })

  it('slippage.read', async () => {
    const slippage = 0.1
    mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(slippage))
    const result = await swapStorage.slippage.read()
    expect(result).toEqual(slippage)
    expect(mockedAsyncStorage.getItem).toHaveBeenCalledWith(
      swapStorageSlippageKey,
    )
  })

  it('slippage.read should fallback to 0 when wrong data', async () => {
    mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify('not a number'))
    const result = await swapStorage.slippage.read()
    expect(result).toEqual(0)
    expect(mockedAsyncStorage.getItem).toHaveBeenCalledWith(
      swapStorageSlippageKey,
    )
    mockedAsyncStorage.getItem.mockResolvedValue('[1, 2, ]')
    const result2 = await swapStorage.slippage.read()
    expect(result2).toEqual(0)
    expect(mockedAsyncStorage.getItem).toHaveBeenCalledWith(
      swapStorageSlippageKey,
    )
  })

  it('slippage.remove', async () => {
    await swapStorage.slippage.remove()
    expect(mockedAsyncStorage.removeItem).toHaveBeenCalledWith(
      swapStorageSlippageKey,
    )
  })

  it('clear', async () => {
    await swapStorage.clear()
    expect(mockedAsyncStorage.removeItem).toHaveBeenCalledTimes(1)
  })
})
