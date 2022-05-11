import {diffEntries, negated, sumEntries} from './entries'
import {YoroiEntry} from './types'

describe('entries', () => {
  describe('sumEntries', () => {
    it('should sum entries', () => {
      const entries: Array<YoroiEntry> = [
        {
          a: '0',
          b: '1',
        },
        {
          a: '1',
          c: '2',
        },
        {
          b: '2',
          c: '3',
        },
      ]
      const result = sumEntries(entries)
      expect(result).toEqual({
        a: '1',
        b: '3',
        c: '5',
      })
    })
  })

  describe('diffEntries', () => {
    it('should diff entries', () => {
      const entry1: YoroiEntry = {
        a: '1',
        b: '2',
        c: '3',
      }
      const entry2: YoroiEntry = {
        a: '1',
        b: '1',
        c: '1',
        d: '1',
      }

      const result = diffEntries(entry1, entry2)
      expect(result).toEqual({
        a: '0',
        b: '1',
        c: '2',
        d: '-1',
      })
    })
  })

  describe('negated', () => {
    it('should negate amount', () => {
      const amount = '1'
      const result = negated(amount)
      expect(result).toEqual('-1')
    })
  })
})
