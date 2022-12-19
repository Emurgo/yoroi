import {YoroiNFTModerationStatus} from '../types'
import {isValidModerationStatus} from './validators'

describe('isValidModerationStatus', () => {
  it('should return true on valid NFT Moderation status', () => {
    expect(isValidModerationStatus(YoroiNFTModerationStatus.PENDING)).toBe(true)
    expect(isValidModerationStatus(YoroiNFTModerationStatus.GREEN)).toBe(true)
    expect(isValidModerationStatus(YoroiNFTModerationStatus.RED)).toBe(true)
    expect(isValidModerationStatus(YoroiNFTModerationStatus.MANUAL_REVIEW)).toBe(true)
    expect(isValidModerationStatus(YoroiNFTModerationStatus.YELLOW)).toBe(true)
  })

  it('returns false on invalid NFT Moderation status', () => {
    expect(isValidModerationStatus('invalid' as YoroiNFTModerationStatus)).toBe(false)
  })

  it('returns false when given invalid types', () => {
    expect(isValidModerationStatus(null)).toBe(false)
    expect(isValidModerationStatus(undefined)).toBe(false)
    expect(isValidModerationStatus(1)).toBe(false)
    expect(isValidModerationStatus('')).toBe(false)
    expect(isValidModerationStatus({})).toBe(false)
    expect(isValidModerationStatus([])).toBe(false)
  })
})
