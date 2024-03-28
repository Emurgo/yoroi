import {getSwapConfigWrapper, isSwapConfigResponse} from './swap-config'
import {mockGetSwapConfig as mocks} from './swap-config.mocks'

describe('isSwapConfigResponse', () => {
  it.each`
    desc           | data              | expected
    ${'with fess'} | ${mocks.withFees} | ${true}
    ${'empty'}     | ${mocks.empty}    | ${true}
  `(`should be $expected when $desc`, ({data, expected}) => {
    expect(isSwapConfigResponse(data)).toEqual(expected)
  })
})

describe('getSwapConfig', () => {
  it('success', async () => {
    const fetch = jest.fn().mockResolvedValue(mocks.withFees)
    const getSwapConfig = getSwapConfigWrapper('https://localhost', fetch)
    const result = await getSwapConfig()
    expect(result).toEqual(mocks.withFees)
  })

  it('throws if response is not valid', async () => {
    const fetch = jest.fn().mockResolvedValue({x: 1})
    const getSwapConfig = getSwapConfigWrapper('https://localhost', fetch)
    await expect(getSwapConfig()).rejects.toThrow(
      'Invalid swap config response',
    )
  })

  it('throws any other error', async () => {
    const networkError = {error: 'network'}
    const fetch = jest.fn().mockRejectedValue(networkError)
    const getSwapConfig = getSwapConfigWrapper('https://localhost', fetch)
    await expect(getSwapConfig()).rejects.toEqual(networkError)
  })

  it('no deps for coverage', () => {
    const getSwapConfig = getSwapConfigWrapper('https://localhost')
    expect(getSwapConfig).toBeDefined()
  })
})
