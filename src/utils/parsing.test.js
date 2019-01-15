// @flow
import jestSetup from '../jestSetup'

import {parseAdaDecimal, InvalidAdaAmount} from './parsing'

jestSetup.setup()

describe('parseAdaDecimal', () => {
    it('throw exception on amount equal to 0', () => {
        const zero_values = ['0', '0.0', '0.000000']
        for (var value of zero_values) {
            expect(() => {
                parseAdaDecimal(value)
            }).toThrow(InvalidAdaAmount)
        }
    })
})