import {Portfolio} from '@yoroi/types'

import {isTokenStatus, parseTokenStatus} from './token-status'

describe('isTokenStatus', () => {
  it('should return true for valid token status', () => {
    const validStatuses: Portfolio.Token.Status[] = [
      Portfolio.Token.Status.Accredited,
      Portfolio.Token.Status.Invalid,
      Portfolio.Token.Status.Valid,
      Portfolio.Token.Status.Scam,
      Portfolio.Token.Status.Unknown,
    ]

    validStatuses.forEach((status) => {
      expect(isTokenStatus(status)).toBe(true)
    })
  })

  it('should return false for invalid token status', () => {
    const invalidStatuses: unknown[] = [
      'Confirmed',
      'Pending',
      'Failed',
      123,
      null,
      undefined,
      {},
      [],
    ]

    invalidStatuses.forEach((status) => {
      expect(isTokenStatus(status)).toBe(false)
    })
  })
})

describe('parseTokenStatus', () => {
  it('should return valid token status', () => {
    const validStatuses: Portfolio.Token.Status[] = [
      Portfolio.Token.Status.Accredited,
      Portfolio.Token.Status.Invalid,
      Portfolio.Token.Status.Valid,
      Portfolio.Token.Status.Scam,
      Portfolio.Token.Status.Unknown,
    ]

    validStatuses.forEach((status) => {
      expect(parseTokenStatus(status)).toBe(status)
    })
  })

  it('should return undefined for invalid token status', () => {
    const invalidStatuses: unknown[] = [
      'Confirmed',
      'Pending',
      'Failed',
      123,
      null,
      undefined,
      {},
      [],
    ]

    invalidStatuses.forEach((status) => {
      expect(parseTokenStatus(status)).toBeUndefined()
    })
  })
})
