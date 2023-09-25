/* eslint-disable @typescript-eslint/no-explicit-any */
import {Portfolio} from '@yoroi/types'
import {Cardano} from '@yoroi/wallets'

import {RawUtxo} from '../../types'
import {
  asApiTokenId,
  cardanoFilesAsBalanceTokenFiles,
  cardanoFutureTokenAsBalanceToken,
  cardanoOffChainTokenRegistryEntryAsBalanceToken,
  cardanoOnChainMetadataAsBalanceToken,
  discoverImage,
  discoverIpfsLink,
  discoverWebsite,
  rawUtxosAsAmounts,
} from './transformers' // replace with the actual import

describe('asApiTokenId', () => {
  it('should return the same token ID if it includes a period', () => {
    const tokenId = '775f356c756b70ca6b8e65feec417c7da295179eee6c4bfe9ff33176.54657374696e6754657374496d6167653132'
    const result = asApiTokenId(tokenId)
    expect(result).toBe('775f356c756b70ca6b8e65feec417c7da295179eee6c4bfe9ff33176.54657374696e6754657374496d6167653132')
  })

  it('should return with period if the token ID does not include a period', () => {
    const tokenId = '775f356c756b70ca6b8e65feec417c7da295179eee6c4bfe9ff33176'
    const result = asApiTokenId(tokenId)
    expect(result).toBe('775f356c756b70ca6b8e65feec417c7da295179eee6c4bfe9ff33176.')
  })
})

describe('discoverWebsite', () => {
  it('returns undefined if metadata is undefined', () => {
    expect(discoverWebsite(undefined as any)).toBeUndefined()
  })

  it('returns undefined if no matching keys in metadata', () => {
    expect(discoverWebsite({unrelatedKey: 'value'} as any)).toBeUndefined()
  })

  it('returns website if metadata contains a string type key', () => {
    expect(discoverWebsite({url: 'https://example.com'} as any)).toEqual('https://example.com')
  })

  it('returns concatenated website if metadata contains an array of strings', () => {
    expect(discoverWebsite({url: ['https://', 'example.com']} as any)).toEqual('https://example.com')
  })

  it('ignores non-string and non-array types', () => {
    expect(discoverWebsite({url: 123} as any)).toBeUndefined()
  })

  it('prefers the first matching key from the list of websiteFallbackKeys', () => {
    expect(discoverWebsite({website: 'https://website.com', url: 'https://url.com'} as any)).toEqual('https://url.com')
  })

  it('calls asConcatenatedString correctly', () => {
    expect(discoverWebsite({url: ['https://', 'example.com']} as any)).toBe('https://example.com')
  })
})

describe('cardanoOnChainMetadataAsBalanceToken', () => {
  it('should populate all Nft fields correctly', () => {
    const input: {
      tokenId: Cardano.Api.TokenId
      metadata: Cardano.Api.NftMetadata
      kind: Portfolio.TokenInfo['kind']
      cardanoFutureToken: any
    } = {
      tokenId: '775f356c756b70ca6b8e65feec417c7da295179eee6c4bfe9ff33176.54657374696e6754657374496d6167653132',
      metadata: {
        name: 'testName',
        description: 'testDescription',
        image: 'ipfs://testImage',
        mediaType: 'testMediaType',
        files: [
          {
            name: 'testName',
            mediaType: 'testMediaType',
            src: 'ipfs://testImage',
          },
        ],
      },
      kind: 'nft',
      cardanoFutureToken: {key: 'value'},
    }

    const expectedOutput: Portfolio.Token = {
      info: {
        kind: 'nft',
        id: '775f356c756b70ca6b8e65feec417c7da295179eee6c4bfe9ff33176.54657374696e6754657374496d6167653132',
        fingerprint: 'asset1h7a758kx4ntaa6kq7wtj3suy0wtk6x9lzhqc4g', // This would be what Cardano.asFingerprint returns
        name: 'testName',
        description: 'testDescription',
        group: '775f356c756b70ca6b8e65feec417c7da295179eee6c4bfe9ff33176',
        icon: 'https://ipfs.io/ipfs/testImage',
        image: 'https://ipfs.io/ipfs/testImage',
        mediaType: 'testMediaType',
        symbol: undefined,
        ticker: undefined,
        website: undefined,
        decimals: undefined,
      },
      files: [
        {
          name: 'testName',
          mediaType: 'testMediaType',
          src: 'https://ipfs.io/ipfs/testImage',
        },
      ],
      metadatas: {key: 'value'},
    }

    const result = cardanoOnChainMetadataAsBalanceToken(input)

    expect(result).toEqual(expectedOutput)
  })

  it('should populate all Ft fields correctly', () => {
    const input: {
      tokenId: Cardano.Api.TokenId
      metadata: Cardano.Api.FtMetadata
      kind: Portfolio.TokenInfo['kind']
      cardanoFutureToken: any
    } = {
      tokenId: '775f356c756b70ca6b8e65feec417c7da295179eee6c4bfe9ff33176.54657374696e6754657374496d6167653132',
      metadata: {
        id: '775f356c756b70ca6b8e65feec417c7da295179eee6c4bfe9ff33176.54657374696e6754657374496d6167653132',
        fingerprint: 'asset1h7a758kx4ntaa6kq7wtj3suy0wtk6x9lzhqc4g', // This would be what Cardano.asFingerprint returns
        name: 'testName',
        description: 'testDescription',
        group: '775f356c756b70ca6b8e65feec417c7da295179eee6c4bfe9ff33176',
        image: 'ipfs://testImage',
        logo: 'ipfs://testImage',
        symbol: 'testSymbol',
        ticker: 'testTicker',
        files: [
          {
            name: 'testName',
            mediaType: 'testMediaType',
            src: 'ipfs://testImage',
          },
        ],
      },
      kind: 'ft',
      cardanoFutureToken: {key: 'value'},
    }

    const expectedOutput: Portfolio.Token = {
      info: {
        kind: 'ft',
        id: '775f356c756b70ca6b8e65feec417c7da295179eee6c4bfe9ff33176.54657374696e6754657374496d6167653132',
        fingerprint: 'asset1h7a758kx4ntaa6kq7wtj3suy0wtk6x9lzhqc4g', // This would be what Cardano.asFingerprint returns
        name: 'testName',
        description: 'testDescription',
        group: '775f356c756b70ca6b8e65feec417c7da295179eee6c4bfe9ff33176',
        image: 'https://ipfs.io/ipfs/testImage',
        icon: 'https://ipfs.io/ipfs/testImage',
        symbol: 'testSymbol',
        ticker: 'testTicker',
        website: undefined,
        decimals: undefined,
        mediaType: undefined,
      },
      files: [
        {
          name: 'testName',
          mediaType: 'testMediaType',
          src: 'https://ipfs.io/ipfs/testImage',
        },
      ],
      metadatas: {key: 'value'},
    }

    const result = cardanoOnChainMetadataAsBalanceToken(input)

    expect(result).toEqual(expectedOutput)
  })
})

describe('cardanoOffChainTokenRegistryEntryAsBalanceToken', () => {
  it('should populate all fields correctly', () => {
    const input: {tokenId: Cardano.Api.TokenId; entry: Cardano.Api.TokenRegistryEntry; cardanoFutureToken: any} = {
      tokenId: '775f356c756b70ca6b8e65feec417c7da295179eee6c4bfe9ff33176.54657374696e6754657374496d6167653132',
      entry: {
        subject: 'testSubject',
        policy: 'testPolicy',
        name: {
          value: 'testName',
          sequenceNumber: 1,
          signatures: [],
        },
        description: {
          value: 'testDescription',
          sequenceNumber: 1,
          signatures: [],
        },
        logo: {
          value: 'ipfs://testImage',
          sequenceNumber: 1,
          signatures: [],
        },
        ticker: {
          value: 'testTicker',
          sequenceNumber: 1,
          signatures: [],
        },
        url: {
          value: 'https://testWebsite',
          sequenceNumber: 1,
          signatures: [],
        },
        decimals: {
          value: 1,
          sequenceNumber: 1,
          signatures: [],
        },
      },
      cardanoFutureToken: {key: 'value'},
    }

    const expectedOutput: Portfolio.Token = {
      info: {
        kind: 'ft',
        id: '775f356c756b70ca6b8e65feec417c7da295179eee6c4bfe9ff33176.54657374696e6754657374496d6167653132',
        fingerprint: 'asset1h7a758kx4ntaa6kq7wtj3suy0wtk6x9lzhqc4g', // This would be what Cardano.asFingerprint returns
        name: 'testName',
        description: 'testDescription',
        group: '775f356c756b70ca6b8e65feec417c7da295179eee6c4bfe9ff33176',
        image: 'https://ipfs.io/ipfs/testImage',
        icon: 'https://ipfs.io/ipfs/testImage',
        ticker: 'testTicker',
        website: 'https://testWebsite',
        decimals: 1,
      },
      metadatas: {key: 'value'},
    }

    const result = cardanoOffChainTokenRegistryEntryAsBalanceToken(input)

    expect(result).toEqual(expectedOutput)
  })
})

describe('discoverImage', () => {
  it('should return undefined if metadata is undefined', () => {
    expect(discoverImage(undefined)).toBeUndefined()
  })

  it('should return an IPFS image URL', () => {
    const metadata: any = {image: 'ipfs://example'}
    expect(discoverImage(metadata)).toBe('https://ipfs.io/ipfs/example')
  })

  it('should return a non-IPFS image URL', () => {
    const metadata: any = {image: 'http://example.com/image.png'}
    expect(discoverImage(metadata)).toBe('http://example.com/image.png')
  })

  it('should prioritize the `image` key', () => {
    const metadata: any = {image: 'ipfs://example', logo: 'http://logo.com/logo.png', img: 'http://img.com/img.png'}
    expect(discoverImage(metadata)).toBe('https://ipfs.io/ipfs/example')
  })

  it('should fallback to the `logo` key', () => {
    const metadata: any = {logo: 'http://logo.com/logo.png', img: 'http://img.com/img.png'}
    expect(discoverImage(metadata)).toBe('http://logo.com/logo.png')
  })

  it('should fallback to the `img` key', () => {
    const metadata: any = {img: 'http://img.com/img.png'}
    expect(discoverImage(metadata)).toBe('http://img.com/img.png')
  })

  it('should handle array of images and return concatenated string', () => {
    const metadata: any = {image: ['image1', 'image2']}
    expect(discoverImage(metadata)).toBe('image1image2')
  })

  it('should return undefined for invalid image types', () => {
    const metadata: any = {image: {}}
    expect(discoverImage(metadata)).toBeUndefined()
  })
})

describe('discoverIpfsLink', () => {
  it('transforms an IPFS link into an accessible URL', () => {
    const ipfsLink = 'ipfs://QmSomeHash'
    const expected = 'https://ipfs.io/ipfs/QmSomeHash'
    expect(discoverIpfsLink(ipfsLink)).toEqual(expected)
  })

  it('leaves a non-IPFS link unchanged', () => {
    const nonIpfsLink = 'https://example.com/image.png'
    expect(discoverIpfsLink(nonIpfsLink)).toEqual(nonIpfsLink)
  })
})

describe('cardanoFilesAsBalanceTokenFiles', () => {
  it('returns undefined if files are not of type CardanoApi.isMetadataFile', () => {
    expect(cardanoFilesAsBalanceTokenFiles(undefined)).toBeUndefined()
    expect(cardanoFilesAsBalanceTokenFiles(['not', 'metadata', 'file'])).toBeUndefined()
  })

  it('returns empty array if input is empty array', () => {
    expect(cardanoFilesAsBalanceTokenFiles([])).toEqual([])
  })

  it('skips files without mediaType or src', () => {
    const files = [
      {name: 'file1', mediaType: undefined, src: 'src1'},
      {name: 'file2', mediaType: 'type2', src: undefined},
    ]
    expect(cardanoFilesAsBalanceTokenFiles(files)).toBeUndefined()
  })

  it('skips all files if one is invalid - without mediaType or src', () => {
    const files = [
      {name: 'file1', mediaType: undefined, src: 'src1'},
      {name: 'file2', mediaType: 'type2', src: undefined},
    ]
    expect(cardanoFilesAsBalanceTokenFiles(files)).toBeUndefined()
  })

  it('transforms valid Cardano files to Balance token files', () => {
    const files = [
      {name: 'file1', mediaType: 'type1', src: 'src1'},
      {name: 'file2', mediaType: 'type2', src: 'src2'},
    ]

    const expected = [
      {name: 'file1', mediaType: 'type1', src: 'src1'},
      {name: 'file2', mediaType: 'type2', src: 'src2'},
    ]

    expect(cardanoFilesAsBalanceTokenFiles(files)).toEqual(expected)
  })
})

describe('cardanoFutureTokenAsBalanceToken function', () => {
  it('should return fungible token when offChain.isValid is true', () => {
    const tokenId = '775f356c756b70ca6b8e65feec417c7da295179eee6c4bfe9ff33176.54657374696e6754657374496d6167653132'

    const futureToken: Cardano.Api.FutureToken = {
      supply: 10,
      offChain: {
        tokenRegistry: {
          subject: 'testSubject',
          name: {
            value: 'testName',
            sequenceNumber: 1,
            signatures: [],
          },
          description: {
            value: 'testDescription',
            sequenceNumber: 1,
            signatures: [],
          },
          logo: {
            value: 'ipfs://testImage',
            sequenceNumber: 1,
            signatures: [],
          },
          decimals: {
            value: 1,
            sequenceNumber: 1,
            signatures: [],
          },
        },
        isValid: true,
      },
      onChain: {
        mintFtMetadata: {},
        mintFtRecordSelected: undefined,
        mintNftMetadata: {},
        mintNftRecordSelected: undefined,
      },
    }

    const result = cardanoFutureTokenAsBalanceToken(tokenId, futureToken)

    expect(result).toHaveProperty('info.kind', 'ft')
  })
})

describe('rawUtxosAsAmounts', () => {
  it('Empty Utxos', () => {
    const utxos: RawUtxo[] = []
    const primaryTokenId = 'primaryTokenId'

    expect(rawUtxosAsAmounts(utxos, primaryTokenId)).toEqual({
      primaryTokenId: '0',
    } as Portfolio.Amounts)
  })

  it('Utxos without tokens', () => {
    const utxos: RawUtxo[] = [
      {
        amount: '10132',
        assets: [],
        receiver: '',
        tx_hash: '',
        tx_index: 12,
        utxo_id: '',
      },
      {
        amount: '612413',
        assets: [],
        receiver: '',
        tx_hash: '',
        tx_index: 13,
        utxo_id: '',
      },
      {
        amount: '3212',
        assets: [],
        receiver: '',
        tx_hash: '',
        tx_index: 15,
        utxo_id: '',
      },
      {
        amount: '1933',
        receiver: '',
        tx_hash: '',
        tx_index: 14,
        utxo_id: '',
        assets: [],
      },
    ]

    const primaryTokenId = 'primaryTokenId'

    expect(rawUtxosAsAmounts(utxos, primaryTokenId)).toEqual({
      primaryTokenId: '627690',
    } as Portfolio.Amounts)
  })

  it('Utxos with tokens', () => {
    const utxos: RawUtxo[] = [
      {
        amount: '1024',
        assets: [
          {assetId: 'token123', amount: '10', policyId: '', name: ''},
          {assetId: 'token567', amount: '6', policyId: '', name: ''},
        ],
        receiver: '',
        tx_hash: '',
        tx_index: 12,
        utxo_id: '',
      },
      {
        amount: '62314',
        assets: [{assetId: 'token123', amount: '5', policyId: '', name: ''}],
        receiver: '',
        tx_hash: '',
        tx_index: 13,
        utxo_id: '',
      },
      {
        amount: '332',
        assets: [{assetId: 'token567', amount: '2', policyId: '', name: ''}],
        receiver: '',
        tx_hash: '',
        tx_index: 15,
        utxo_id: '',
      },
      {
        amount: '4235',
        receiver: '',
        tx_hash: '',
        tx_index: 14,
        utxo_id: '',
        assets: [],
      },
    ]

    const primaryTokenId = 'primaryTokenId'

    expect(rawUtxosAsAmounts(utxos, primaryTokenId)).toEqual({
      primaryTokenId: '67905',
      token123: '15',
      token567: '8',
    } as Portfolio.Amounts)
  })
})
