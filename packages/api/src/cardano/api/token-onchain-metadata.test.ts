import {
  emptyOnChainMetadataRecord,
  findMetadataRecord,
  getMetadataResult,
  getOnChainMetadatas,
} from './token-onchain-metadata'
import {mockGetOnChainMetadatas} from './token-onchain-metadata.mocks'
import {Api} from '@yoroi/types'

describe('getMetadataResult', () => {
  it('should return undefined for everything if the records array is empty', () => {
    const records: Array<unknown> = []
    const result = getMetadataResult(records, {
      name: 'name',
      nameHex: 'nameHex',
      policyId: 'policyId',
    })
    expect(result).toEqual(emptyOnChainMetadataRecord)
  })

  it('should return undefined for everything if the records array contains invalid data', () => {
    const records: Array<unknown> = ['invalid', 123, null]
    const result = getMetadataResult(records, {
      name: 'name',
      nameHex: 'nameHex',
      policyId: 'policyId',
    })
    expect(result).toEqual(emptyOnChainMetadataRecord)
  })

  it('should return the original data and undefined if contains malformatted records', () => {
    const testCases = [
      'ftWrongNameType',
      'nftWrongNameType',
      'ftMissingName',
      'nftMissingName',
      'nftMissingImage',
      'nftMediaTypeMissingInFiles',
      'nftMediaTypeMissingInFilesAsObject',
    ]

    testCases.forEach((name) => {
      const key =
        '4d99f2fcc2fd91aca97865516b8e77a8e6dc011a905b9960289833e8.' + name
      const records = (
        mockGetOnChainMetadatas.withMalformattedFtAndNftRecords as any
      )[key]
      const expectedResult = {
        mintFtMetadata: name.startsWith('ft') ? records[0] : undefined,
        mintFtRecordSelected: undefined,
        mintNftMetadata: name.startsWith('nft') ? records[0] : undefined,
        mintNftRecordSelected: undefined,
      }
      const result = getMetadataResult(records, {
        name,
        nameHex: Buffer.from(name).toString('hex'),
        policyId: '4d99f2fcc2fd91aca97865516b8e77a8e6dc011a905b9960289833e8',
      })

      expect(result).toEqual(expectedResult)
    })
  })

  it('should find and parse the right current Ft and Nft', () => {
    const manyRecords =
      mockGetOnChainMetadatas.withFtsNfts[
        '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4842.manyRecords'
      ]
    const record = getMetadataResult(manyRecords, {
      name: 'manyRecords',
      nameHex: Buffer.from('manyRecords').toString('hex'),
      policyId: '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4842',
    })

    expect(record).toEqual({
      mintFtMetadata: manyRecords[0],
      mintFtRecordSelected:
        manyRecords[0].metadata[
          '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4842'
        ].manyRecords,
      mintNftMetadata: manyRecords[3],
      mintNftRecordSelected:
        manyRecords[3].metadata[
          '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4842'
        ].manyRecords,
    })
  })

  it('should properly find when there are many other mint datas', () => {
    const manyRecords =
      mockGetOnChainMetadatas.withMultipleMints[
        '775f356c756b70ca6b8e65feec417c7da295179eee6c4bfe9ff33176.54657374696e6754657374496d6167653132'
      ]
    const record = getMetadataResult(manyRecords, {
      name: Buffer.from('54657374696e6754657374496d6167653132', 'hex').toString(
        'utf8',
      ),
      nameHex: '54657374696e6754657374496d6167653132',
      policyId: '775f356c756b70ca6b8e65feec417c7da295179eee6c4bfe9ff33176',
    })

    expect(record).toEqual({
      minfFtMetadata: undefined,
      mintFtRecordSelected: undefined,
      mintNftMetadata: manyRecords[1],
      mintNftRecordSelected:
        manyRecords[1].metadata[
          '775f356c756b70ca6b8e65feec417c7da295179eee6c4bfe9ff33176'
        ].TestingTestImage12,
    })
  })
})

describe('findMetadataRecord', () => {
  it('should return undefined if the record is not present v1', () => {
    const record = findMetadataRecord(
      mockGetOnChainMetadatas.withMultipleMints[
        '775f356c756b70ca6b8e65feec417c7da295179eee6c4bfe9ff33176.54657374696e6754657374496d6167653132'
      ][0],
      {
        name: 'TestingTestImage12',
        nameHex: '54657374696e6754657374496d6167653132',
        policyId: '54657374696e6754657374496d6167653132',
      },
    )
    expect(record).toBeUndefined()
  })

  it('should return the record if is present v1', () => {
    const record = findMetadataRecord(
      mockGetOnChainMetadatas.withMultipleMints[
        '775f356c756b70ca6b8e65feec417c7da295179eee6c4bfe9ff33176.54657374696e6754657374496d6167653132'
      ][1],
      {
        name: 'TestingTestImage12',
        nameHex: '54657374696e6754657374496d6167653132',
        policyId: '775f356c756b70ca6b8e65feec417c7da295179eee6c4bfe9ff33176',
      },
    )
    expect(record).toBe(
      mockGetOnChainMetadatas.withMultipleMints[
        '775f356c756b70ca6b8e65feec417c7da295179eee6c4bfe9ff33176.54657374696e6754657374496d6167653132'
      ][1].metadata['775f356c756b70ca6b8e65feec417c7da295179eee6c4bfe9ff33176']
        .TestingTestImage12,
    )
  })

  it('should return the record if is present v2', () => {
    const record = findMetadataRecord(
      mockGetOnChainMetadatas.withMultipleMintsV2[
        '775f356c756b70ca6b8e65feec417c7da295179eee6c4bfe9ff33176.54657374696e6754657374496d6167653132'
      ][1],
      {
        name: 'TestingTestImage12',
        nameHex: '54657374696e6754657374496d6167653132',
        policyId: '775f356c756b70ca6b8e65feec417c7da295179eee6c4bfe9ff33176',
      },
    )
    expect(record).toBe(
      mockGetOnChainMetadatas.withMultipleMintsV2[
        '775f356c756b70ca6b8e65feec417c7da295179eee6c4bfe9ff33176.54657374696e6754657374496d6167653132'
      ][1].metadata['775f356c756b70ca6b8e65feec417c7da295179eee6c4bfe9ff33176'][
        '54657374696e6754657374496d6167653132'
      ],
    )
  })

  it('should return undefined if the record is not present v2', () => {
    const record = findMetadataRecord(
      mockGetOnChainMetadatas.withMultipleMintsV2[
        '775f356c756b70ca6b8e65feec417c7da295179eee6c4bfe9ff33176.54657374696e6754657374496d6167653132'
      ][0],
      {
        name: 'TestingTestImage12',
        nameHex: '54657374696e6754657374496d6167653132',
        policyId: '775f356c756b70ca6b8e65feec417c7da295179eee6c4bfe9ff33176',
      },
    )
    expect(record).toBeUndefined()
  })

  it('should return undefined if the record is incomplete/missing/malformatted', () => {
    const missingPolicy = findMetadataRecord(
      {
        key: '721',
        metadata: {
          '775f356c756b70ca6b8e65feec417c7da295179eee6c4bfe9ff33176': {
            '5465': {
              description: 'Image #12',
              files: [
                {
                  mediaType: 'image/jpeg',
                  name: 'Image #12',
                  src: 'ipfs://Qmctvkww1Ne3fuSa8wkGYmVerofAev16qTjpECEywuhXFV',
                },
              ],
              image: 'ipfs://Qmctvkww1Ne3fuSa8wkGYmVerofAev16qTjpECEywuhXFV',
              mediaType: 'image/jpeg',
              name: 'Image #12',
            },
            'TestingTestImage14': {
              description: 'Image #14',
              files: [
                {
                  mediaType: 'image/jpeg',
                  name: 'Image #14',
                  src: 'ipfs://QmbBFhHPXRGEf2Ak7Ed25mRXpRA1BsL9EjkJfYZZMXq97q',
                },
              ],
              image: 'ipfs://QmbBFhHPXRGEf2Ak7Ed25mRXpRA1BsL9EjkJfYZZMXq97q',
              mediaType: 'image/jpeg',
              name: 'Image #14',
            },
          },
          'version': '2.0',
        },
      },
      {
        name: 'TestingTestImage12',
        nameHex: '54657374696e6754657374496d6167653132',
        policyId: '775f356c756b70ca6b8e65feec417c7da295179eee6c4bfe9ff33176',
      },
    )
    const missingMetadata = findMetadataRecord(
      {
        key: '721',
      },
      {
        name: 'TestingTestImage12',
        nameHex: '54657374696e6754657374496d6167653132',
        policyId: '775f356c756b70ca6b8e65feec417c7da295179eee6c4bfe9ff33176',
      },
    )

    expect(missingMetadata).toBeUndefined()
    expect(missingPolicy).toBeUndefined()
  })
})

describe('getOnChainMetadatas', () => {
  let mockFetcher: jest.Mock

  beforeEach(() => {
    mockFetcher = jest.fn()
  })

  it('should return an empty object when tokenIds is empty', async () => {
    const getMetadata = getOnChainMetadatas('https://localhost', mockFetcher)
    const result = await getMetadata([])
    expect(result).toEqual({})
  })

  it('should send a POST request to the correct URL with transformed asset ids', async () => {
    mockFetcher.mockResolvedValue({})
    const args: Api.Cardano.TokenId[] = [
      '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4842.3030',
      '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4842.3031',
    ]
    const getMetadata = getOnChainMetadatas('https://localhost', mockFetcher)
    await getMetadata(args)

    expect(mockFetcher).toHaveBeenCalledWith({
      url: 'https://localhost/multiAsset/metadata',
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      data: {
        assets: [
          {
            policy: '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4842',
            nameHex: '3030',
          },
          {
            policy: '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4842',
            nameHex: '3031',
          },
        ],
      },
    })
  })

  it('should reject the promise if the response is not an object', async () => {
    mockFetcher.mockResolvedValue(null)
    const getMetadata = getOnChainMetadatas('https://localhost', mockFetcher)
    await expect(
      getMetadata([
        '1d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4844.',
        '1d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4844.',
      ]),
    ).rejects.toThrow('Invalid asset metadatas')
  })

  it('should properly parse and return the metadata', async () => {
    const mockResponse = mockGetOnChainMetadatas.withFtsNfts
    mockFetcher.mockResolvedValue(mockResponse)
    const getMetadata = getOnChainMetadatas('https://localhost', mockFetcher)

    const result = await getMetadata([
      '1d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4844.',
      '5449dbad479b09de066bdf7934799c8a5aa2b66cf4a11eb759aa76c6.6e66745632',
      '5449dbad479b09de066bdf7934799c8a5aa2b66cf4a11eb759aa76c6.6e667457697468496d6167654172726179',
      '775f356c756b70ca6b8e65feec417c7da295179eee6c4bfe9ff33176.6e6674457874726173416e644e6f56657273696f6e',
      '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4842.656d7074795265636f726473',
      '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4842.6674557375616c4d65746164617461',
      '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4842.6d616e795265636f726473',
      '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4842.6e6674557375616c4d65746164617461',
      '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4842.6e667457697468417574686f72416e64457874726173',
    ])

    expect(result).toEqual({
      '1d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4844.': {
        mintNftMetadata:
          mockResponse[
            '1d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4844.'
          ][0],
        mintNftRecordSelected:
          mockResponse[
            '1d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4844.'
          ][0].metadata[
            '1d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4844'
          ][''],
        mintFtMetadata: undefined,
        mintFtRecordSelected: undefined,
      },
      '5449dbad479b09de066bdf7934799c8a5aa2b66cf4a11eb759aa76c6.6e66745632': {
        mintNftMetadata:
          mockResponse[
            '5449dbad479b09de066bdf7934799c8a5aa2b66cf4a11eb759aa76c6.nftV2'
          ][0],
        mintNftRecordSelected:
          mockResponse[
            '5449dbad479b09de066bdf7934799c8a5aa2b66cf4a11eb759aa76c6.nftV2'
          ][0].metadata[
            '5449dbad479b09de066bdf7934799c8a5aa2b66cf4a11eb759aa76c6'
          ]['6e66745632'],
        mintFtMetadata: undefined,
        mintFtRecordSelected: undefined,
      },
      '5449dbad479b09de066bdf7934799c8a5aa2b66cf4a11eb759aa76c6.6e667457697468496d6167654172726179':
        {
          mintNftMetadata:
            mockResponse[
              '5449dbad479b09de066bdf7934799c8a5aa2b66cf4a11eb759aa76c6.nftWithImageArray'
            ][0],
          mintNftRecordSelected:
            mockResponse[
              '5449dbad479b09de066bdf7934799c8a5aa2b66cf4a11eb759aa76c6.nftWithImageArray'
            ][0].metadata[
              '5449dbad479b09de066bdf7934799c8a5aa2b66cf4a11eb759aa76c6'
            ].nftWithImageArray,
          mintFtMetadata: undefined,
          mintFtRecordSelected: undefined,
        },
      '775f356c756b70ca6b8e65feec417c7da295179eee6c4bfe9ff33176.6e6674457874726173416e644e6f56657273696f6e':
        {
          mintNftMetadata:
            mockResponse[
              '775f356c756b70ca6b8e65feec417c7da295179eee6c4bfe9ff33176.nftExtrasAndNoVersion'
            ][0],
          mintNftRecordSelected:
            mockResponse[
              '775f356c756b70ca6b8e65feec417c7da295179eee6c4bfe9ff33176.nftExtrasAndNoVersion'
            ][0].metadata[
              '775f356c756b70ca6b8e65feec417c7da295179eee6c4bfe9ff33176'
            ].nftExtrasAndNoVersion,
          mintFtMetadata: undefined,
          mintFtRecordSelected: undefined,
        },
      '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4842.656d7074795265636f726473':
        {
          mintNftMetadata: undefined,
          mintNftRecordSelected: undefined,
          mintFtMetadata: undefined,
          mintFtRecordSelected: undefined,
        },
      '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4842.6674557375616c4d65746164617461':
        {
          mintNftMetadata: undefined,
          mintNftRecordSelected: undefined,
          mintFtMetadata:
            mockResponse[
              '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4842.ftUsualMetadata'
            ][0],
          mintFtRecordSelected:
            mockResponse[
              '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4842.ftUsualMetadata'
            ][0].metadata[
              '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4842'
            ].ftUsualMetadata,
        },
      '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4842.6d616e795265636f726473':
        {
          mintNftMetadata:
            mockResponse[
              '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4842.manyRecords'
            ][3],
          mintNftRecordSelected:
            mockResponse[
              '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4842.manyRecords'
            ][3].metadata[
              '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4842'
            ].manyRecords,
          mintFtMetadata:
            mockResponse[
              '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4842.manyRecords'
            ][0],
          mintFtRecordSelected:
            mockResponse[
              '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4842.manyRecords'
            ][0].metadata[
              '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4842'
            ].manyRecords,
        },
      '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4842.6e6674557375616c4d65746164617461':
        {
          mintNftMetadata:
            mockResponse[
              '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4842.nftUsualMetadata'
            ][0],
          mintNftRecordSelected:
            mockResponse[
              '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4842.nftUsualMetadata'
            ][0].metadata[
              '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4842'
            ].nftUsualMetadata,
          mintFtMetadata: undefined,
          mintFtRecordSelected: undefined,
        },
      '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4842.6e667457697468417574686f72416e64457874726173':
        {
          mintNftMetadata:
            mockResponse[
              '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4842.nftWithAuthorAndExtras'
            ][0],
          mintNftRecordSelected:
            mockResponse[
              '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4842.nftWithAuthorAndExtras'
            ][0].metadata[
              '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4842'
            ].nftWithAuthorAndExtras,
          mintFtMetadata: undefined,
          mintFtRecordSelected: undefined,
        },
    })
  })

  it('should handle absent and unamed records gracefully', async () => {
    const mockResponse = mockGetOnChainMetadatas.withSameNftWithRecordsV1V2
    mockFetcher.mockResolvedValue(mockResponse)
    const getMetadata = getOnChainMetadatas('https://localhost', mockFetcher)
    const result = await getMetadata([
      '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4843.3030',
      '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4843.3032',
      '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4843.',
      '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4844.',
    ])

    expect(result).toEqual({
      '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4843.3030': {
        mintNftMetadata:
          mockGetOnChainMetadatas.withSameNftWithRecordsV1V2[
            '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4843.00'
          ][0],
        mintNftRecordSelected:
          mockGetOnChainMetadatas.withSameNftWithRecordsV1V2[
            '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4843.00'
          ][0].metadata[
            '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4843'
          ]['3030'],
        mintFtMetadata: undefined,
        mintFtRecordSelected: undefined,
      },
      '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4843.3032':
        emptyOnChainMetadataRecord,
      '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4843.': {
        mintNftMetadata:
          mockGetOnChainMetadatas.withSameNftWithRecordsV1V2[
            '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4843.'
          ][0],
        mintNftRecordSelected:
          mockGetOnChainMetadatas.withSameNftWithRecordsV1V2[
            '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4843.'
          ][0].metadata[
            '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4843'
          ][''],
        mintFtMetadata: undefined,
        mintFtRecordSelected: undefined,
      },
      '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4844.':
        emptyOnChainMetadataRecord,
    })
  })

  it('should handle absent and unamed records gracefully ft', async () => {
    const mockResponse = mockGetOnChainMetadatas.withOnlyFtRecords
    mockFetcher.mockResolvedValue(mockResponse)
    const getMetadata = getOnChainMetadatas('https://localhost', mockFetcher)
    const result = await getMetadata([
      '4d99f2fcc2fd91aca97865516b8e77a8e6dc011a905b9960289833e8.776974684f6e6c7946745265636f726473',
    ])
    expect(result).toEqual({
      '4d99f2fcc2fd91aca97865516b8e77a8e6dc011a905b9960289833e8.776974684f6e6c7946745265636f726473':
        {
          mintNftMetadata: undefined,
          mintNftRecordSelected: undefined,
          mintFtMetadata:
            mockGetOnChainMetadatas.withOnlyFtRecords[
              '4d99f2fcc2fd91aca97865516b8e77a8e6dc011a905b9960289833e8.withOnlyFtRecords'
            ][0],
          mintFtRecordSelected: undefined,
        },
    })
  })

  it('no deps for coverage', async () => {
    const getMetadata = getOnChainMetadatas('https://localhost')
    expect(getMetadata).toBeDefined()
  })
})
