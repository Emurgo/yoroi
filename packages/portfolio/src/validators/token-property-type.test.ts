import {Portfolio} from '@yoroi/types'

import {
  isTokenPropertyType,
  parseTokenPropertyType,
} from './token-property-type'

describe('isTokenPropertyType', () => {
  it('should return true for valid token property type', () => {
    const validTokenPropertyType: Portfolio.Token.PropertyType =
      Portfolio.Token.PropertyType.File
    expect(isTokenPropertyType(validTokenPropertyType)).toBe(true)
  })

  it('should return false for invalid token property type', () => {
    const invalidTokenPropertyType: string = 'invalid'
    expect(isTokenPropertyType(invalidTokenPropertyType)).toBe(false)
  })

  it('should return false for undefined', () => {
    expect(isTokenPropertyType(undefined)).toBe(false)
  })
})

describe('parseTokenPropertyType', () => {
  it('should return valid token property type', () => {
    const validTokenPropertyType: Portfolio.Token.PropertyType =
      Portfolio.Token.PropertyType.File
    expect(parseTokenPropertyType(validTokenPropertyType)).toBe(
      validTokenPropertyType,
    )
  })

  it('should return undefined for invalid token property type', () => {
    const invalidTokenPropertyType: string = 'invalid'
    expect(parseTokenPropertyType(invalidTokenPropertyType)).toBe(undefined)
  })

  it('should return undefined for undefined', () => {
    expect(parseTokenPropertyType(undefined)).toBe(undefined)
  })
})
