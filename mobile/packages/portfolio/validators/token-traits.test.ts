import {isTokenTraits, parseTokenTraits} from './token-traits'

describe('Token Traits Validator', () => {
  describe('isTokenTraits', () => {
    it('should return true for a valid token traits object', () => {
      const validTokenTraits = {
        totalItems: 5,
        traits: [
          {
            type: 'type1',
            value: 'value1',
            rarity: 'rarity1',
          },
          {
            type: 'type2',
            value: 'value2',
            rarity: 'rarity2',
          },
        ],
      }

      expect(isTokenTraits(validTokenTraits)).toBe(true)
    })

    it('should return false for an invalid token traits object', () => {
      const invalidTokenTraits = {
        totalItems: '5',
        traits: [
          {
            type: 'type1',
            value: 'value1',
            rarity: 'rarity1',
          },
          {
            type: 'type2',
            value: 'value2',
            rarity: 'rarity2',
          },
        ],
      }

      expect(isTokenTraits(invalidTokenTraits)).toBe(false)
    })
  })

  describe('parseTokenTraits', () => {
    it('should return the token traits object if it is valid', () => {
      const validTokenTraits = {
        totalItems: 5,
        traits: [
          {
            type: 'type1',
            value: 'value1',
            rarity: 'rarity1',
          },
          {
            type: 'type2',
            value: 'value2',
            rarity: 'rarity2',
          },
        ],
      }

      expect(parseTokenTraits(validTokenTraits)).toEqual(validTokenTraits)
    })

    it('should return undefined if the token traits object is invalid', () => {
      const invalidTokenTraits = {
        totalItems: '5',
        traits: [
          {
            type: 'type1',
            value: 'value1',
            rarity: 'rarity1',
          },
          {
            type: 'type2',
            value: 'value2',
            rarity: 'rarity2',
          },
        ],
      }

      expect(parseTokenTraits(invalidTokenTraits)).toBeUndefined()
    })
  })
})
