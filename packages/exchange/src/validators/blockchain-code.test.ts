import {Exchange} from '@yoroi/types'
import {isBlockchainCode} from './blockchain-code'

describe('isBlockchainCode', () => {
  it('should return true for valid blockchain codes', () => {
    const validCoinTypes: Exchange.BlockchainCode[] = ['ADA']

    validCoinTypes.forEach((coinType) => {
      expect(isBlockchainCode(coinType)).toBe(true)
    })
  })

  it('should return false for invalid blockchain codes', () => {
    const invalidCoinTypes = ['XRP', 'DOGE', '', undefined, null, 123]

    invalidCoinTypes.forEach((coinType) => {
      expect(isBlockchainCode(coinType)).toBe(false)
    })
  })
})
