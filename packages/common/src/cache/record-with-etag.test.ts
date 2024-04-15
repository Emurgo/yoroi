import {recordWithETag} from './record-with-etag'

describe('recordWithETag', () => {
  it('should return an array with the provided value and etag', () => {
    const value = {data: 'test'}
    const etag = '12345'

    const result = recordWithETag(value, etag)

    expect(result).toEqual([value, etag])
  })

  it('should return an array with the provided value and an empty etag if not provided', () => {
    const value = {data: 'test'}

    const result = recordWithETag(value)

    expect(result).toEqual([value, ''])
  })
})
