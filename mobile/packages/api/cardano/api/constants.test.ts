import {CIP25_KEY_NFT, CIP25_V1, CIP25_V2, CIP26_KEY_FT} from './constants'

describe('CIP constants', () => {
  it('should have correct CIP26 key for FT', () => {
    expect(CIP26_KEY_FT).toBe('20')
  })

  it('should have correct CIP25 key for NFT', () => {
    expect(CIP25_KEY_NFT).toBe('721')
  })

  it('should have correct CIP25 version 1', () => {
    expect(CIP25_V1).toBe('1.0')
  })

  it('should have correct CIP25 version 2', () => {
    expect(CIP25_V2).toBe('2.0')
  })
})
