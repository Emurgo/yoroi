// @flow

import {getCardanoDefaultAsset} from '../config/config'
import jestSetup from '../jestSetup'
import {InvalidAssetAmount, parseAmountDecimal} from './parsing'

jestSetup.setup()

describe('parseAdaDecimal', () => {
  // recall: tests run on mainnet (default network)
  const defaultAsset = getCardanoDefaultAsset()

  it('throw exception on amount equal to 0', () => {
    const zeroValues = ['0', '0.0', '0.000000']
    for (const value of zeroValues) {
      expect(() => {
        parseAmountDecimal(value, defaultAsset)
      }).toThrow()
    }
  })

  it('throw exception on ADA amount too big', () => {
    const value = '45 000 000 000 000001'.replace(/ /g, '')
    expect(() => {
      parseAmountDecimal(value, defaultAsset)
    }).toThrow(InvalidAssetAmount)
  })
})
