import {FetchData, isLeft, isRight} from '@yoroi/common'
import {Chain} from '@yoroi/types'

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

    it('should handle 404 error as empty state', async () => {
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

      expect(isRight(result)).toBe(true)
      if (isRight(result)) {
        expect(result.value.data).toEqual({})
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
      const result = await api.getDRepById('test-drep-id')

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
      const result = await api.getDRepById('test-drep-id')

      expect(isRight(result)).toBe(true)
      if (isRight(result)) {
        expect(result.value.data).toBeNull()
      }
    })

    it('should handle 404 as null (DRep not found)', async () => {
      const mockRequest: FetchData = jest.fn().mockResolvedValue({
        tag: 'left',
        error: {
          status: 404,
          message: 'Not Found',
          responseData: null,
        },
      })

      const api = governanceApiMaker({network, request: mockRequest})
      const result = await api.getDRepById('test-drep-id')

      expect(isRight(result)).toBe(true)
      if (isRight(result)) {
        expect(result.value.data).toBeNull()
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
      const result = await api.getDRepById('test-drep-id')

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
      const result = await api.getDRepById('test-drep-id')

      expect(isLeft(result)).toBe(true)
      if (isLeft(result)) {
        expect(result.error.status).toBe(500)
      }
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
      await api.getDRepById('drep-id-123')

      expect(mockRequest).toHaveBeenCalledWith({
        url: expect.stringContaining('drep-id-123'),
      })
    })
  })
})
