import {Balance} from '@yoroi/types'

import {parseNFTs} from './metadata'
const storageUrl = 'https://example.com'
describe('parseNFTs', () => {
  it('throws when given a value that is not an object', () => {
    expect(() => parseNFTs(null, storageUrl)).toThrow()
    expect(() => parseNFTs(1, storageUrl)).toThrow()
    expect(() => parseNFTs([], storageUrl)).toThrow()
    expect(() => parseNFTs(true, storageUrl)).toThrow()
    expect(() => parseNFTs('hello', storageUrl)).toThrow()
    expect(() => parseNFTs(undefined, storageUrl)).toThrow()
  })

  it('returns empty array given an object that does not have an array for a value', () => {
    expect(parseNFTs({policyId: 1}, storageUrl)).toEqual([])
    expect(parseNFTs({policyId: 'world'}, storageUrl)).toEqual([])
    expect(parseNFTs({policyId: null}, storageUrl)).toEqual([])
    expect(parseNFTs({policyId: true}, storageUrl)).toEqual([])
    expect(parseNFTs({policyId: {}}, storageUrl)).toEqual([])
    expect(parseNFTs({policyId: undefined}, storageUrl)).toEqual([])
  })

  it('returns empty array if no assets have key 721', () => {
    expect(parseNFTs({policyId: []}, storageUrl)).toEqual([])
    expect(parseNFTs({policyId: [{}]}, storageUrl)).toEqual([])
    expect(parseNFTs({policyId: [{key: 'hello'}]}, storageUrl)).toEqual([])
    expect(parseNFTs({policyId: [{key: 'hello'}, {key: 'world'}]}, storageUrl)).toEqual([])
  })

  it('resolves with placeholder data if key 721 is present and metadata is not', () => {
    const result = parseNFTs({'8e2c7604711faef7c84c91b286c7327d17df825b7f0c88ec0332c0b4.0': [{key: '721'}]}, storageUrl)
    const expectedValue: Partial<Balance.TokenInfo> = {
      id: '8e2c7604711faef7c84c91b286c7327d17df825b7f0c88ec0332c0b4.30',
      name: '0',
    }
    expect(result[0]).toEqual(expect.objectContaining(expectedValue))
  })

  it('resolves with NFT when key and metadata are present', () => {
    const result = parseNFTs(
      {
        '8e2c7604711faef7c84c91b286c7327d17df825b7f0c88ec0332c0b4.0': [
          {key: '721', metadata: {'8e2c7604711faef7c84c91b286c7327d17df825b7f0c88ec0332c0b4': {0: {name: 'Name'}}}},
        ],
      },
      storageUrl,
    )
    const expectedValue: Partial<Balance.TokenInfo> = {
      id: '8e2c7604711faef7c84c91b286c7327d17df825b7f0c88ec0332c0b4.30',
      name: 'Name',
    }
    expect(result[0]).toEqual(expect.objectContaining(expectedValue))
  })
})
