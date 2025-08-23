import {tokenMocks} from '../adapters/token.mocks'
import {infoExtractName} from './info-extract-name'

describe('infoExtractName', () => {
  it('should extract the ticker from FT token', () => {
    const result = infoExtractName(tokenMocks.primaryETH.info, {
      mode: 'name',
    })

    expect(result).toBe('ETH')
  })

  it('should extract the name from FT token when ticker is empty', () => {
    const result = infoExtractName(
      {
        ...tokenMocks.primaryETH.info,
        ticker: '',
      },
      {
        mode: 'name',
      },
    )

    expect(result).toBe('Ethereum')
  })

  it('should extract the fingerprint from FT token when ticker/name are empty', () => {
    const result = infoExtractName(
      {
        ...tokenMocks.primaryETH.info,
        ticker: '',
        name: '',
      },
      {
        mode: 'name',
      },
    )

    expect(result).toBe('0x1234567890abcdef')
  })

  it('should extract the name from NFT token', () => {
    const result = infoExtractName(tokenMocks.nftCryptoKitty.info, {
      mode: 'name',
    })

    expect(result).toBe('CryptoKitty #1234')
  })

  it('should extract the fingerprint from NFT token when name is empty', () => {
    const result = infoExtractName(
      {
        ...tokenMocks.nftCryptoKitty.info,
        name: '',
      },
      {
        mode: 'name',
      },
    )

    expect(result).toBe('asset1s7nlt...eg483c6wu75')
  })

  it('should extract the ticker from token', () => {
    const result = infoExtractName(tokenMocks.rnftWhatever.info, {
      mode: 'currency',
    })

    expect(result).toBe('Whatever')
  })

  it('should extract the ticker default', () => {
    const result = infoExtractName(tokenMocks.rnftWhatever.info)

    expect(result).toBe('Whatever #42')
  })
})
