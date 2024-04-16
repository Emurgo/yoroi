import {Portfolio} from '@yoroi/types'
import {isTokenApplicaton, parseTokenApplication} from './token-application'

describe('isTokenApplicaton', () => {
  it('should return true for valid token application', () => {
    const validTokenApplication: Portfolio.Token.Application =
      Portfolio.Token.Application.General
    const result = isTokenApplicaton(validTokenApplication)
    expect(result).toBe(true)
  })

  it('should return false for invalid token application', () => {
    const invalidTokenApplication: any = 'invalid'
    const result = isTokenApplicaton(invalidTokenApplication)
    expect(result).toBe(false)
  })
})

describe('parseTokenApplication', () => {
  it('should return valid token application', () => {
    const validTokenApplication: Portfolio.Token.Application =
      Portfolio.Token.Application.General
    const result = parseTokenApplication(validTokenApplication)
    expect(result).toBe(validTokenApplication)
  })

  it('should return undefined for invalid token application', () => {
    const invalidTokenApplication: any = 'invalid'
    const result = parseTokenApplication(invalidTokenApplication)
    expect(result).toBeUndefined()
  })
})
