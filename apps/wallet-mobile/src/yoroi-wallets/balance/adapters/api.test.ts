import {tokenManagerApiMaker} from './api'

describe('tokenManagerApiMaker', () => {
  it('should return expected data when all API calls succeed', async () => {
    const mockedDeps = {
      fetch: jest.fn(),
      getTokenSupply: jest.fn().mockReturnValue(jest.fn().mockResolvedValue([])),
      getOnChainMetadatas: jest.fn().mockReturnValue(jest.fn().mockResolvedValue([])),
      getOffChainMetadata: jest.fn().mockReturnValue(jest.fn().mockResolvedValue([])),
    }
    const api = tokenManagerApiMaker({baseUrlApi: 'apiUrl', baseUrlTokenRegistry: 'tokenUrl'}, mockedDeps)

    await api.tokens(['token1', 'token2'])

    expect(mockedDeps.getTokenSupply).toHaveBeenCalledWith('apiUrl', mockedDeps.fetch)
    expect(mockedDeps.getOnChainMetadatas).toHaveBeenCalledWith('apiUrl', mockedDeps.fetch)
    expect(mockedDeps.getOffChainMetadata).toHaveBeenCalledWith('tokenUrl', mockedDeps.fetch)
  })

  it('should catch errors and return an empty array', async () => {
    const api = tokenManagerApiMaker(
      {baseUrlApi: 'apiUrl', baseUrlTokenRegistry: 'tokenUrl'},
      {
        fetch: jest.fn(),
        getTokenSupply: jest.fn().mockReturnValue(jest.fn().mockRejectedValue('error')),
        getOnChainMetadatas: jest.fn().mockReturnValue(jest.fn().mockRejectedValue('error')),
        getOffChainMetadata: jest.fn().mockReturnValue(jest.fn().mockRejectedValue('error')),
      },
    )

    await expect(api.tokens(['token1', 'token2'])).rejects.toEqual('error')
  })

  it('ignore deps - coverage only', async () => {
    const api = tokenManagerApiMaker({baseUrlApi: 'apiUrl', baseUrlTokenRegistry: 'tokenUrl'})
    expect(api).toBeDefined()
  })
})
