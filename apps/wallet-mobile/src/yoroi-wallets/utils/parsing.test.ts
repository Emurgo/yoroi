import {utf8ToHex} from '../cardano/api/utils'
import {PRIMARY_TOKEN} from '../cardano/constants/testnet/constants'
import {NETWORKS} from '../cardano/networks'
import {InvalidAssetAmount, isArrayOfType, isNonNullable, isRecord, isString, parseAmountDecimal} from './parsing'

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

describe('isArrayOfType', () => {
  it('returns true if array is empty', () => {
    expect(isArrayOfType([], isString)).toEqual(true)
  })

  it('returns true if array contains only elements of given type', () => {
    expect(isArrayOfType(['a', 'b', 'c'], isString)).toEqual(true)
  })

  it('returns false if array contains elements of different type', () => {
    expect(isArrayOfType(['a', 'b', 1], isString)).toEqual(false)
  })
})

describe('isString', () => {
  it('returns true if string', () => {
    expect(isString('hello')).toEqual(true)
  })

  it('returns false if not string', () => {
    expect(isString(123)).toEqual(false)
    expect(isString({})).toEqual(false)
    expect(isString([])).toEqual(false)
    expect(isString(null)).toEqual(false)
    expect(isString(undefined)).toEqual(false)
    expect(isString(true)).toEqual(false)
  })
})

describe('isRecord', () => {
  it('returns true if is an object', () => {
    expect(isRecord({})).toEqual(true)
  })

  it('returns false if is not an object or its array or its null', () => {
    expect(isRecord([])).toEqual(false)
    expect(isRecord(null)).toEqual(false)
    expect(isRecord(undefined)).toEqual(false)
    expect(isRecord(123)).toEqual(false)
    expect(isRecord('hello')).toEqual(false)
    expect(isRecord(true)).toEqual(false)
  })
})

describe('isNonNullable', () => {
  it('returns true if value is not null nor undefined', () => {
    expect(isNonNullable(1)).toEqual(true)
    expect(isNonNullable('hello')).toEqual(true)
    expect(isNonNullable({})).toEqual(true)
    expect(isNonNullable([])).toEqual(true)
    expect(isNonNullable(false)).toEqual(true)
    expect(isNonNullable(true)).toEqual(true)
    expect(isNonNullable(0)).toEqual(true)
    expect(isNonNullable('')).toEqual(true)
  })

  it('returns false if null or undefined', () => {
    expect(isNonNullable(null)).toEqual(false)
    expect(isNonNullable(undefined)).toEqual(false)
  })
})
