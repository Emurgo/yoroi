import {asFingerprint} from './asFingerprint'

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
