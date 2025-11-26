import {Either} from '@yoroi/types'

import {isLeft, isRight} from './monads'

describe('monads', () => {
  describe('isLeft', () => {
    it('should return true for left either', () => {
      const left: Either<string, number> = {tag: 'left', error: 'error'}
      expect(isLeft(left)).toBe(true)
    })

    it('should return false for right either', () => {
      const right: Either<string, number> = {tag: 'right', value: 1}
      expect(isLeft(right)).toBe(false)
    })
  })

  describe('isRight', () => {
    it('should return true for right either', () => {
      const right: Either<string, number> = {tag: 'right', value: 1}
      expect(isRight(right)).toBe(true)
    })

    it('should return false for left either', () => {
      const left: Either<string, number> = {tag: 'left', error: 'error'}
      expect(isRight(left)).toBe(false)
    })
  })
})
