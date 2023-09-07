import {asFingerprint, asSubject, getTokenIdentity} from './cardano-token-id'

describe('asFingerprint function', () => {
  it('should return a valid fingerprint', () => {
    const tokenId =
      '1f7a58a1aa1e6b047a42109ade331ce26c9c2cce027d043ff264fb1f.425249434b53'
    const fingerprint = asFingerprint(tokenId)
    expect(fingerprint).toBe('asset1kmp6nmdx5ptmjnt30vq2m2606nz35ae4xfx588')
  })

  it('should throw an error for invalid policyId length', () => {
    const tokenId = 'invalidPolicyLength.3030'
    expect(() => asFingerprint(tokenId)).toThrowError('Invalid policyId')
  })

  it('should throw an error for missing policyId', () => {
    let tokenId = '.3030'
    expect(() => asFingerprint(tokenId)).toThrowError('Invalid policyId')
    tokenId = '.'
    expect(() => asFingerprint(tokenId)).toThrowError('Invalid policyId')
    tokenId = ''
    expect(() => asFingerprint(tokenId)).toThrowError('Invalid policyId')
  })

  it('should handle missing assetNameHex gracefully', () => {
    const tokenId = 'e68f1cea19752d1292b4be71b7f5d2b3219a15859c028f7454f66cdf.'
    const fingerprint = asFingerprint(tokenId)
    expect(fingerprint).toBe('asset18yypccxey83hzgfk5n0phpwseatsvteyvp78h2')
  })

  it('should handle missing separator gracefully', () => {
    const tokenId = 'e68f1cea19752d1292b4be71b7f5d2b3219a15859c028f7454f66cdf'
    const fingerprint = asFingerprint(tokenId)
    expect(fingerprint).toBe('asset18yypccxey83hzgfk5n0phpwseatsvteyvp78h2')
  })
})

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
