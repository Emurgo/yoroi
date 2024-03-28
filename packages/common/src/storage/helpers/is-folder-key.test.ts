import {isFolderKey} from './is-folder-key'

describe('isFolderKey', () => {
  it('returns false for a direct file under the path', () => {
    expect(isFolderKey({key: 'path/to/key', path: 'path/to/'})).toBeFalsy()
  })

  it('returns true for a directory under the path', () => {
    expect(
      isFolderKey({key: 'path/to/directory/', path: 'path/to/'}),
    ).toBeTruthy()
  })

  it('returns true for deeper directories', () => {
    expect(
      isFolderKey({key: 'path/to/deeper/dir/', path: 'path/to/'}),
    ).toBeTruthy()
  })

  it('returns false when empty path', () => {
    expect(isFolderKey({key: '', path: ''})).toBeFalsy()
  })

  it('returns false when key is the same as path', () => {
    expect(isFolderKey({key: 'path/to/', path: 'path/to/'})).toBeFalsy()
  })

  it('considers key with path as key, thus false for folder', () => {
    expect(isFolderKey({key: 'path/to/key', path: 'path/to/'})).toBeFalsy()
  })
})
