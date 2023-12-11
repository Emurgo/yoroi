import {isLeft, isRight} from './monads'

describe('Either helper functions', () => {
  describe('isLeft', () => {
    it('returns true if Either is Left', () => {
      const left = {tag: 'left', error: new Error('Error')} as const
      expect(isLeft(left)).toBe(true)
    })

    it('returns false if Either is Right', () => {
      const right = {tag: 'right', value: 'Success'} as const
      expect(isLeft(right)).toBe(false)
    })
  })

  describe('isRight', () => {
    it('returns true if Either is Right', () => {
      const right = {tag: 'right', value: 'Success'} as const
      expect(isRight(right)).toBe(true)
    })

    it('returns false if Either is Left', () => {
      const left = {tag: 'left', error: new Error('Error')} as const
      expect(isRight(left)).toBe(false)
    })
  })
})
