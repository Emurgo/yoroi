import {tokenInfoMocks} from '../adapters/token-info.mocks'
import {isPrimaryToken} from './is-primary-token'

describe('isPrimary', () => {
  it('should return true if the token nature is Primary', () => {
    const result = isPrimaryToken(tokenInfoMocks.primaryETH)

    expect(result).toBe(true)
  })

  it('should return false if the token nature is not Primary', () => {
    const result = isPrimaryToken(tokenInfoMocks.nftCryptoKitty)

    expect(result).toBe(false)
  })
})
