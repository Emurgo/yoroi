import {tokenMocks} from '../adapters/token.mocks'
import {isNft} from './is-nft'

describe('isNft', () => {
  it('should return true for NFT token', () => {
    const result = isNft(tokenMocks.nftCryptoKitty.info)

    expect(result).toBe(true)
  })

  it('should return false for non-NFT token', () => {
    const result = isNft(tokenMocks.primaryETH.info)

    expect(result).toBe(false)
  })
})
