import type {TransactionChain} from './types'
import {getSubmissionOrder, validateChain} from './validation'

describe('chaining validation', () => {
  const createMockTransaction = (
    id: string,
    index: number,
    dependsOn?: string,
  ) => ({
    transaction: {} as any,
    transactionId: id,
    dependsOn,
    chainIndex: index,
  })

  describe('validateChain', () => {
    it('should validate valid chain', () => {
      const chain: TransactionChain = {
        transactions: [
          createMockTransaction('tx1', 0),
          createMockTransaction('tx2', 1, 'tx1'),
        ],
        totalFees: '1000000',
      }

      const result = validateChain(chain)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect circular dependencies', () => {
      const chain: TransactionChain = {
        transactions: [
          createMockTransaction('tx1', 0, 'tx2'),
          createMockTransaction('tx2', 1, 'tx1'),
        ],
        totalFees: '1000000',
      }

      const result = validateChain(chain)

      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('Circular dependency'))).toBe(
        true,
      )
    })

    it('should detect missing dependency', () => {
      const chain: TransactionChain = {
        transactions: [createMockTransaction('tx1', 0, 'tx3')],
        totalFees: '1000000',
      }

      const result = validateChain(chain)

      expect(result.valid).toBe(false)
      expect(
        result.errors.some((e) => e.includes('depends on unknown transaction')),
      ).toBe(true)
    })

    it('should detect dependency order issues', () => {
      const chain: TransactionChain = {
        transactions: [
          createMockTransaction('tx1', 0, 'tx2'),
          createMockTransaction('tx2', 1),
        ],
        totalFees: '1000000',
      }

      const result = validateChain(chain)

      expect(result.valid).toBe(false)
      expect(
        result.errors.some((e) => e.includes('comes later in chain')),
      ).toBe(true)
    })

    it('should detect duplicate transaction IDs', () => {
      const chain: TransactionChain = {
        transactions: [
          createMockTransaction('tx1', 0),
          createMockTransaction('tx1', 1),
        ],
        totalFees: '1000000',
      }

      const result = validateChain(chain)

      expect(result.valid).toBe(false)
      expect(
        result.errors.some((e) => e.includes('Duplicate transaction ID')),
      ).toBe(true)
    })

    it('should warn for large chains', () => {
      const chain: TransactionChain = {
        transactions: Array.from({length: 6}, (_, i) =>
          createMockTransaction(`tx${i}`, i),
        ),
        totalFees: '1000000',
      }

      const result = validateChain(chain)

      expect(
        result.warnings.some((w) => w.includes('Large transaction chain')),
      ).toBe(true)
    })
  })

  describe('getSubmissionOrder', () => {
    it('should return transactions in chain index order', () => {
      const chain: TransactionChain = {
        transactions: [
          createMockTransaction('tx2', 2),
          createMockTransaction('tx0', 0),
          createMockTransaction('tx1', 1),
        ],
        totalFees: '1000000',
      }

      const result = getSubmissionOrder(chain)

      expect(result).toEqual(['tx0', 'tx1', 'tx2'])
    })

    it('should handle single transaction', () => {
      const chain: TransactionChain = {
        transactions: [createMockTransaction('tx1', 0)],
        totalFees: '1000000',
      }

      const result = getSubmissionOrder(chain)

      expect(result).toEqual(['tx1'])
    })

    it('should handle empty chain', () => {
      const chain: TransactionChain = {
        transactions: [],
        totalFees: '0',
      }

      const result = getSubmissionOrder(chain)

      expect(result).toEqual([])
    })
  })
})
