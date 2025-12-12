import {
  generateCIP158P2PDeeplink,
  generateP2PDeeplink,
  parseP2PDeeplink,
} from './deeplink-utils'

describe('deeplink-utils', () => {
  describe('generateP2PDeeplink', () => {
    it('should generate deeplink with dappPeer only', () => {
      const deeplink = generateP2PDeeplink({
        dappPeer: 'dapp-abc123-xyz789',
      })
      expect(deeplink).toBe('wallet://connect?dappPeer=dapp-abc123-xyz789')
    })

    it('should generate deeplink with dappPeer and host', () => {
      const deeplink = generateP2PDeeplink({
        dappPeer: 'dapp-abc123-xyz789',
        host: 'signaling-server.com',
        secure: true,
      })
      expect(deeplink).toContain('dappPeer=dapp-abc123-xyz789')
      expect(deeplink).toContain('host=signaling-server.com')
      expect(deeplink).toContain('secure=true')
    })

    it('should generate deeplink with all parameters', () => {
      const deeplink = generateP2PDeeplink({
        dappPeer: 'wallet-xyz',
        host: 'server.com',
        port: '8080',
        path: '/path',
        secure: true,
      })
      expect(deeplink).toContain('dappPeer=wallet-xyz')
      expect(deeplink).toContain('host=server.com')
      expect(deeplink).toContain('port=8080')
      expect(deeplink).toContain('path=%2Fpath')
      expect(deeplink).toContain('secure=true')
    })
  })

  describe('generateCIP158P2PDeeplink', () => {
    it('should generate CIP-158 deeplink with dappPeer only', () => {
      const deeplink = generateCIP158P2PDeeplink({
        dappPeer: 'dapp-abc123-xyz789',
      })
      expect(deeplink).toBe(
        'web+cardano://connect/v1?dappPeer=dapp-abc123-xyz789',
      )
    })

    it('should generate CIP-158 deeplink with dappPeer and host', () => {
      const deeplink = generateCIP158P2PDeeplink({
        dappPeer: 'dapp-abc123-xyz789',
        host: 'signaling-server.com',
        secure: true,
      })
      expect(deeplink).toContain('dappPeer=dapp-abc123-xyz789')
      expect(deeplink).toContain('host=signaling-server.com')
      expect(deeplink).toContain('secure=true')
    })
  })

  describe('parseP2PDeeplink', () => {
    it('should parse wallet:// deeplink with dappPeer only', () => {
      const parsed = parseP2PDeeplink(
        'wallet://connect?dappPeer=dapp-abc123-xyz789',
      )
      expect(parsed).toEqual({
        dappPeer: 'dapp-abc123-xyz789',
      })
    })

    it('should parse wallet:// deeplink with dappPeer and host', () => {
      const parsed = parseP2PDeeplink(
        'wallet://connect?dappPeer=dapp-abc123-xyz789&host=signaling-server.com&secure=true',
      )
      expect(parsed).toEqual({
        dappPeer: 'dapp-abc123-xyz789',
        host: 'signaling-server.com',
        secure: true,
      })
    })

    it('should parse wallet:// deeplink with all parameters', () => {
      const parsed = parseP2PDeeplink(
        'wallet://connect?dappPeer=wallet-xyz&host=server.com&port=8080&path=/path&secure=true',
      )
      expect(parsed).toEqual({
        dappPeer: 'wallet-xyz',
        host: 'server.com',
        port: '8080',
        path: '/path',
        secure: true,
      })
    })

    it('should parse web+cardano:// deeplink with v1 path', () => {
      const parsed = parseP2PDeeplink(
        'web+cardano://connect/v1?dappPeer=wallet-xyz&host=server.com&secure=true',
      )
      expect(parsed).toEqual({
        dappPeer: 'wallet-xyz',
        host: 'server.com',
        secure: true,
      })
    })

    it('should return null for invalid scheme', () => {
      const parsed = parseP2PDeeplink('https://example.com?dappPeer=xyz')
      expect(parsed).toBeNull()
    })

    it('should return null for web+cardano:// without /v1 path', () => {
      const parsed = parseP2PDeeplink('web+cardano://connect?dappPeer=xyz')
      expect(parsed).toBeNull()
    })

    it('should return null for missing dappPeer', () => {
      const parsed = parseP2PDeeplink('wallet://connect?host=server.com')
      expect(parsed).toBeNull()
    })

    it('should return null for invalid URL', () => {
      const parsed = parseP2PDeeplink('not-a-valid-url')
      expect(parsed).toBeNull()
    })

    it('should handle URL-encoded parameters correctly', () => {
      const parsed = parseP2PDeeplink(
        'wallet://connect?dappPeer=wallet-abc&host=server.com&port=8080&path=%2Fpath&secure=true',
      )
      expect(parsed?.host).toBe('server.com')
      expect(parsed?.port).toBe('8080')
      expect(parsed?.path).toBe('/path')
      expect(parsed?.secure).toBe(true)
    })
  })
})
