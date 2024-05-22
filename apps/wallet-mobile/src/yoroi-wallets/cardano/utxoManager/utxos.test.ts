import {mockRawUtxos} from './raw-utxos.mocks'
import {CollateralConfig} from './types'
import {isAmountInCollateralRange, isPureUtxo, utxosMaker} from './utxos'

describe('UTXO utility functions', () => {
  describe('isPureUtxo', () => {
    it('returns true for pure UTXOs', () => {
      expect(isPureUtxo(mockRawUtxos[0])).toBe(true)
    })

    it('returns false for non-pure UTXOs', () => {
      expect(isPureUtxo(mockRawUtxos[1])).toBe(false)
    })
  })

  describe('isAmountInCollateralRange', () => {
    const config: CollateralConfig = {minLovelace: '100', maxLovelace: '200', maxUTxOs: 5}

    it('returns true if amount is within range', () => {
      expect(isAmountInCollateralRange('150', config)).toBe(true)
    })

    it('returns false if amount is outside range', () => {
      expect(isAmountInCollateralRange('250', config)).toBe(false)
    })
  })

  describe('utxosMaker', () => {
    const config: CollateralConfig = {minLovelace: '50', maxLovelace: '200', maxUTxOs: 5}
    const utils = utxosMaker(mockRawUtxos, config)

    it('findById returns the correct UTXO by id', () => {
      expect(utils.findById('id1#0')).toEqual(mockRawUtxos[0])
    })

    it('exists returns true if UTXO id exists', () => {
      expect(utils.exists('id1#0')).toBe(true)
    })

    it('exists returns false if UTXO id does not exist', () => {
      expect(utils.exists('nonexistentId')).toBe(false)
    })

    it('findCollateralCandidates returns UTXOs that are pure and within the specified range', () => {
      expect(utils.findCollateralCandidates()).toEqual([mockRawUtxos[0], mockRawUtxos[2]])
    })

    it('drawnCollateral returns the id of the first UTXO that is pure and within the specified range', () => {
      expect(utils.drawnCollateral()).toBe('id1#0')
    })
  })
})
