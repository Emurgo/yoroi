import {utf8ToHex} from '../cardano/api/utils'
import {PRIMARY_TOKEN} from '../cardano/constants/testnet/constants'
import {NETWORKS} from '../cardano/networks'
import {InvalidAssetAmount, parseAmountDecimal} from './parsing'

describe('parseAdaDecimal', () => {
  // recall: tests run on mainnet (default network)
  const defaultAsset = PRIMARY_TOKEN

  it('throw exception on amount equal to 0', () => {
    const zeroValues = ['0', '0.0', '0.000000']
    for (const value of zeroValues) {
      expect(() => {
        parseAmountDecimal(value, defaultAsset)
      }).toThrow()
    }
  })

  it('throw exception on ADA amount less than MINIMUM_UTXO_VAL', () => {
    const minUtxoVal = parseInt(NETWORKS.HASKELL_SHELLEY.MINIMUM_UTXO_VAL, 10)
    const numberOfDecimals = defaultAsset.metadata.numberOfDecimals
    const values = ['0.1', `${minUtxoVal / numberOfDecimals - 0.1}`, `${minUtxoVal / numberOfDecimals - 0.000001}`]
    for (const value of values) {
      expect(() => {
        parseAmountDecimal(value, defaultAsset)
      }).toThrow(InvalidAssetAmount)
    }
  })
})

describe('asciiToHex', () => {
  it('converts "hello" to hex', () => {
    const ascii = 'hello'
    const hex = utf8ToHex(ascii)
    expect(hex).toEqual('68656c6c6f')
  })

  it('converts empty string to empty string', () => {
    const ascii = ''
    const hex = utf8ToHex(ascii)
    expect(hex).toEqual('')
  })
})
