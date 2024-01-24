import {getTokenIdentity} from './getTokenIdentity'

describe('getTokenIdentity', () => {
  it('should return a valid object for a valid tokenId', () => {
    const tokenId =
      '1f7a58a1aa1e6b047a42109ade331ce26c9c2cce027d043ff264fb1f.425249434b53'
    const result = getTokenIdentity(tokenId)
    expect(result).toEqual({
      policyId: '1f7a58a1aa1e6b047a42109ade331ce26c9c2cce027d043ff264fb1f',
      assetName: '425249434b53',
      name: 'BRICKS',
    })
  })

  it('should throw an error for an invalid policyId', () => {
    const tokenId = 'invalidPolicy.assetName'
    expect(() => getTokenIdentity(tokenId)).toThrow('Invalid policyId')
  })

  it('should handle tokenIds without an assetName', () => {
    const tokenIdWithPeriod =
      '1f7a58a1aa1e6b047a42109ade331ce26c9c2cce027d043ff264fb2f.'
    const tokenIdNoPeriod =
      '1f7a58a1aa1e6b047a42109ade331ce26c9c2cce027d043ff264fb1f'
    const resultWithPeriod = getTokenIdentity(tokenIdWithPeriod)
    const resultNoPeriod = getTokenIdentity(tokenIdNoPeriod)
    expect(resultWithPeriod).toEqual({
      policyId: '1f7a58a1aa1e6b047a42109ade331ce26c9c2cce027d043ff264fb2f',
      assetName: '',
      name: '',
    })
    expect(resultNoPeriod).toEqual({
      policyId: '1f7a58a1aa1e6b047a42109ade331ce26c9c2cce027d043ff264fb1f',
      assetName: '',
      name: '',
    })
  })
})
