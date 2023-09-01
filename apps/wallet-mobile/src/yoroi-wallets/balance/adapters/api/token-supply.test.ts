import {getTokenSupply, isTokenSupplyResponse} from './token-supply'

describe('isTokenSupplyResponse', () => {
  it('returns true if object has supplies key of type object', () => {
    expect(isTokenSupplyResponse({supplies: {}})).toEqual(true)
    expect(isTokenSupplyResponse({supplies: 1})).toEqual(false)
    expect(isTokenSupplyResponse({supplies: []})).toEqual(false)
    expect(isTokenSupplyResponse({supplies: null})).toEqual(false)
    expect(isTokenSupplyResponse({supplies: undefined})).toEqual(false)
    expect(isTokenSupplyResponse({supplies: true})).toEqual(false)
  })

  it('returns false if not given object with supplies key', () => {
    expect(isTokenSupplyResponse(null)).toEqual(false)
    expect(isTokenSupplyResponse(1)).toEqual(false)
    expect(isTokenSupplyResponse([])).toEqual(false)
    expect(isTokenSupplyResponse(true)).toEqual(false)
    expect(isTokenSupplyResponse('hello')).toEqual(false)
    expect(isTokenSupplyResponse(undefined)).toEqual(false)
    expect(isTokenSupplyResponse({})).toEqual(false)
  })

  it('requires supply value to be a number or null', () => {
    expect(isTokenSupplyResponse({supplies: {a: 1}})).toEqual(true)
    expect(isTokenSupplyResponse({supplies: {a: null}})).toEqual(true)
    expect(isTokenSupplyResponse({supplies: {a: '1'}})).toEqual(false)
    expect(isTokenSupplyResponse({supplies: {a: true}})).toEqual(false)
  })
})

describe('getTokenSupply', () => {
  it('returns token supplies', async () => {
    const fetch = jest.fn().mockResolvedValue({
      supplies: {
        'a.0': 1,
        'c.1': null,
      },
    })
    const tokenSupply = getTokenSupply('https://localhost', fetch)
    const result = await tokenSupply(['a.30', 'c.31'])
    expect(result).toEqual({
      'a.30': 1,
      'c.31': null,
    })
  })

  it('returns token empty if empty list requested', async () => {
    const fetch = jest.fn().mockResolvedValue({
      supplies: {},
    })
    const tokenSupply = getTokenSupply('https://localhost', fetch)
    const result = await tokenSupply([])
    expect(result).toEqual({})
  })

  it('throws if response is not valid', async () => {
    const fetch = jest.fn().mockResolvedValue({
      error: {
        'a.b': 1,
        'c.d': null,
      },
    })
    const tokenSupply = getTokenSupply('https://localhost', fetch)
    await expect(tokenSupply(['a.b', 'c.d'])).rejects.toThrow('Invalid asset supplies')
  })

  it('throws any other error', async () => {
    const networkError = {error: 'network'}
    const fetch = jest.fn().mockRejectedValue(networkError)
    const tokenSupply = getTokenSupply('https://localhost', fetch)
    await expect(tokenSupply(['a.b', 'c.d'])).rejects.toEqual(networkError)
  })

  it('no deps for coverage', () => {
    const tokenSupply = getTokenSupply('https://localhost')
    expect(tokenSupply).toBeDefined()
  })
})
