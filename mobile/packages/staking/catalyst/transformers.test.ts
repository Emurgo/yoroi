import {mockCatalystApiFundInfo} from './adapters/fund-info.mocks'
import {mockFundInfo} from './fund-info.mocks'
import {toFundInfo} from './transformers'

describe('toFundInfo', () => {
  it('should convert CatalystApiFundInfo to FundInfo', () => {
    const result = toFundInfo(mockCatalystApiFundInfo)
    expect(result).toEqual(mockFundInfo)
  })
})
