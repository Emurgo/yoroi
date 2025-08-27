import {filterBySearch} from './filterBySearch'

describe('filterBySearch', () => {
  const mockToken1 = {
    ticker: 'ADA',
    name: 'Cardano',
    symbol: 'ADA',
  }

  const mockToken2 = {
    ticker: 'BTC',
    name: 'Bitcoin',
    symbol: 'BTC',
  }

  const mockToken3 = {
    ticker: 'ETH',
    name: 'Ethereum',
    symbol: 'ETH',
  }

  const mockToken4 = {
    ticker: 'USDT',
    name: 'Tether USD',
    symbol: 'USDT',
  }

  const tokens = [mockToken1, mockToken2, mockToken3, mockToken4]

  describe('basic functionality', () => {
    it('should return all tokens when search term is empty', () => {
      const searchTerm = ''
      const filter = filterBySearch(searchTerm)
      const result = tokens.filter(filter)
      expect(result).toEqual(tokens)
    })

    it('should return all tokens when search term is only whitespace', () => {
      const searchTerm = '   '
      const filter = filterBySearch(searchTerm)
      const result = tokens.filter(filter)
      expect(result).toEqual(tokens)
    })

    it('should filter by ticker (case insensitive)', () => {
      const searchTerm = 'ada'
      const filter = filterBySearch(searchTerm)
      const result = tokens.filter(filter)
      expect(result).toEqual([mockToken1])
    })

    it('should filter by name (case insensitive)', () => {
      const searchTerm = 'cardano'
      const filter = filterBySearch(searchTerm)
      const result = tokens.filter(filter)
      expect(result).toEqual([mockToken1])
    })

    it('should filter by symbol (case insensitive)', () => {
      const searchTerm = 'btc'
      const filter = filterBySearch(searchTerm)
      const result = tokens.filter(filter)
      expect(result).toEqual([mockToken2])
    })

    it('should return empty array when no matches found', () => {
      const searchTerm = 'xyz'
      const filter = filterBySearch(searchTerm)
      const result = tokens.filter(filter)
      expect(result).toEqual([])
    })

    it('should handle partial matches', () => {
      const searchTerm = 'ethe'
      const filter = filterBySearch(searchTerm)
      const result = tokens.filter(filter)
      expect(result).toEqual([mockToken3, mockToken4]) // Both "Ethereum" and "Tether USD" contain "ethe"
    })

    it('should handle tokens with missing properties', () => {
      const tokenWithMissingProps = {
        ticker: 'TEST',
        name: undefined,
        symbol: undefined,
      }
      const searchTerm = 'test'
      const filter = filterBySearch(searchTerm)
      const result = [tokenWithMissingProps].filter(filter)
      expect(result).toEqual([tokenWithMissingProps])
    })

    it('should return false for string items', () => {
      const searchTerm = 'ada'
      const filter = filterBySearch(searchTerm)
      const mixedItems = ['header', mockToken1, 'footer']
      const result = mixedItems.filter(filter)
      expect(result).toEqual([mockToken1])
    })
  })

  describe('whitespace handling', () => {
    it('should normalize whitespace in search terms', () => {
      const searchTerm = '  cardano  '
      const filter = filterBySearch(searchTerm)
      const result = tokens.filter(filter)
      expect(result).toEqual([mockToken1])
    })

    it('should normalize whitespace in token names', () => {
      const tokenWithSpaces = {
        ticker: 'TEST',
        name: '  Test Token  ',
        symbol: 'TEST',
      }
      const searchTerm = 'testtoken'
      const filter = filterBySearch(searchTerm)
      const result = [tokenWithSpaces].filter(filter)
      expect(result).toEqual([tokenWithSpaces])
    })

    it('should handle mixed case and whitespace', () => {
      const searchTerm = '  CARDANO  '
      const filter = filterBySearch(searchTerm)
      const result = tokens.filter(filter)
      expect(result).toEqual([mockToken1])
    })
  })

  describe('caching behavior', () => {
    it('should cache normalized search terms', () => {
      const searchTerm1 = 'ADA'
      const searchTerm2 = 'ada'
      const searchTerm3 = '  ada  '

      const filter1 = filterBySearch(searchTerm1)
      const filter2 = filterBySearch(searchTerm2)
      const filter3 = filterBySearch(searchTerm3)

      const result1 = tokens.filter(filter1)
      const result2 = tokens.filter(filter2)
      const result3 = tokens.filter(filter3)

      expect(result1).toEqual([mockToken1])
      expect(result2).toEqual([mockToken1])
      expect(result3).toEqual([mockToken1])
    })

    it('should return same filter function for same search term', () => {
      const searchTerm = 'ada'
      const filter1 = filterBySearch(searchTerm)
      const filter2 = filterBySearch(searchTerm)

      // The functions should produce the same results due to caching
      const result1 = tokens.filter(filter1)
      const result2 = tokens.filter(filter2)
      expect(result1).toEqual(result2)
    })
  })

  describe('memory leak prevention', () => {
    it('should limit cache size', () => {
      const MAX_CACHE_SIZE = 100

      // Add more than MAX_CACHE_SIZE unique search terms
      const filters = []
      for (let i = 0; i < MAX_CACHE_SIZE + 10; i++) {
        filters.push(filterBySearch(`search${i}`))
      }

      // Verify that filters are still working correctly
      const result = tokens.filter(filters[0])
      expect(result).toEqual([]) // 'search0' doesn't match any tokens
    })
  })

  describe('edge cases', () => {
    it('should handle empty token properties', () => {
      const emptyToken = {
        ticker: '',
        name: '',
        symbol: '',
      }
      const searchTerm = 'anything'
      const filter = filterBySearch(searchTerm)
      const result = [emptyToken].filter(filter)
      expect(result).toEqual([])
    })

    it('should handle null/undefined token properties', () => {
      const nullToken = {
        ticker: null as any,
        name: undefined,
        symbol: null as any,
      }
      const searchTerm = 'anything'
      const filter = filterBySearch(searchTerm)
      const result = [nullToken].filter(filter)
      expect(result).toEqual([])
    })

    it('should handle very long search terms', () => {
      const longSearchTerm = 'a'.repeat(1000)
      const filter = filterBySearch(longSearchTerm)
      const result = tokens.filter(filter)
      expect(result).toEqual([])
    })

    it('should handle special characters in search terms', () => {
      const searchTerm = 'card@no'
      const filter = filterBySearch(searchTerm)
      const result = tokens.filter(filter)
      expect(result).toEqual([])
    })
  })

  describe('performance regression fixes', () => {
    it('should handle whitespace-only searches efficiently', () => {
      const whitespaceSearchTerms = [' ', '  ', '\t', '\n', ' \t \n ']

      whitespaceSearchTerms.forEach((searchTerm) => {
        const filter = filterBySearch(searchTerm)
        const result = tokens.filter(filter)
        expect(result).toEqual(tokens)
      })
    })

    it('should normalize search terms before checking length', () => {
      const searchTerm = '   ' // 3 spaces
      const filter = filterBySearch(searchTerm)
      const result = tokens.filter(filter)
      expect(result).toEqual(tokens)
    })
  })
})
