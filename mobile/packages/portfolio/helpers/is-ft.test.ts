import {tokenMocks} from '../adapters/token.mocks'
import {isFt} from './is-ft'

describe('isFt', () => {
  it('should return true for FT token', () => {
    const result = isFt(tokenMocks.primaryETH.info)

    expect(result).toBe(true)
  })

  it('should return false for non-FT token', () => {
    const result = isFt(tokenMocks.nftCryptoKitty.info)

    expect(result).toBe(false)
  })
})
