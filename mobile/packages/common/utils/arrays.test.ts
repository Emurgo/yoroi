import {
  chunk,
  difference,
  first,
  flatten,
  groupBy,
  intersection,
  nonNullish,
  removeItemFromArray,
  sliceArrayUntilItem,
} from './arrays'

describe('arrays utilities', () => {
  describe('difference', () => {
    it('should return elements in a but not in b', () => {
      expect(difference([1, 2, 3], [2, 3, 4])).toEqual([1])
    })

    it('should return empty array when all elements are in b', () => {
      expect(difference([1, 2], [1, 2, 3])).toEqual([])
    })

    it('should handle empty arrays', () => {
      expect(difference([], [1, 2])).toEqual([])
      expect(difference([1, 2], [])).toEqual([1, 2])
    })
  })

  describe('intersection', () => {
    it('should return common elements', () => {
      expect(intersection([1, 2, 3], [2, 3, 4])).toEqual([2, 3])
    })

    it('should return empty array when no common elements', () => {
      expect(intersection([1, 2], [3, 4])).toEqual([])
    })
  })

  describe('first', () => {
    it('should always return true', () => {
      expect(first()).toBe(true)
    })
  })

  describe('groupBy', () => {
    it('should group items by key', () => {
      const items = [
        {type: 'a', value: 1},
        {type: 'b', value: 2},
        {type: 'a', value: 3},
      ]
      const result = groupBy(items, (item) => item.type)
      expect(result).toEqual({
        a: [
          {type: 'a', value: 1},
          {type: 'a', value: 3},
        ],
        b: [{type: 'b', value: 2}],
      })
    })
  })

  describe('sliceArrayUntilItem', () => {
    it('should slice array until item', () => {
      expect(sliceArrayUntilItem([1, 2, 3, 4], 3)).toEqual([1, 2, 3])
    })

    it('should return full array if item not found', () => {
      expect(sliceArrayUntilItem([1, 2, 3], 5)).toEqual([1, 2, 3])
    })
  })

  describe('removeItemFromArray', () => {
    it('should remove item from array', () => {
      const arr = [1, 2, 3]
      removeItemFromArray(arr, 2)
      expect(arr).toEqual([1, 3])
    })

    it('should do nothing if item not found', () => {
      const arr = [1, 2, 3]
      removeItemFromArray(arr, 5)
      expect(arr).toEqual([1, 2, 3])
    })
  })

  describe('chunk', () => {
    it('should chunk array into groups', () => {
      expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
    })

    it('should handle empty array', () => {
      expect(chunk([], 2)).toEqual([])
    })
  })

  describe('flatten', () => {
    it('should flatten nested arrays', () => {
      expect(
        flatten([
          [1, 2],
          [3, 4],
        ]),
      ).toEqual([1, 2, 3, 4])
    })

    it('should handle empty arrays', () => {
      expect(flatten([])).toEqual([])
    })
  })

  describe('nonNullish', () => {
    it('should return true for non-null values', () => {
      expect(nonNullish(1)).toBe(true)
      expect(nonNullish('')).toBe(true)
      expect(nonNullish(0)).toBe(true)
    })

    it('should return false for null or undefined', () => {
      expect(nonNullish(null)).toBe(false)
      expect(nonNullish(undefined)).toBe(false)
    })
  })
})
