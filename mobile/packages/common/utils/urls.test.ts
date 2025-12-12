import {getBasePath, joinUrl} from './urls'

describe('urls utilities', () => {
  describe('getBasePath', () => {
    it('should extract base path from URL', () => {
      expect(getBasePath('https://example.com/path/to/resource?query=1')).toBe(
        'https://example.com/path/to/resource',
      )
    })

    it('should handle URL without path', () => {
      expect(getBasePath('https://example.com')).toBe('https://example.com/')
    })
  })

  describe('joinUrl', () => {
    it('should join URL with path', () => {
      expect(joinUrl('https://example.com', 'path')).toBe(
        'https://example.com/path',
      )
    })

    it('should handle path with leading slash', () => {
      expect(joinUrl('https://example.com', '/path')).toBe(
        'https://example.com/path',
      )
    })

    it('should handle base URL with trailing slash', () => {
      expect(joinUrl('https://example.com/', 'path')).toBe(
        'https://example.com/path',
      )
    })

    it('should handle nested paths', () => {
      expect(joinUrl('https://example.com/api', 'v1/users')).toBe(
        'https://example.com/api/v1/users',
      )
    })
  })
})
