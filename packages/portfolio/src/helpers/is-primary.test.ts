import {tokenInfoMocks} from '../adapters/token-info.mocks'
import {isPrimary} from './is-primary'

describe('isPrimary', () => {
  it('should return true if the token nature is Primary', () => {
    const result = isPrimary(tokenInfoMocks.primaryETH)

    expect(result).toBe(true)
  })

  it('should return false if the token nature is not Primary', () => {
    const result = isPrimary(tokenInfoMocks.nftCryptoKitty)

    expect(result).toBe(false)
  })
})
