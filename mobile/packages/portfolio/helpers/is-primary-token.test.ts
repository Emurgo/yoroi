import {tokenInfoMocks} from '../adapters/token-info.mocks'
import {primaryTokenId} from '../constants'
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

  it('should return true if the token id is the primary token id', () => {
    const result = isPrimaryToken(primaryTokenId)

    expect(result).toBe(true)
  })

  it('should return false if the token id is not the primary token id', () => {
    const result = isPrimaryToken(tokenInfoMocks.nftCryptoKitty.id)

    expect(result).toBe(false)
  })

  it('should return false if the token id is present', () => {
    const result = isPrimaryToken(null)

    expect(result).toBe(false)
  })
})
