import {swapStorageSlippageKey} from './mmkv-storage'

describe('mmkv-storage', () => {
  it('swapStorageSlippageKey', () => {
    expect(swapStorageSlippageKey).toBe('swap-slippage')
  })
})
