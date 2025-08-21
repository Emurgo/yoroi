import {getFrontendFees, isFrontendFeesResponse} from './frontend-fees'
import {mockGetFrontendFees as mocks} from './frontend-fees.mocks'

describe('isFrontendFeesResponse', () => {
  it.each`
    desc                           | data                           | expected
    ${'no fees and no aggregator'} | ${mocks.noFeesAndNoAggregator} | ${true}
    ${'with fess'}                 | ${mocks.withFees}              | ${true}
    ${'with unknown aggregator'}   | ${mocks.withUnknownAggregator} | ${false}
    ${'empty'}                     | ${mocks.empty}                 | ${true}
    ${'with malformat response'}   | ${mocks.withdMalformatdData}   | ${false}
  `(`should be $expected when $desc`, ({data, expected}) => {
    expect(isFrontendFeesResponse(data)).toEqual(expected)
  })
})

describe('getFrontendFees', () => {
  it('success', async () => {
    const fetch = jest.fn().mockResolvedValue(mocks.withFees)
    const ffeeTiers = getFrontendFees('https://localhost', fetch)
    const result = await ffeeTiers()
    expect(result).toEqual(mocks.withFees)
  })

  it('throws if response is not valid', async () => {
    const fetch = jest.fn().mockResolvedValue(mocks.withdMalformatdData)
    const ffeeTiers = getFrontendFees('https://localhost', fetch)
    await expect(ffeeTiers()).rejects.toThrow('Invalid frontend fee response')
  })

  it('throws any other error', async () => {
    const networkError = {error: 'network'}
    const fetch = jest.fn().mockRejectedValue(networkError)
    const ffeeTiers = getFrontendFees('https://localhost', fetch)
    await expect(ffeeTiers()).rejects.toEqual(networkError)
  })

  it('no deps for coverage', () => {
    const ffeeTiers = getFrontendFees('https://localhost')
    expect(ffeeTiers).toBeDefined()
  })
})
