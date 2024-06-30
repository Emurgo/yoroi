import {Api} from '@yoroi/types'
import {Catalyst} from '../../types'
import {catalystGetFundInfo} from './api'
import {mockCatalystApiFundInfo} from './fund-info.mocks'
import {toFundInfo} from '../transformers'
import {catalystConfig} from '../config'

describe('catalystGetFundInfo', () => {
  it('should fetch the fund info', async () => {
    const mockRequest = jest.fn().mockResolvedValue({
      tag: 'right',
      value: {
        status: 200,
        data: mockCatalystApiFundInfo,
      },
    })

    const getFundInfo = catalystGetFundInfo({request: mockRequest})
    const result = await getFundInfo()

    expect(mockRequest).toHaveBeenCalledTimes(1)
    expect(mockRequest).toHaveBeenCalledWith(
      {
        url: catalystConfig.api.fund,
      },
      undefined,
    )
    expect(result).toEqual<Api.Response<Catalyst.FundInfo>>({
      tag: 'right',
      value: {
        status: 200,
        data: toFundInfo(mockCatalystApiFundInfo),
      },
    })
  })

  it('should return an error if the fund info transformation fails', async () => {
    const invalidFundInfo = {...mockCatalystApiFundInfo, fund_name: 12}
    const mockRequest = jest.fn().mockResolvedValue({
      tag: 'right',
      value: {
        status: 200,
        data: invalidFundInfo,
      },
    })

    const getFundInfo = catalystGetFundInfo({request: mockRequest})
    const result = await getFundInfo()

    expect(mockRequest).toHaveBeenCalledTimes(1)
    expect(mockRequest).toHaveBeenCalledWith(
      {
        url: catalystConfig.api.fund,
      },
      undefined,
    )
    expect(result).toEqual({
      tag: 'left',
      error: {
        status: -3,
        message: 'Failed to transform fund info response',
        responseData: invalidFundInfo,
      },
    })
  })

  it('should return an error if api fails', async () => {
    const mockRequest = jest.fn().mockResolvedValue({
      tag: 'left',
      error: {
        status: 404,
        message: 'Not found',
        responseData: null,
      },
    })

    const getFundInfo = catalystGetFundInfo({request: mockRequest})
    const result = await getFundInfo({decompress: true})

    expect(mockRequest).toHaveBeenCalledTimes(1)
    expect(mockRequest).toHaveBeenCalledWith(
      {
        url: catalystConfig.api.fund,
      },
      {decompress: true},
    )
    expect(result).toEqual({
      tag: 'left',
      error: {
        status: 404,
        message: 'Not found',
        responseData: null,
      },
    })
  })
})
