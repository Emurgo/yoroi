import {CONFIG, getCardanoDefaultAsset} from '../../legacy/config'
import {InvalidAssetAmount, parseAmountDecimal} from './parsing'

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

  it('throw exception on ADA amount less than MINIMUM_UTXO_VAL', () => {
    const minUtxoVal = parseInt(CONFIG.NETWORKS.HASKELL_SHELLEY.MINIMUM_UTXO_VAL, 10)
    const numberOfDecimals = defaultAsset.metadata.numberOfDecimals
    const values = ['0.1', `${minUtxoVal / numberOfDecimals - 0.1}`, `${minUtxoVal / numberOfDecimals - 0.000001}`]
    for (const value of values) {
      expect(() => {
        parseAmountDecimal(value, defaultAsset)
      }).toThrow(InvalidAssetAmount)
    }
  })

  it('throw exception on ADA amount too big', () => {
    const value = '45 000 000 000 000001'.replace(/ /g, '')
    expect(() => {
      parseAmountDecimal(value, defaultAsset)
    }).toThrow(InvalidAssetAmount)
  })
})
