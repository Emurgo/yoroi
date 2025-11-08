import {
  generateCIP158P2PDeeplink,
  generateP2PDeeplink,
  parseP2PDeeplink,
} from './deeplink-utils'

describe('deeplink-utils', () => {
  describe('generateP2PDeeplink', () => {
    it('should generate deeplink with peerId only', () => {
      const deeplink = generateP2PDeeplink({
        peerId: 'dapp-abc123-xyz789',
      })
      expect(deeplink).toBe('wallet://connect?peerId=dapp-abc123-xyz789')
    })

    it('should generate deeplink with peerId and signalingUrl', () => {
      const deeplink = generateP2PDeeplink({
        peerId: 'dapp-abc123-xyz789',
        signalingUrl: 'wss://signaling-server.com',
      })
      expect(deeplink).toBe(
        'wallet://connect?peerId=dapp-abc123-xyz789&signalingUrl=wss%3A%2F%2Fsignaling-server.com',
      )
    })

    it('should URL encode signalingUrl', () => {
      const deeplink = generateP2PDeeplink({
        peerId: 'wallet-xyz',
        signalingUrl: 'wss://server.com:8080/path?query=value',
      })
      expect(deeplink).toContain('peerId=wallet-xyz')
      expect(deeplink).toContain('signalingUrl=wss%3A%2F%2Fserver.com%3A8080')
    })
  })

  describe('generateCIP158P2PDeeplink', () => {
    it('should generate CIP-158 deeplink with peerId only', () => {
      const deeplink = generateCIP158P2PDeeplink({
        peerId: 'dapp-abc123-xyz789',
      })
      expect(deeplink).toBe(
        'web+cardano://connect/v1?peerId=dapp-abc123-xyz789',
      )
    })

    it('should generate CIP-158 deeplink with peerId and signalingUrl', () => {
      const deeplink = generateCIP158P2PDeeplink({
        peerId: 'dapp-abc123-xyz789',
        signalingUrl: 'wss://signaling-server.com',
      })
      expect(deeplink).toBe(
        'web+cardano://connect/v1?peerId=dapp-abc123-xyz789&signalingUrl=wss%3A%2F%2Fsignaling-server.com',
      )
    })
  })

  describe('parseP2PDeeplink', () => {
    it('should parse wallet:// deeplink with peerId only', () => {
      const parsed = parseP2PDeeplink(
        'wallet://connect?peerId=dapp-abc123-xyz789',
      )
      expect(parsed).toEqual({
        peerId: 'dapp-abc123-xyz789',
        signalingUrl: undefined,
      })
    })

    it('should parse wallet:// deeplink with peerId and signalingUrl', () => {
      const parsed = parseP2PDeeplink(
        'wallet://connect?peerId=dapp-abc123-xyz789&signalingUrl=wss%3A%2F%2Fsignaling-server.com',
      )
      expect(parsed).toEqual({
        peerId: 'dapp-abc123-xyz789',
        signalingUrl: 'wss://signaling-server.com',
      })
    })

    it('should parse web+cardano:// deeplink with v1 path', () => {
      const parsed = parseP2PDeeplink(
        'web+cardano://connect/v1?peerId=wallet-xyz&signalingUrl=wss%3A%2F%2Fserver.com',
      )
      expect(parsed).toEqual({
        peerId: 'wallet-xyz',
        signalingUrl: 'wss://server.com',
      })
    })

    it('should return null for invalid scheme', () => {
      const parsed = parseP2PDeeplink('https://example.com?peerId=xyz')
      expect(parsed).toBeNull()
    })

    it('should return null for web+cardano:// without /v1 path', () => {
      const parsed = parseP2PDeeplink('web+cardano://connect?peerId=xyz')
      expect(parsed).toBeNull()
    })

    it('should return null for missing peerId', () => {
      const parsed = parseP2PDeeplink(
        'wallet://connect?signalingUrl=wss://server.com',
      )
      expect(parsed).toBeNull()
    })

    it('should return null for invalid URL', () => {
      const parsed = parseP2PDeeplink('not-a-valid-url')
      expect(parsed).toBeNull()
    })

    it('should handle URL-encoded parameters correctly', () => {
      const parsed = parseP2PDeeplink(
        'wallet://connect?peerId=wallet-abc&signalingUrl=wss%3A%2F%2Fserver.com%3A8080%2Fpath',
      )
      expect(parsed?.signalingUrl).toBe('wss://server.com:8080/path')
    })
  })
})
