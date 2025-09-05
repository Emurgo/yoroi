import {isFileKey} from './is-file-key'

describe('isFileKey', () => {
  it('returns true for a key under the path', () => {
    expect(isFileKey({key: 'path/to/key', path: 'path/to/'})).toBeTruthy()
  })

  it('returns false for a key under another path', () => {
    expect(isFileKey({key: 'path/another/key', path: 'path/to/'})).toBeFalsy()
  })

  it('handles no trailing slash in path', () => {
    expect(isFileKey({key: 'path/to/file', path: 'path/to'})).toBeFalsy()
  })

  it('returns true when providing the key without path', () => {
    expect(isFileKey({key: 'file', path: 'path/to/'})).toBeTruthy()
  })

  it('returns true when empty key and path', () => {
    expect(isFileKey({key: '', path: ''})).toBeTruthy()
  })
})
