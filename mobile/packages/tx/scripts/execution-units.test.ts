import {calculateScriptFee, estimateExecutionUnits} from './execution-units'
import type {ExecutionUnits} from './execution-units'

describe('execution units', () => {
  describe('estimateExecutionUnits', () => {
    it('should estimate execution units', () => {
      const result = estimateExecutionUnits(1000, 500, {})

      expect(parseInt(result.memory, 10)).toBeGreaterThan(0)
      expect(parseInt(result.steps, 10)).toBeGreaterThan(0)
    })

    it('should apply safety margin', () => {
      const result = estimateExecutionUnits(1000, 500, {})
      const baseMemory = 1000 * 100 + 500 * 50
      const expectedMemory = Math.floor(baseMemory * 1.5)

      expect(parseInt(result.memory, 10)).toBe(expectedMemory)
    })

    it('should cap at maximum execution units', () => {
      const protocolParams = {
        maxExecutionUnits: {
          perTransaction: {
            memory: '100000',
            cpu: '50000',
          },
        },
      }

      const result = estimateExecutionUnits(10000, 5000, protocolParams)

      expect(parseInt(result.memory, 10)).toBeLessThanOrEqual(100000)
      expect(parseInt(result.steps, 10)).toBeLessThanOrEqual(50000)
    })

    it('should handle zero script size', () => {
      const result = estimateExecutionUnits(0, 0, {})

      expect(result.memory).toBe('0')
      expect(result.steps).toBe('0')
    })
  })

  describe('calculateScriptFee', () => {
    it('should calculate script fee from execution units', () => {
      const executionUnits: ExecutionUnits = {
        memory: '1000000',
        steps: '500000',
      }
      const protocolParams = {
        scriptExecutionPrices: {
          memory: {numerator: '577', denominator: '10000'},
          cpu: {numerator: '721', denominator: '10000000'},
        },
      }

      const result = calculateScriptFee(executionUnits, protocolParams)

      expect(parseInt(result, 10)).toBeGreaterThan(0)
    })

    it('should calculate fee correctly', () => {
      const executionUnits: ExecutionUnits = {
        memory: '1000000',
        steps: '1000000',
      }
      const protocolParams = {
        scriptExecutionPrices: {
          memory: {numerator: '1', denominator: '1'},
          cpu: {numerator: '1', denominator: '1'},
        },
      }

      const result = calculateScriptFee(executionUnits, protocolParams)

      expect(result).toBe('2000000') // memory + cpu
    })

    it('should handle zero execution units', () => {
      const executionUnits: ExecutionUnits = {
        memory: '0',
        steps: '0',
      }
      const protocolParams = {
        scriptExecutionPrices: {
          memory: {numerator: '1', denominator: '1'},
          cpu: {numerator: '1', denominator: '1'},
        },
      }

      const result = calculateScriptFee(executionUnits, protocolParams)

      expect(result).toBe('0')
    })
  })
})
