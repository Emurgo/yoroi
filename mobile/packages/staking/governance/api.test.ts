import {FetchData, isLeft, isRight} from '@yoroi/common'
import {Chain, DRepId} from '@yoroi/types'

import {governanceApiMaker} from './api'

describe('Governance API with Monad Pattern', () => {
  const network = Chain.Network.Preprod

  describe('getStakingKeyState', () => {
    it('should handle successful response with data', async () => {
      const mockResponse = {
        drepDelegation: {
          tx: 'tx-hash',
          epoch: 123,
          slot: 456,
          drep: 'abstain',
        },
      }

      const mockRequest: FetchData = jest.fn().mockResolvedValue({
        tag: 'right',
        value: {status: 200, data: mockResponse},
      })

      const api = governanceApiMaker({network, request: mockRequest})
      const result = await api.getStakingKeyState('test-stake-key-hash')

      expect(isRight(result)).toBe(true)
      if (isRight(result)) {
        expect(result.value.data.drepDelegation).toEqual(
          mockResponse.drepDelegation,
        )
      }
    })

    it('should handle null response from backend', async () => {
      const mockRequest: FetchData = jest.fn().mockResolvedValue({
        tag: 'right',
        value: {status: 200, data: null},
      })

      const api = governanceApiMaker({network, request: mockRequest})
      const result = await api.getStakingKeyState('test-stake-key-hash')

      expect(isRight(result)).toBe(true)
      if (isRight(result)) {
        expect(result.value.data).toEqual({})
      }
    })

    it('should handle undefined response from backend', async () => {
      const mockRequest: FetchData = jest.fn().mockResolvedValue({
        tag: 'right',
        value: {status: 200, data: undefined},
      })

      const api = governanceApiMaker({network, request: mockRequest})
      const result = await api.getStakingKeyState('test-stake-key-hash')

      expect(isRight(result)).toBe(true)
      if (isRight(result)) {
        expect(result.value.data).toEqual({})
      }
    })

    it('should return error for 404 (not found)', async () => {
      const mockRequest: FetchData = jest.fn().mockResolvedValue({
        tag: 'left',
        error: {
          status: 404,
          message: 'Not Found',
          responseData: null,
        },
      })

      const api = governanceApiMaker({network, request: mockRequest})
      const result = await api.getStakingKeyState('test-stake-key-hash')

      expect(isLeft(result)).toBe(true)
      if (isLeft(result)) {
        expect(result.error.status).toBe(404)
      }
    })

    it('should return error for non-404 errors', async () => {
      const mockRequest: FetchData = jest.fn().mockResolvedValue({
        tag: 'left',
        error: {
          status: 500,
          message: 'Internal Server Error',
          responseData: null,
        },
      })

      const api = governanceApiMaker({network, request: mockRequest})
      const result = await api.getStakingKeyState('test-stake-key-hash')

      expect(isLeft(result)).toBe(true)
      if (isLeft(result)) {
        expect(result.error.status).toBe(500)
        expect(result.error.message).toBe('Internal Server Error')
      }
    })

    it('should handle network errors', async () => {
      const mockRequest: FetchData = jest.fn().mockResolvedValue({
        tag: 'left',
        error: {
          status: -1,
          message: 'Network (no response)',
          responseData: null,
        },
      })

      const api = governanceApiMaker({network, request: mockRequest})
      const result = await api.getStakingKeyState('test-stake-key-hash')

      expect(isLeft(result)).toBe(true)
      if (isLeft(result)) {
        expect(result.error.status).toBe(-1)
      }
    })

    it('should handle empty response object', async () => {
      const mockRequest: FetchData = jest.fn().mockResolvedValue({
        tag: 'right',
        value: {status: 200, data: {}},
      })

      const api = governanceApiMaker({network, request: mockRequest})
      const result = await api.getStakingKeyState('test-stake-key-hash')

      expect(isRight(result)).toBe(true)
      if (isRight(result)) {
        expect(result.value.data.drepDelegation).toBeUndefined()
      }
    })
  })

  describe('getDRepById', () => {
    it('should return drep data when registered', async () => {
      const mockResponse = {
        registration: {
          tx: 'tx-hash',
          epoch: 123,
          slot: 456,
          deposit: '1000000',
        },
      }

      const mockRequest: FetchData = jest.fn().mockResolvedValue({
        tag: 'right',
        value: {status: 200, data: mockResponse},
      })

      const api = governanceApiMaker({network, request: mockRequest})
      const result = await api.getDRepById('test-drep-id' as DRepId)

      expect(isRight(result)).toBe(true)
      if (isRight(result)) {
        expect(result.value.data).toEqual({txId: 'tx-hash', epoch: 123})
      }
    })

    it('should handle null response', async () => {
      const mockRequest: FetchData = jest.fn().mockResolvedValue({
        tag: 'right',
        value: {status: 200, data: null},
      })

      const api = governanceApiMaker({network, request: mockRequest})
      const result = await api.getDRepById('test-drep-id' as DRepId)

      expect(isRight(result)).toBe(true)
      if (isRight(result)) {
        expect(result.value.data).toBeNull()
      }
    })

    it('should return error for 404 (DRep not found)', async () => {
      const mockRequest: FetchData = jest.fn().mockResolvedValue({
        tag: 'left',
        error: {
          status: 404,
          message: 'Not Found',
          responseData: null,
        },
      })

      const api = governanceApiMaker({network, request: mockRequest})
      const result = await api.getDRepById('test-drep-id' as DRepId)

      expect(isLeft(result)).toBe(true)
      if (isLeft(result)) {
        expect(result.error.status).toBe(404)
      }
    })

    it('should return null when registration is incomplete', async () => {
      const mockResponse = {
        registration: {
          tx: 'tx-hash',
          // epoch is missing
        },
      }

      const mockRequest: FetchData = jest.fn().mockResolvedValue({
        tag: 'right',
        value: {status: 200, data: mockResponse},
      })

      const api = governanceApiMaker({network, request: mockRequest})
      const result = await api.getDRepById('test-drep-id' as DRepId)

      expect(isRight(result)).toBe(true)
      if (isRight(result)) {
        expect(result.value.data).toBeNull()
      }
    })

    it('should return error for server errors', async () => {
      const mockRequest: FetchData = jest.fn().mockResolvedValue({
        tag: 'left',
        error: {
          status: 500,
          message: 'Internal Server Error',
          responseData: {},
        },
      })

      const api = governanceApiMaker({network, request: mockRequest})
      const result = await api.getDRepById('test-drep-id' as DRepId)

      expect(isLeft(result)).toBe(true)
      if (isLeft(result)) {
        expect(result.error.status).toBe(500)
      }
    })
  })

  describe('getActiveDreps', () => {
    it('should return sanitized DRep entries', async () => {
      const mockRequest: FetchData = jest.fn().mockResolvedValue({
        tag: 'right',
        value: {
          status: 200,
          data: [
            {
              id: 'abc123',
              from: 'verificationKey',
              stake: 5000000,
              mandateEpoch: 10,
              deposit: 2000000,
              delegatorCount: 42,
              registeredDate: '2024-01-01T00:00:00Z',
              metadataHash: 'hash1',
              metadataVerification: 'verified',
              type: 'drep',
              metadata: {
                givenName: 'Test DRep',
                image: {contentUrl: 'https://example.com/avatar.png'},
                body: {
                  objectives: 'Objective text',
                  motivations: 'Motivation text',
                  qualifications: 'Qualification text',
                  references: [{uri: 'https://x.com/testdrep'}],
                },
              },
            },
          ],
        },
      })

      const api = governanceApiMaker({network, request: mockRequest})
      const result = await api.getActiveDreps(1, 100)

      expect(isRight(result)).toBe(true)
      if (isRight(result)) {
        const entry = result.value.data[0]!
        expect(entry.id).toBe('abc123')
        expect(entry.name).toBe('Test DRep')
        expect(entry.imageUrl).toBe('https://example.com/avatar.png')
        expect(entry.objectives).toBe('Objective text')
        expect(entry.motivations).toBe('Motivation text')
        expect(entry.qualifications).toBe('Qualification text')
        expect(entry.socialMedia).toBe('https://x.com/testdrep')
        expect(entry.stake).toBe(5000000)
        expect(entry.delegatorCount).toBe(42)
        expect(entry.metadataVerification).toBe('verified')
      }
    })

    it('should handle JSON-LD givenName {"@value": "..."}', async () => {
      const mockRequest: FetchData = jest.fn().mockResolvedValue({
        tag: 'right',
        value: {
          status: 200,
          data: [
            {
              id: 'abc123',
              from: 'verificationKey',
              metadata: {givenName: {'@value': 'JSON-LD Name'}},
            },
          ],
        },
      })

      const api = governanceApiMaker({network, request: mockRequest})
      const result = await api.getActiveDreps(1, 100)

      expect(isRight(result)).toBe(true)
      if (isRight(result)) {
        expect(result.value.data[0]!.name).toBe('JSON-LD Name')
      }
    })

    it('should read metadata fields flat (no body wrapper)', async () => {
      const mockRequest: FetchData = jest.fn().mockResolvedValue({
        tag: 'right',
        value: {
          status: 200,
          data: [
            {
              id: 'abc123',
              from: 'verificationKey',
              metadata: {
                givenName: 'Flat DRep',
                objectives: 'Flat objective',
                motivations: 'Flat motivation',
                references: [{uri: 'https://x.com/flat'}],
              },
            },
          ],
        },
      })

      const api = governanceApiMaker({network, request: mockRequest})
      const result = await api.getActiveDreps(1, 100)

      expect(isRight(result)).toBe(true)
      if (isRight(result)) {
        const entry = result.value.data[0]!
        expect(entry.name).toBe('Flat DRep')
        expect(entry.objectives).toBe('Flat objective')
        expect(entry.motivations).toBe('Flat motivation')
        expect(entry.socialMedia).toBe('https://x.com/flat')
      }
    })

    it('should drop entries missing id and default missing fields to empty', async () => {
      const mockRequest: FetchData = jest.fn().mockResolvedValue({
        tag: 'right',
        value: {
          status: 200,
          data: [
            {id: 'valid', from: 'verificationKey'},
            {from: 'verificationKey'}, // no id — should be dropped
            null,
            42,
          ],
        },
      })

      const api = governanceApiMaker({network, request: mockRequest})
      const result = await api.getActiveDreps(1, 100)

      expect(isRight(result)).toBe(true)
      if (isRight(result)) {
        expect(result.value.data).toHaveLength(1)
        const entry = result.value.data[0]!
        expect(entry.id).toBe('valid')
        expect(entry.name).toBe('')
        expect(entry.imageUrl).toBe('')
        expect(entry.objectives).toBe('')
        expect(entry.socialMedia).toBe('')
      }
    })

    it('should return empty array for non-array response', async () => {
      const mockRequest: FetchData = jest.fn().mockResolvedValue({
        tag: 'right',
        value: {status: 200, data: null},
      })

      const api = governanceApiMaker({network, request: mockRequest})
      const result = await api.getActiveDreps(1, 100)

      expect(isRight(result)).toBe(true)
      if (isRight(result)) {
        expect(result.value.data).toEqual([])
      }
    })

    it('should propagate network errors', async () => {
      const mockRequest: FetchData = jest.fn().mockResolvedValue({
        tag: 'left',
        error: {status: 500, message: 'Server Error', responseData: null},
      })

      const api = governanceApiMaker({network, request: mockRequest})
      const result = await api.getActiveDreps(1, 100)

      expect(isLeft(result)).toBe(true)
    })

    it('should include page and pageSize in the request URL', async () => {
      const mockRequest: FetchData = jest.fn().mockResolvedValue({
        tag: 'right',
        value: {status: 200, data: []},
      })

      const api = governanceApiMaker({network, request: mockRequest})
      await api.getActiveDreps(3, 50)

      expect(mockRequest).toHaveBeenCalledWith({
        url: expect.stringContaining('page=3'),
      })
      expect(mockRequest).toHaveBeenCalledWith({
        url: expect.stringContaining('pageSize=50'),
      })
    })
  })

  describe('URL construction', () => {
    it('should construct correct URL for getStakingKeyState', async () => {
      const mockRequest: FetchData = jest.fn().mockResolvedValue({
        tag: 'right',
        value: {status: 200, data: {}},
      })

      const api = governanceApiMaker({network, request: mockRequest})
      await api.getStakingKeyState('abc123')

      expect(mockRequest).toHaveBeenCalledWith({
        url: expect.stringContaining('abc123'),
      })
    })

    it('should construct correct URL for getDRepById', async () => {
      const mockRequest: FetchData = jest.fn().mockResolvedValue({
        tag: 'right',
        value: {status: 200, data: null},
      })

      const api = governanceApiMaker({network, request: mockRequest})
      await api.getDRepById('drep-id-123' as DRepId)

      expect(mockRequest).toHaveBeenCalledWith({
        url: expect.stringContaining('drep-id-123'),
      })
    })
  })
})
