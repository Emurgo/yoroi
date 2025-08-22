import {isDomain} from './isDomain'

describe('isDomain', () => {
  it.each`
    resolve               | expected
    ${'$handle'}          | ${true}
    ${'domain.ada'}       | ${true}
    ${'not$handle'}       | ${false}
    ${'whatever-domains'} | ${false}
  `('should return $expected for $resolve', ({resolve, expected}) => {
    expect(isDomain(resolve)).toBe(expected)
  })
})
