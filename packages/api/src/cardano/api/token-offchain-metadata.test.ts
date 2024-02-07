import {ApiTokenRegistryEntry} from '@yoroi/types'
import {
  getOffChainMetadata,
  isTokenRegistryEntry,
} from './token-offchain-metadata'

describe('isTokenRegistryEntry', () => {
  it('should return true for a valid ApiTokenRegistryEntry', () => {
    const validEntry: ApiTokenRegistryEntry = {
      subject: 'someSubject',
      name: {
        signatures: [{publicKey: 'somePublicKey', signature: 'someSignature'}],
        sequenceNumber: 1,
        value: 'TokenName',
      },
    }

    expect(isTokenRegistryEntry(validEntry)).toBe(true)
  })

  it('should return false for an invalid ApiTokenRegistryEntry (missing required fields)', () => {
    const invalidEntry = {
      subject: 'someSubject',
    }

    expect(isTokenRegistryEntry(invalidEntry)).toBe(false)
  })

  it('should return false for an invalid ApiTokenRegistryEntry (wrong type for fields)', () => {
    const invalidEntry: any = {
      subject: 'someSubject',
      name: {
        signatures: 'shouldNotBeString',
        sequenceNumber: 1,
        value: 'TokenName',
      },
    }

    expect(isTokenRegistryEntry(invalidEntry)).toBe(false)
  })

  it('should return false for an invalid ApiTokenRegistryEntry (extra fields are ignored)', () => {
    const invalidEntry: any = {
      name: {
        signatures: [{publicKey: 'somePublicKey', signature: 'someSignature'}],
        sequenceNumber: 1,
        value: 'TokenName',
      },
    }

    expect(isTokenRegistryEntry(invalidEntry)).toBe(false)
  })

  it('should return true for a valid ApiTokenRegistryEntry with optional fields', () => {
    const validEntry: ApiTokenRegistryEntry = {
      subject: 'someSubject',
      name: {
        signatures: [{publicKey: 'somePublicKey', signature: 'someSignature'}],
        sequenceNumber: 1,
        value: 'TokenName',
      },
      description: {
        signatures: [{publicKey: 'somePublicKey', signature: 'someSignature'}],
        sequenceNumber: 1,
        value: 'Some description',
      },
    }

    expect(isTokenRegistryEntry(validEntry)).toBe(true)
  })
})

describe('getOffChainMetadata', () => {
  const baseUrl = 'http://localhost'

  it('should fetch metadata for multiple tokens', async () => {
    const mockFetcher: any = jest.fn<Promise<ApiTokenRegistryEntry>, any[]>(
      ({url}) => {
        if (url.endsWith('token1')) {
          return Promise.resolve({
            subject: 'token1',
            name: {signatures: [], sequenceNumber: 1, value: 'Token1'},
          })
        } else if (url.endsWith('token2')) {
          return Promise.resolve({
            subject: 'token2',
            name: {signatures: [], sequenceNumber: 1, value: 'Token2'},
          })
        } else if (url.endsWith('token3')) {
          return Promise.resolve(null)
        } else {
          return Promise.resolve({not: 'a valid response'} as any)
        }
      },
    )

    const fetchMetadata = getOffChainMetadata(baseUrl, mockFetcher)
    const result = await fetchMetadata([
      'token.1',
      'token.2',
      'token.3',
      'token.4',
    ])

    expect(result).toEqual({
      'token.1': {
        tokenRegistry: {
          subject: 'token1',
          name: {signatures: [], sequenceNumber: 1, value: 'Token1'},
        },
        isValid: true,
      },
      'token.2': {
        tokenRegistry: {
          subject: 'token2',
          name: {signatures: [], sequenceNumber: 1, value: 'Token2'},
        },
        isValid: true,
      },
      'token.3': {tokenRegistry: undefined, isValid: false},
      'token.4': {tokenRegistry: {not: 'a valid response'}, isValid: false},
    })
  })

  it('should handle for failed fetches', async () => {
    const mockFetcher: any = jest.fn<Promise<ApiTokenRegistryEntry>, any[]>(
      () => {
        return Promise.reject(new Error('Some error'))
      },
    )

    const fetchMetadata = getOffChainMetadata(baseUrl, mockFetcher)
    const result = await fetchMetadata(['token.1'])

    expect(result).toEqual({
      'token.1': {tokenRegistry: undefined, isValid: false},
    })
  })

  it('should handle for wrong metadata', async () => {
    const mockFetcher: any = jest.fn<Promise<ApiTokenRegistryEntry>, any[]>(
      () => {
        return Promise.resolve(1 as any)
      },
    )

    const fetchMetadata = getOffChainMetadata(baseUrl, mockFetcher)
    const result = await fetchMetadata(['token.1'])

    expect(result).toEqual({
      'token.1': {tokenRegistry: undefined, isValid: false},
    })
  })

  it('no deps for coverage', async () => {
    const fetchMetadata = getOffChainMetadata(baseUrl)
    expect(fetchMetadata).toBeDefined()
  })

  it('should handle a mix of successful and failed fetches', async () => {
    const mockFetcher: any = jest.fn<Promise<ApiTokenRegistryEntry>, any[]>(
      ({url}) => {
        if (url.endsWith('token1')) {
          return Promise.resolve({
            subject: 'token1',
            name: {signatures: [], sequenceNumber: 1, value: 'Token1'},
          })
        } else {
          return Promise.reject(new Error('Some error'))
        }
      },
    )

    const fetchMetadata = getOffChainMetadata(baseUrl, mockFetcher)
    const result = await fetchMetadata(['token.1', 'token.2'])

    expect(result).toEqual({
      'token.1': {
        tokenRegistry: {
          subject: 'token1',
          name: {signatures: [], sequenceNumber: 1, value: 'Token1'},
        },
        isValid: true,
      },
      'token.2': {tokenRegistry: undefined, isValid: false},
    })
  })
})
