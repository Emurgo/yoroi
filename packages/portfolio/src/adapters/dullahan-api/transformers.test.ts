import {
  toDullahanRequest,
  toSecondaryTokenInfo,
  toSecondaryTokenInfos,
} from './transformers'
import {Portfolio, Api} from '@yoroi/types'

import {tokenMocks} from '../token.mocks'

describe('transformers', () => {
  describe('toSecondaryTokenInfo', () => {
    it('should set the nature to Secondary', () => {
      const tokenInfo: Omit<Portfolio.Token.Info, 'nature'> = {
        ...tokenMocks.primaryETH.info,
      }

      const result = toSecondaryTokenInfo(tokenInfo)

      expect(result.nature).toBe(Portfolio.Token.Nature.Secondary)
    })
  })

  describe('toSecondaryTokenInfos', () => {
    it('should return an empty object if apiTokenInfosResponse is empty', () => {
      const apiTokenInfosResponse: Portfolio.Api.TokenInfosResponse = {}

      const result = toSecondaryTokenInfos(apiTokenInfosResponse)

      expect(result).toEqual({})
    })

    it('should throw an error if unable to parse the token-info response', () => {
      const apiTokenInfosResponse: Portfolio.Api.TokenInfosResponse = {
        [tokenMocks.primaryETH.info.id]: [
          2000 as any,
          tokenMocks.primaryETH.info,
          'etag',
          0,
        ],
      }

      expect(() => {
        toSecondaryTokenInfos(apiTokenInfosResponse)
      }).toThrow(Api.Errors.ResponseMalformed)
    })

    it('should return the updated token info if the status code is not HttpStatusCode.NotModified', () => {
      const apiTokenInfosResponse: Portfolio.Api.TokenInfosResponse = {
        [tokenMocks.primaryETH.info.id]: [
          Api.HttpStatusCode.NotModified,
          123456,
        ],
      }

      const result = toSecondaryTokenInfos(apiTokenInfosResponse)

      expect(result).toEqual(apiTokenInfosResponse)
    })

    it('should return the original token info if the status code is HttpStatusCode.NotModified', () => {
      const apiTokenInfosResponse: Portfolio.Api.TokenInfosResponse = {
        [tokenMocks.rnftWhatever.info.id]: [
          Api.HttpStatusCode.NotModified,
          123456,
        ],
        [tokenMocks.nftCryptoKitty.info.id]: [
          Api.HttpStatusCode.Ok,
          tokenMocks.nftCryptoKitty.info,
          'etag',
          0,
        ],
      }

      const result = toSecondaryTokenInfos(apiTokenInfosResponse)

      expect(result).toEqual({
        [tokenMocks.rnftWhatever.info.id]: [
          Api.HttpStatusCode.NotModified,
          123456,
        ],
        [tokenMocks.nftCryptoKitty.info.id]: [
          200,
          toSecondaryTokenInfo(tokenMocks.nftCryptoKitty.info),
          'etag',
          0,
        ],
      })
    })
  })
})

describe('toDullahanRequest', () => {
  it('success', () => {
    const request: ReadonlyArray<Api.RequestWithCache<Portfolio.Token.Id>> = [
      ['token.1', 'hash1'],
      ['token.2', 'hash2'],
      ['token.3', 'hash3'],
    ]

    const result = toDullahanRequest(request)

    expect(result).toEqual(['token.1:hash1', 'token.2:hash2', 'token.3:hash3'])
  })
})
