import {createCachedUnknownTokenInfo} from './create-cached-unknown-token-info'
import {createUnknownTokenInfo} from './create-unknown-token-info'

describe('createCachedUnknownTokenInfo', () => {
  it('should create a cached unknown token info', () => {
    const id = 'token.id'
    const expectedName = 'Unknown (id)'
    const expectedUnknownTokenInfo = {
      record: createUnknownTokenInfo({id, name: expectedName}),
      expires: 0,
      hash: '',
    }

    const cachedUnknownTokenInfo = createCachedUnknownTokenInfo(id)

    expect(cachedUnknownTokenInfo.expires).toBe(0)
    expect(cachedUnknownTokenInfo.hash).toBe('')
    expect(cachedUnknownTokenInfo).toEqual(expectedUnknownTokenInfo)
  })
})
