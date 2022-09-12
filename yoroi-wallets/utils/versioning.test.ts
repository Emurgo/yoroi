import {versionCompare} from './versioning'

describe('versionCompare: arguments', () => {
  it('should throw with invalid arguments', () => {
    expect(() => versionCompare('1.0', '1.0.0b')).toThrow()
    expect(() => versionCompare('1.0.0.0', '1.0.0')).toThrow()
    expect(() => versionCompare('1..0', '1.0.0')).toThrow()
    expect(() => versionCompare('1.0.0-rc', '1.0.0')).toThrow()
  })
})

describe('versionCompare: compare valid versions', () => {
  it('should return 1 on A > B', () => {
    expect(versionCompare('1.0.1', '1.0.0')).toEqual(1)
    expect(versionCompare('1.0.1', '0.10.10')).toBe(1)
  })
  it('should return 0 on A == B', () => {
    expect(versionCompare('1.0.1', '1.0.1')).toBe(0)
    expect(versionCompare('0', '0')).toBe(0)
    expect(versionCompare('0.0.0', '0')).toBe(0)
    expect(versionCompare('0.0.1', '0.0.1')).toBe(0)
  })

  it('should return -1 on A < B', () => {
    expect(versionCompare('2.200.1', '2.200.2')).toBe(-1)
    expect(versionCompare('0', '0.0.1')).toBe(-1)
    expect(versionCompare('3.1', '3.4.0')).toBe(-1)
    expect(versionCompare('3.3.9', '3.4')).toBe(-1)
  })

  it('should work on truncated versions', () => {
    expect(versionCompare('1.0', '0.1000.1')).toBe(1)
  })
})
