import {time} from './time'

describe('time', () => {
  it('should have time constants', () => {
    expect(time.oneSecond).toBe(1000)
    expect(time.oneMinute).toBe(60000)
    expect(time.fiveMinutes).toBe(300000)
    expect(time.halfHour).toBe(1800000)
    expect(time.oneHour).toBe(3600000)
    expect(time.oneDay).toBe(86400000)
    expect(time.oneWeek).toBe(604800000)
    expect(time.oneMonth).toBe(2592000000)
    expect(time.sixMonths).toBe(15768000000)
    expect(time.oneYear).toBe(31536000000)
  })

  it('should have helper functions', () => {
    expect(time.seconds(5)).toBe(5000)
    expect(time.minutes(2)).toBe(120000)
    expect(time.hours(3)).toBe(10800000)
    expect(time.days(7)).toBe(604800000)
    expect(time.weeks(2)).toBe(1209600000)
    expect(time.months(6)).toBe(15552000000)
    expect(time.years(1)).toBe(31536000000)
  })

  it('should have session constant', () => {
    expect(time.session).toBe(Infinity)
  })

  it('should be frozen', () => {
    expect(Object.isFrozen(time)).toBe(true)
  })
})
