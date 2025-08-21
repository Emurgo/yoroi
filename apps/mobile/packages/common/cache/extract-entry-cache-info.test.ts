import {extractEntryCacheInfo} from './extract-entry-cache-info'

describe('extractEntryCacheInfo', () => {
  it('should return cache info when record is not null', () => {
    const key = 'exampleKey'
    const record = {
      expires: 123456789,
      hash: 'exampleHash',
    }

    const result = extractEntryCacheInfo([key, record])

    expect(result).toEqual([key, {expires: record.expires, hash: record.hash}])
  })

  it('should return null when record is null', () => {
    const key = 'exampleKey'
    const record = null

    const result = extractEntryCacheInfo([key, record])

    expect(result).toEqual([key, null])
  })
})
