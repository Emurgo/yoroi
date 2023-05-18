import {parseModerationStatus} from './nftModerationStatus'

describe('parseModerationStatus', () => {
  it('should return status on valid NFT Moderation status', () => {
    expect(parseModerationStatus('PENDING')).toBe('pending')
    expect(parseModerationStatus('GREEN')).toBe('approved')
    expect(parseModerationStatus('RED')).toBe('blocked')
    expect(parseModerationStatus('MANUAL_REVIEW')).toBe('manual_review')
    expect(parseModerationStatus('YELLOW')).toBe('consent')
  })

  it('returns undefined on invalid NFT Moderation status', () => {
    expect(parseModerationStatus('invalid')).toBe(undefined)
  })

  it('returns undefined when given invalid types', () => {
    expect(parseModerationStatus(null)).toBe(undefined)
    expect(parseModerationStatus(undefined)).toBe(undefined)
    expect(parseModerationStatus(1)).toBe(undefined)
    expect(parseModerationStatus('')).toBe(undefined)
    expect(parseModerationStatus({})).toBe(undefined)
    expect(parseModerationStatus([])).toBe(undefined)
  })
})
