import BN from 'bignumber.js'

import {numberReplacer} from './number-replacer'

describe('numberReplacer', () => {
  it.each`
    type           | input                           | expected
    ${'BigInt'}    | ${123456789012345678901234567n} | ${'123456789012345678901234567'}
    ${'BigNumber'} | ${BN('12345678901234567890')}   | ${'12345678901234567890'}
    ${'number'}    | ${123}                          | ${123}
    ${'string'}    | ${'test'}                       | ${'test'}
    ${'object'}    | ${{key: 'value'}}               | ${{key: 'value'}}
    ${'boolean'}   | ${true}                         | ${true}
  `('should handle $type correctly', ({input, expected}) => {
    const result = numberReplacer(null, input)
    expect(result).toEqual(expected)
  })
})
