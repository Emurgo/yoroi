import {
  toDullahanRequest,
  toProcessedMediaRequest,
  toSecondaryTokenInfos,
  toTokenActivity,
  toTokenHistory,
} from './transformers'
import {Portfolio, Api} from '@yoroi/types'

import {tokenMocks} from '../token.mocks'
import {
  DullahanApiTokenActivityResponse,
  DullahanApiTokenHistoryResponse,
} from './types'
import {tokenActivityMocks} from '../token-activity.mocks'
import {duallahanTokenActivityMocks} from './token-activity.mocks'
import {tokenHistoryMocks} from '../token-history.mocks'

describe('transformers', () => {
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
          tokenMocks.nftCryptoKitty.info,
          'etag',
          0,
        ],
      })
    })

    it('should return drop the record when the status code is HttpStatusCode.InternalServerError', () => {
      const apiTokenInfosResponse: Portfolio.Api.TokenInfosResponse = {
        [tokenMocks.rnftWhatever.info.id]: [
          Api.HttpStatusCode.InternalServerError,
          'Not found',
          3600,
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
        [tokenMocks.nftCryptoKitty.info.id]: [
          200,
          tokenMocks.nftCryptoKitty.info,
          'etag',
          0,
        ],
      })
    })
  })

  describe('toTokenActivity', () => {
    it('should return an empty object if apiTokenActivity response is empty', () => {
      const apiTokenInfosResponse: DullahanApiTokenActivityResponse = {}

      expect(toTokenActivity(apiTokenInfosResponse)).toEqual({})
    })

    it('should return the data and deal with empty records', () => {
      const responseWithEmptyRecords = {
        ...duallahanTokenActivityMocks.api.responseSuccessDataOnly,
        'token.4': undefined,
        'token.5': [Api.HttpStatusCode.InternalServerError, 'Not found'],
      } as any
      const result = toTokenActivity(responseWithEmptyRecords)

      expect(result).toEqual(tokenActivityMocks.api.responseDataOnly)
    })
  })

  describe('toTokenHistory', () => {
    it('should return undefined if apiTokenHistory response is malformed', () => {
      expect(
        toTokenHistory({
          whatever: false,
        } as unknown as DullahanApiTokenHistoryResponse),
      ).toEqual(undefined)
    })

    it('should return the data', () => {
      const result = toTokenHistory(
        tokenHistoryMocks.ftNamelessRaw as unknown as DullahanApiTokenHistoryResponse,
      )

      expect(result).toEqual(tokenHistoryMocks.api.responseDataOnly)
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

describe('toProcessedMediaRequest', () => {
  it('success', () => {
    const request: Portfolio.Token.Id = 'token.1'

    const result = toProcessedMediaRequest(request)

    expect(result).toEqual({policy: 'token', name: '1'})
  })
})
