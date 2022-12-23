import {CONFIG, getCardanoDefaultAsset} from '../../legacy/config'
import {asciiToHex, InvalidAssetAmount, parseAmountDecimal} from './parsing'
import {parseModerationStatus} from './parsing'

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
})

describe('asciiToHex', () => {
  it('converts "hello" to hex', () => {
    const ascii = 'hello'
    const hex = asciiToHex(ascii)
    expect(hex).toEqual('68656c6c6f')
  })

  it('converts empty string to empty string', () => {
    const ascii = ''
    const hex = asciiToHex(ascii)
    expect(hex).toEqual('')
  })
})

describe('parseModerationStatus', () => {
  it('should return status on valid NFT Moderation status', () => {
    expect(parseModerationStatus('PENDING')).toBe('pending')
    expect(parseModerationStatus('GREEN')).toBe('green')
    expect(parseModerationStatus('RED')).toBe('red')
    expect(parseModerationStatus('MANUAL_REVIEW')).toBe('manual_review')
    expect(parseModerationStatus('YELLOW')).toBe('yellow')
  })

  it('returns undefined on invalid NFT Moderation status', () => {
    expect(parseModerationStatus('invalid')).toBe(undefined)
  })

  it('returns undefined when given invalid types', () => {
    expect(parseModerationStatus(null)).toBe(undefined)
    expect(parseModerationStatus(undefined)).toBe(undefined)
    expect(parseModerationStatus(1)).toBe(undefined)
    expect(parseModerationStatus('')).toBe(undefined)
    expect(parseModerationStatus({})).toBe(undefined)
    expect(parseModerationStatus([])).toBe(undefined)
  })
})
