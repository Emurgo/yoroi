import {formatTimeSpan} from './timeUtils'

describe('formatTimeSpan', () => {
  it('should return return empty for negative', () => {
    expect(formatTimeSpan(-3245)).toEqual('')
  })
  it('should return valid', () => {
    expect(formatTimeSpan(1000 * 60)).toBe('00d : 00h : 01m')
    expect(formatTimeSpan(1000 * 60 * 59)).toBe('00d : 00h : 59m')
    expect(formatTimeSpan(1000 * 60 * 60)).toBe('00d : 01h : 00m')
    expect(formatTimeSpan(1000 * 60 * 85)).toBe('00d : 01h : 25m')
    expect(formatTimeSpan(1000 * 60 * 8595)).toBe('05d : 23h : 15m')
  })
})
