import {bech32ToHex} from './bech32'

describe('bech32ToHex', () => {
  it('should convert valid bech32 address to hex', () => {
    const bech32Addr =
      'addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnjhl2zqwppv3c8ymms7s8kzk0'
    const result = bech32ToHex(bech32Addr)
    expect(result).toBeDefined()
    expect(typeof result).toBe('string')
    expect(result?.length).toBeGreaterThan(0)
  })

  it('should return undefined for invalid bech32 string', () => {
    const result = bech32ToHex('invalid')
    expect(result).toBeUndefined()
  })

  it('should return undefined for empty string', () => {
    const result = bech32ToHex('')
    expect(result).toBeUndefined()
  })

  it('should handle bech32 strings with different prefixes', () => {
    const stakeAddr =
      'stake1ux3g2c9dx2nhhehyrezyxpkstartcqmu9hk63qgfkccw5rqttygt7'
    const result = bech32ToHex(stakeAddr)
    expect(result).toBeDefined()
  })
})
