import {asTokenFingerprint} from './transformers'

describe('asTokenFingerprint', () => {
  it('success', () => {
    const full = asTokenFingerprint({
      policyId: '1f7a58a1aa1e6b047a42109ade331ce26c9c2cce027d043ff264fb1f',
      assetNameHex: '425249434b53',
    })
    expect(full).toBe('asset1kmp6nmdx5ptmjnt30vq2m2606nz35ae4xfx588')
    const unamed = asTokenFingerprint({
      policyId: '1f7a58a1aa1e6b047a42109ade331ce26c9c2cce027d043ff264fb1f',
      assetNameHex: undefined,
    })
    expect(unamed).toBe('asset1ge674djk0wu352lv8mck4tfpuxuul8uu8s775x')
  })
})
