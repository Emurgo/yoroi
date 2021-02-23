// @flow
import jestSetup from '../jestSetup'

import {parseAmountDecimal, InvalidAssetAmount} from './parsing'
import {CONFIG, getCardanoDefaultAsset} from '../config/config'

jestSetup.setup()

describe('parseAdaDecimal', () => {
  it('throw exception on amount equal to 0', () => {
    const zeroValues = ['0', '0.0', '0.000000']
    for (const value of zeroValues) {
      expect(() => {
        parseAmountDecimal(value)
      }).toThrow()
    }
  })

  it('throw exception on ADA amount less than MINIMUM_UTXO_VAL', () => {
    const minUtxoVal = parseInt(
      CONFIG.NETWORKS.HASKELL_SHELLEY.MINIMUM_UTXO_VAL,
      10,
    )
    const numberOfDecimals = getCardanoDefaultAsset().metadata.numberOfDecimals
    const values = [
      '0.1',
      `${minUtxoVal / numberOfDecimals - 0.1}`,
      `${minUtxoVal / numberOfDecimals - 0.000001}`,
    ]
    for (const value of values) {
      expect(() => {
        parseAmountDecimal(value)
      }).toThrow(InvalidAssetAmount)
    }
  })

  it('throw exception on ADA amount too big', () => {
    const value = '45 000 000 000 000001'.replace(/ /g, '')
    expect(() => {
      parseAmountDecimal(value)
    }).toThrow(InvalidAssetAmount)
  })
})
