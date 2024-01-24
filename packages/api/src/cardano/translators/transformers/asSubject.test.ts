import {asSubject} from './asSubject'

describe('asSubject', () => {
  it('should return concatenated string for a valid tokenId', () => {
    const tokenId =
      '1f7a58a1aa1e6b047a42109ade331ce26c9c2cce027d043ff264fb1f.425249434b53'
    const result = asSubject(tokenId)
    expect(result).toBe(
      '1f7a58a1aa1e6b047a42109ade331ce26c9c2cce027d043ff264fb1f425249434b53',
    )
  })

  it('should return the same string if there is no dot in tokenId', () => {
    const tokenId = '1f7a58a1aa1e6b047a42109ade331ce26c9c2cce027d043ff264fb1f'
    const result = asSubject(tokenId)
    expect(result).toBe(
      '1f7a58a1aa1e6b047a42109ade331ce26c9c2cce027d043ff264fb1f',
    )
  })
})
