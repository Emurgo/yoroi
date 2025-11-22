import {CIP30TransactionError, validateTransactionCbor} from './validation'

describe('CIP-30 validation', () => {
  describe('validateTransactionCbor', () => {
    it('should reject invalid hex', () => {
      const mockCsl = {} as any
      const result = validateTransactionCbor(mockCsl, 'invalid-hex!')

      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('valid hex string'))).toBe(
        true,
      )
    })

    it('should reject when transaction parsing fails', () => {
      const mockCsl = {
        Transaction: {
          fromHex: jest.fn(() => {
            throw new Error('Parse error')
          }),
        },
      }
      const result = validateTransactionCbor(mockCsl as any, 'abcdef')

      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('Parse error'))).toBe(true)
    })

    it('should reject when transaction is null', () => {
      const mockCsl = {
        Transaction: {
          fromHex: jest.fn(() => null),
        },
      }
      const result = validateTransactionCbor(mockCsl as any, 'abcdef')

      expect(result.valid).toBe(false)
      expect(
        result.errors.some((e) => e.includes('Failed to parse transaction')),
      ).toBe(true)
    })

    it('should reject when transaction body is missing', () => {
      const mockTx = {
        body: jest.fn(() => null),
      }
      const mockCsl = {
        Transaction: {
          fromHex: jest.fn(() => mockTx),
        },
      }
      const result = validateTransactionCbor(mockCsl as any, 'abcdef')

      expect(result.valid).toBe(false)
      expect(
        result.errors.some((e) => e.includes('Transaction body is missing')),
      ).toBe(true)
    })

    it('should warn when transaction has no inputs', () => {
      const mockInputs = {
        len: jest.fn(() => 0),
      }
      const mockOutputs = {
        len: jest.fn(() => 1),
      }
      const mockFee = {
        toStr: jest.fn(() => '1000000'),
      }
      const mockTtl = jest.fn(() => 1000000)
      const mockTxBody = {
        inputs: jest.fn(() => mockInputs),
        outputs: jest.fn(() => mockOutputs),
        fee: jest.fn(() => mockFee),
        ttl: mockTtl,
      }
      const mockTx = {
        body: jest.fn(() => mockTxBody),
      }
      const mockCsl = {
        Transaction: {
          fromHex: jest.fn(() => mockTx),
        },
      }
      const result = validateTransactionCbor(mockCsl as any, 'abcdef')

      expect(result.errors.some((e) => e.includes('no inputs'))).toBe(true)
    })

    it('should warn when transaction has no outputs', () => {
      const mockInputs = {
        len: jest.fn(() => 1),
      }
      const mockOutputs = {
        len: jest.fn(() => 0),
      }
      const mockFee = {
        toStr: jest.fn(() => '1000000'),
      }
      const mockTtl = jest.fn(() => 1000000)
      const mockTxBody = {
        inputs: jest.fn(() => mockInputs),
        outputs: jest.fn(() => mockOutputs),
        fee: jest.fn(() => mockFee),
        ttl: mockTtl,
      }
      const mockTx = {
        body: jest.fn(() => mockTxBody),
      }
      const mockCsl = {
        Transaction: {
          fromHex: jest.fn(() => mockTx),
        },
      }
      const result = validateTransactionCbor(mockCsl as any, 'abcdef')

      expect(result.warnings.some((w) => w.includes('no outputs'))).toBe(true)
    })

    it('should warn when fee is zero', () => {
      const mockInputs = {
        len: jest.fn(() => 1),
      }
      const mockOutputs = {
        len: jest.fn(() => 1),
      }
      const mockFee = {
        toStr: jest.fn(() => '0'),
      }
      const mockTtl = jest.fn(() => 1000000)
      const mockTxBody = {
        inputs: jest.fn(() => mockInputs),
        outputs: jest.fn(() => mockOutputs),
        fee: jest.fn(() => mockFee),
        ttl: mockTtl,
      }
      const mockTx = {
        body: jest.fn(() => mockTxBody),
      }
      const mockCsl = {
        Transaction: {
          fromHex: jest.fn(() => mockTx),
        },
      }
      const result = validateTransactionCbor(mockCsl as any, 'abcdef')

      expect(result.warnings.some((w) => w.includes('fee is zero'))).toBe(true)
    })

    it('should warn when TTL is not set', () => {
      const mockInputs = {
        len: jest.fn(() => 1),
      }
      const mockOutputs = {
        len: jest.fn(() => 1),
      }
      const mockFee = {
        toStr: jest.fn(() => '1000000'),
      }
      const mockTtl = jest.fn(() => 0)
      const mockTxBody = {
        inputs: jest.fn(() => mockInputs),
        outputs: jest.fn(() => mockOutputs),
        fee: jest.fn(() => mockFee),
        ttl: mockTtl,
      }
      const mockTx = {
        body: jest.fn(() => mockTxBody),
      }
      const mockCsl = {
        Transaction: {
          fromHex: jest.fn(() => mockTx),
        },
      }
      const result = validateTransactionCbor(mockCsl as any, 'abcdef')

      expect(result.warnings.some((w) => w.includes('TTL is not set'))).toBe(
        true,
      )
    })

    it('should validate correct transaction', () => {
      const mockInputs = {
        len: jest.fn(() => 1),
      }
      const mockOutputs = {
        len: jest.fn(() => 1),
      }
      const mockFee = {
        toStr: jest.fn(() => '1000000'),
      }
      const mockTtl = jest.fn(() => 1000000)
      const mockTxBody = {
        inputs: jest.fn(() => mockInputs),
        outputs: jest.fn(() => mockOutputs),
        fee: jest.fn(() => mockFee),
        ttl: mockTtl,
      }
      const mockTx = {
        body: jest.fn(() => mockTxBody),
      }
      const mockCsl = {
        Transaction: {
          fromHex: jest.fn(() => mockTx),
        },
      }
      const result = validateTransactionCbor(mockCsl as any, 'abcdef')

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('CIP30TransactionError', () => {
    it('should create error with validation result', () => {
      const validation = {
        valid: false,
        errors: ['Error 1'],
        warnings: [],
      }
      const error = new CIP30TransactionError('Test error', validation)

      expect(error.message).toBe('Test error')
      expect(error.name).toBe('CIP30TransactionError')
      expect(error.validation).toBe(validation)
      expect(error).toBeInstanceOf(Error)
    })
  })
})
