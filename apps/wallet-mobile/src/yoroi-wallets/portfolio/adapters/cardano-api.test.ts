import {CardanoApi} from '@yoroi/cardano'

import {portfolioManagerApiMaker} from './cardano-api'

describe('portfolioManagerApiMaker', () => {
  it('should return expected data when all API calls succeed', async () => {
    const mockedDeps = {
      request: jest.fn(),
      getTokenSupply: jest.fn().mockReturnValue(jest.fn().mockResolvedValue(mockReturnSupply)),
      getOnChainMetadatas: jest.fn().mockReturnValue(jest.fn().mockResolvedValue(mockReturnGetOnChainMetadata)),
      getOffChainMetadata: jest.fn().mockReturnValue(jest.fn().mockResolvedValue(mockReturnGetOnChainMetadata)),
    }
    const api = portfolioManagerApiMaker({baseUrlApi: 'apiUrl', baseUrlTokenRegistry: 'tokenUrl'}, mockedDeps)

    await api.tokens([
      '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4842.6e667457697468417574686f72416e64457874726173',
    ])

    expect(mockedDeps.getTokenSupply).toHaveBeenCalledWith('apiUrl', mockedDeps.request)
    expect(mockedDeps.getOnChainMetadatas).toHaveBeenCalledWith('apiUrl', mockedDeps.request)
    expect(mockedDeps.getOffChainMetadata).toHaveBeenCalledWith('tokenUrl', mockedDeps.request)
  })

  it('should catch errors and return an empty array', async () => {
    const api = portfolioManagerApiMaker(
      {baseUrlApi: 'apiUrl', baseUrlTokenRegistry: 'tokenUrl'},
      {
        request: jest.fn(),
        getTokenSupply: jest.fn().mockReturnValue(jest.fn().mockRejectedValue('error')),
        getOnChainMetadatas: jest.fn().mockReturnValue(jest.fn().mockRejectedValue('error')),
        getOffChainMetadata: jest.fn().mockReturnValue(jest.fn().mockRejectedValue('error')),
      },
    )

    await expect(
      api.tokens([
        '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4842.6e667457697468417574686f72416e64457874726173',
      ]),
    ).rejects.toEqual('error')
  })

  it('ignore deps - coverage only', async () => {
    const api = portfolioManagerApiMaker({baseUrlApi: 'apiUrl', baseUrlTokenRegistry: 'tokenUrl'})
    expect(api).toBeDefined()
  })
})

const mockReturnSupply = {
  '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4842.6e667457697468417574686f72416e64457874726173': 1,
}

const mockReturnGetOnChainMetadata = {
  '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4842.6e667457697468417574686f72416e64457874726173': {
    mintNftMetadata:
      CardanoApi.mockGetOnChainMetadatas.withFtsNfts[
        '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4842.nftWithAuthorAndExtras'
      ][0],
    mintNftRecordSelected:
      CardanoApi.mockGetOnChainMetadatas.withFtsNfts[
        '9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4842.nftWithAuthorAndExtras'
      ][0].metadata['9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4842'].nftWithAuthorAndExtras,
    mintFtMetadata: undefined,
    mintFtRecordSelected: undefined,
  },
}
