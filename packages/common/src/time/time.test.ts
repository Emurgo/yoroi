import {time} from './time'

describe('time constants', () => {
  it.each`
    constant            | value
    ${time.oneSecond}   | ${1000}
    ${time.oneMinute}   | ${60000}
    ${time.fiveMinutes} | ${300000}
    ${time.halfHour}    | ${1800000}
    ${time.oneHour}     | ${3600000}
    ${time.oneDay}      | ${86400000}
    ${time.oneWeek}     | ${604800000}
    ${time.oneMonth}    | ${2592000000}
    ${time.sixMonths}   | ${15768000000}
    ${time.oneYear}     | ${31536000000}
  `('should have correct value for $constant', ({constant, value}) => {
    expect(constant).toBe(value)
  })
})

describe('time helpers', () => {
  it.each`
    helper          | input | expected
    ${time.seconds} | ${10} | ${10000}
    ${time.minutes} | ${10} | ${600000}
    ${time.hours}   | ${10} | ${36000000}
    ${time.days}    | ${10} | ${864000000}
    ${time.weeks}   | ${10} | ${6048000000}
    ${time.months}  | ${10} | ${25920000000}
    ${time.years}   | ${10} | ${315360000000}
  `(
    'should return correct value for $helper with input $input',
    ({helper, input, expected}) => {
      expect(helper(input)).toBe(expected)
    },
  )
})

describe('time session', () => {
  it('should have correct value for session', () => {
    expect(time.session).toBe(Infinity)
  })
})
