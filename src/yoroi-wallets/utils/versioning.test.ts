import {Version, versionCompare} from './versioning'

describe('versionCompare: compare valid versions', () => {
  it('should return 1 on A > B', () => {
    expect(versionCompare('1.0.1' as Version, '1.0.0' as Version)).toEqual(1)
    expect(versionCompare('1.0.1' as Version, '0.10.10' as Version)).toBe(1)
    expect(versionCompare('1.0' as Version, '0.1000.1' as Version)).toBe(1)
  })
  it('should return 0 on A == B', () => {
    expect(versionCompare('1.0.1' as Version, '1.0.1' as Version)).toBe(0)
    expect(versionCompare('0' as Version, '0' as Version)).toBe(0)
    expect(versionCompare('0.0.0' as Version, '0' as Version)).toBe(0)
    expect(versionCompare('0.0.1' as Version, '0.0.1' as Version)).toBe(0)
  })

  it('should return -1 on A < B', () => {
    expect(versionCompare('2.200.1' as Version, '2.200.2' as Version)).toBe(-1)
    expect(versionCompare('0' as Version, '0.0.1' as Version)).toBe(-1)
    expect(versionCompare('3.1' as Version, '3.4.0' as Version)).toBe(-1)
    expect(versionCompare('3.3.9' as Version, '3.4' as Version)).toBe(-1)
  })
})
