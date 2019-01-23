// @flow
import jestSetup from '../jestSetup'

import {parseAdaDecimal} from './parsing'

jestSetup.setup()

describe('parseAdaDecimal', () => {
  it('throw exception on amount equal to 0', () => {
    const zeroValues = ['0', '0.0', '0.000000']
    for (const value of zeroValues) {
      expect(() => {
        parseAdaDecimal(value)
      }).toThrow()
    }
  })
})
