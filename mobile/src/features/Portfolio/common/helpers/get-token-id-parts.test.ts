import {getTokenIdParts} from './get-token-id-parts'

describe('getTokenIdParts', () => {
  it('should split the token identifier into policyId and assetName', () => {
    const tokenId = 'policyId.assetName'
    const result = getTokenIdParts(tokenId)
    expect(result).toEqual({policyId: 'policyId', assetName: 'assetName'})
  })
})
