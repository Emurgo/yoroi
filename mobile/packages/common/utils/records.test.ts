import {
  intoRecord,
  keyIntoRecord,
  mergeRecords,
  tuplesIntoRecord,
  valueIntoRecord,
} from './records'

describe('records utilities', () => {
  describe('tuplesIntoRecord', () => {
    it('should convert tuples array to record', () => {
      const tuples: Array<['a' | 'b', number]> = [
        ['a', 1],
        ['b', 2],
      ]
      const result = tuplesIntoRecord(tuples)
      expect(result).toEqual({a: 1, b: 2})
    })

    it('should handle empty array', () => {
      const result = tuplesIntoRecord([])
      expect(result).toEqual({})
    })

    it('should handle duplicate keys', () => {
      const tuples: Array<['a', number]> = [
        ['a', 1],
        ['a', 2],
      ]
      const result = tuplesIntoRecord(tuples)
      expect(result).toEqual({a: 2}) // Last value wins
    })
  })

  describe('mergeRecords', () => {
    it('should merge multiple records', () => {
      const records: Array<Record<string, number>> = [{a: 1}, {b: 2}, {c: 3}]
      const result = mergeRecords(records)
      expect(result).toEqual({a: 1, b: 2, c: 3})
    })

    it('should handle empty array', () => {
      const result = mergeRecords([])
      expect(result).toEqual({})
    })

    it('should override values with later records', () => {
      const records = [{a: 1}, {a: 2}, {a: 3}]
      const result = mergeRecords(records)
      expect(result).toEqual({a: 3})
    })
  })

  describe('intoRecord', () => {
    it('should map items to record using key and value mappers', () => {
      const items = ['a', 'b', 'c']
      const result = intoRecord(
        items,
        (_item, index) => `key${index}`,
        (item) => item.toUpperCase(),
      )
      expect(result).toEqual({key0: 'A', key1: 'B', key2: 'C'})
    })

    it('should handle empty array', () => {
      const result = intoRecord(
        [],
        (_x, _index) => 'key',
        (_x, _index) => 'value',
      )
      expect(result).toEqual({})
    })
  })

  describe('keyIntoRecord', () => {
    it('should create record using key mapper', () => {
      const values = ['a', 'b', 'c']
      const result = keyIntoRecord(values, (_item, index) => `key${index}`)
      expect(result).toEqual({key0: 'a', key1: 'b', key2: 'c'})
    })

    it('should handle empty array', () => {
      const result = keyIntoRecord([], (_x, _index) => 'key')
      expect(result).toEqual({})
    })
  })

  describe('valueIntoRecord', () => {
    it('should create record using value mapper', () => {
      const keys = ['a', 'b', 'c']
      const result = valueIntoRecord(keys, (_key, index) => `value${index}`)
      expect(result).toEqual({a: 'value0', b: 'value1', c: 'value2'})
    })

    it('should handle empty array', () => {
      const result = valueIntoRecord([], (_key, _index) => 'value')
      expect(result).toEqual({})
    })
  })
})
