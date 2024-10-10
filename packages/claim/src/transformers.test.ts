import {Api, Claim, Portfolio} from '@yoroi/types'
import {tokenMocks, createTokenManagerMock} from '@yoroi/portfolio'

import {asClaimApiError, asClaimToken} from './transformers'
import {claimFaucetResponses} from './api-faucet.mocks'
import {claimApiMockResponses} from './manager.mocks'
import {cacheRecordMaker} from '@yoroi/common'

const tokenManagerMock = createTokenManagerMock()

describe('asClaimApiError', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should throw specific claim API error when status matches', () => {
    const error: Api.ResponseError = {
      status: Api.HttpStatusCode.BadRequest,
      message: 'Bad Request',
      responseData: {},
    }

    expect(() => asClaimApiError(error)).toThrow(
      Claim.Api.Errors.InvalidRequest,
    )
  })

  it('should throw generic API error when status does not match', () => {
    const error: Api.ResponseError = {
      status: Api.HttpStatusCode.Forbidden,
      message: 'Forbidden',
      responseData: {},
    }

    expect(() => asClaimApiError(error)).toThrow(Api.Errors.Forbidden)
  })
})

describe('asClaimToken', () => {
  const primaryTokenInfo: Portfolio.Token.Info = tokenMocks.primaryETH.info

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return a "claimed" status with correct token amounts', async () => {
    const claimResponse = claimFaucetResponses.claimTokens.success.claimed

    tokenManagerMock.sync.mockResolvedValue(
      new Map([
        [
          tokenMocks.nftCryptoKitty.info.id,
          cacheRecordMaker(
            {expires: Date.now() + 3_600_000, hash: 'hash3'},
            tokenMocks.nftCryptoKitty.info,
          ),
        ],
        [
          tokenMocks.rnftWhatever.info.id,
          cacheRecordMaker(
            {expires: Date.now() + 3_600_000, hash: 'hash3'},
            tokenMocks.rnftWhatever.info,
          ),
        ],
      ]),
    )

    const result = await asClaimToken(
      claimResponse,
      primaryTokenInfo,
      tokenManagerMock,
    )

    expect(result).toEqual<Claim.Info>({
      status: 'done',
      amounts: [
        {info: primaryTokenInfo, quantity: BigInt(2000000)},
        {info: tokenMocks.nftCryptoKitty.info, quantity: BigInt(44)},
        {info: tokenMocks.rnftWhatever.info, quantity: BigInt(410)},
      ],
      txHash: 'tx_hash',
    })
  })

  it('should return a "queued" status with correct token amounts', async () => {
    const claimResponse = claimFaucetResponses.claimTokens.success.queued

    tokenManagerMock.sync.mockResolvedValue(
      new Map([
        [
          tokenMocks.nftCryptoKitty.info.id,
          cacheRecordMaker(
            {expires: Date.now() + 3_600_000, hash: 'hash3'},
            tokenMocks.nftCryptoKitty.info,
          ),
        ],
        [
          tokenMocks.rnftWhatever.info.id,
          cacheRecordMaker(
            {expires: Date.now() + 3_600_000, hash: 'hash3'},
            tokenMocks.rnftWhatever.info,
          ),
        ],
      ]),
    )

    const result = await asClaimToken(
      claimResponse,
      primaryTokenInfo,
      tokenManagerMock,
    )

    expect(result).toEqual(claimApiMockResponses.claimTokens.processing)
  })

  it('should return an "accepted" status with correct token amounts', async () => {
    const claimResponse = claimFaucetResponses.claimTokens.success.accepted

    tokenManagerMock.sync.mockResolvedValue(
      new Map([
        [
          tokenMocks.nftCryptoKitty.info.id,
          cacheRecordMaker(
            {expires: Date.now() + 3_600_000, hash: 'hash3'},
            tokenMocks.nftCryptoKitty.info,
          ),
        ],
        [
          tokenMocks.rnftWhatever.info.id,
          cacheRecordMaker(
            {expires: Date.now() + 3_600_000, hash: 'hash3'},
            tokenMocks.rnftWhatever.info,
          ),
        ],
      ]),
    )

    const result = await asClaimToken(
      claimResponse,
      primaryTokenInfo,
      tokenManagerMock,
    )

    expect(result).toEqual(claimApiMockResponses.claimTokens.accepted)
  })

  it('should filter out invalid tokens or not requested tokens', async () => {
    const claimResponse = {
      ...claimFaucetResponses.claimTokens.success.accepted,
      lovelaces: null,
      tokens: {
        'invalid.id': null,
        'dead.': null,
        ...claimFaucetResponses.claimTokens.success.accepted.tokens,
      },
    }

    tokenManagerMock.sync.mockResolvedValue(
      new Map([
        [
          tokenMocks.nftCryptoKitty.info.id,
          cacheRecordMaker(
            {expires: Date.now() + 3_600_000, hash: 'hash3'},
            tokenMocks.nftCryptoKitty.info,
          ),
        ],
        [
          tokenMocks.rnftWhatever.info.id,
          cacheRecordMaker(
            {expires: Date.now() + 3_600_000, hash: 'hash3'},
            tokenMocks.rnftWhatever.info,
          ),
        ],
        ['invalid.', undefined] as any,
        ['dead.', {record: tokenMocks.rnftWhatever.info}],
      ]),
    )

    const result = await asClaimToken(
      claimResponse as any,
      primaryTokenInfo,
      tokenManagerMock,
    )

    expect(result).toEqual({
      status: 'accepted',
      amounts: [
        {info: tokenMocks.nftCryptoKitty.info, quantity: BigInt(44)},
        {info: tokenMocks.rnftWhatever.info, quantity: BigInt(410)},
      ],
    })
  })
})
