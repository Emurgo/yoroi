import {difference, first, intersection} from './arrays'

describe('Array Utils', () => {
  describe('difference', () => {
    it('should return the difference of two arrays', () => {
      const a = [1, 2, 3, 4, 5]
      const b = [2, 4, 6, 7]
      const result = difference(a, b)
      expect(result).toEqual([1, 3, 5])
    })

    it('should return an empty array when all elements are common', () => {
      const a = [1, 2, 3]
      const b = [1, 2, 3]
      const result = difference(a, b)
      expect(result).toEqual([])
    })

    it('should return the first array when the second array is empty', () => {
      const a = [1, 2, 3]
      const b: number[] = []
      const result = difference(a, b)
      expect(result).toEqual(a)
    })
  })

  describe('intersection', () => {
    it('should return the intersection of two arrays', () => {
      const a = [1, 2, 3, 4, 5]
      const b = [2, 4, 6]
      const result = intersection(a, b)
      expect(result).toEqual([2, 4])
    })

    it('should return an empty array when there is no common element', () => {
      const a = [1, 3, 5]
      const b = [2, 4, 6]
      const result = intersection(a, b)
      expect(result).toEqual([])
    })

    it('should return an empty array when one or both arrays are empty', () => {
      const a: number[] = []
      const b = [2, 4, 6]
      const result = intersection(a, b)
      expect(result).toEqual([])
    })
  })

  describe('predicates', () => {
    it('first', () => {
      expect(first()).toBe(true)
    })
  })
})
