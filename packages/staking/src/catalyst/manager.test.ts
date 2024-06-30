import {catalystManagerMaker} from './manager'
import {describe} from '@jest/globals'
import {mockFundInfo} from './fund-info.mocks'

describe('isRegistrationOpen', () => {
  const api = {
    getFundInfo: jest.fn(),
  }

  const fundoInfoResponse = {
    tag: 'right',
    value: {
      status: 200,
      data: mockFundInfo,
    },
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return the fund info from getFundInfo', async () => {
    api.getFundInfo.mockResolvedValue(fundoInfoResponse)
    const catalyst = catalystManagerMaker({api})

    await expect(catalyst.getFundInfo()).resolves.toEqual(fundoInfoResponse)
  })

  describe('getFundStatus', () => {
    const catalyst = catalystManagerMaker({api})

    it('should return all pending when fund has not started', () => {
      expect(catalyst.fundStatus(mockFundInfo, new Date(0))).toEqual({
        registration: 'pending',
        voting: 'pending',
        results: 'pending',
      })
    })

    it('should return registration running', () => {
      expect(
        catalyst.fundStatus(mockFundInfo, mockFundInfo.snapshotStart),
      ).toEqual({
        registration: 'running',
        voting: 'pending',
        results: 'pending',
      })
    })

    it('should return voting running, registration done', () => {
      expect(
        catalyst.fundStatus(mockFundInfo, mockFundInfo.votingStart),
      ).toEqual({
        registration: 'done',
        voting: 'running',
        results: 'pending',
      })
    })

    it('should return voting done, registration done, results running', () => {
      expect(catalyst.fundStatus(mockFundInfo, mockFundInfo.votingEnd)).toEqual(
        {
          registration: 'done',
          voting: 'done',
          results: 'running',
        },
      )
    })

    it('should return voting done, registration done, results done', () => {
      expect(
        catalyst.fundStatus(mockFundInfo, mockFundInfo.tallyingEnd),
      ).toEqual({
        registration: 'done',
        voting: 'done',
        results: 'done',
      })
    })
  })
})
