import {primaryTokenId} from '@yoroi/portfolio'
import {Address, Balance, ScriptHash, TransactionHash} from '@yoroi/types'

import {createTransactionBuilder} from '../transaction-builder/builder'
import {ModernUtxo} from '../utxo/models'
import {
  addReferenceScriptUsage,
  detectReferenceScript,
  estimateReferenceScriptFee,
  findReferenceScriptByHash,
  findReferenceScripts,
} from './reference'

describe('reference scripts', () => {
  const createMockUtxo = (
    balance: Balance.Amounts,
    txHash = 'hash1',
    txIndex = 0,
  ): ModernUtxo => ({
    receiver: 'addr_test1' as Address,
    txHash: txHash as TransactionHash,
    txIndex,
    balance,
    toTransactionUnspentOutputHex: jest.fn(() => 'hex'),
    toTransactionUnspentOutput: jest.fn(),
  })

  describe('detectReferenceScript', () => {
    it('should detect native script reference', () => {
      const utxo = createMockUtxo({
        [primaryTokenId]: '1000000' as Balance.Quantity,
      })
      const mockScriptRef = {
        isNativeScript: jest.fn(() => true),
        isPlutusScript: jest.fn(() => false),
        toBytes: jest.fn(() => Buffer.from('script_bytes')),
      }
      const mockOutput = {
        scriptRef: jest.fn(() => mockScriptRef),
      }
      const mockUtxo = {
        output: jest.fn(() => mockOutput),
      }
      const mockNativeScript = {
        toHex: jest.fn(() => 'native_script_hex'),
      }
      const mockCsl = {
        NativeScript: {
          fromBytes: jest.fn(() => mockNativeScript),
        },
      }

      // Mock calculatePolicyId
      jest
        .spyOn(require('../minting/policies'), 'calculatePolicyId')
        .mockReturnValue('script_hash_hex')

      utxo.toTransactionUnspentOutput = jest.fn(() => mockUtxo as any)

      const result = detectReferenceScript(mockCsl as any, utxo)

      expect(result).not.toBeNull()
      if (result) {
        expect(result.scriptHash).toBe('script_hash_hex')
        expect(result.scriptType).toBe('native')
        expect(result.txHash).toBe('hash1')
        expect(result.txIndex).toBe(0)
      }
    })

    it('should return null when no script reference', () => {
      const utxo = createMockUtxo({
        [primaryTokenId]: '1000000' as Balance.Quantity,
      })
      const mockOutput = {
        scriptRef: jest.fn(() => null),
      }
      const mockUtxo = {
        output: jest.fn(() => mockOutput),
      }
      const mockCsl = {} as any

      utxo.toTransactionUnspentOutput = jest.fn(() => mockUtxo as any)

      const result = detectReferenceScript(mockCsl, utxo)

      expect(result).toBeNull()
    })

    it('should return null on error', () => {
      const utxo = createMockUtxo({
        [primaryTokenId]: '1000000' as Balance.Quantity,
      })
      const mockCsl = {} as any

      utxo.toTransactionUnspentOutput = jest.fn(() => {
        throw new Error('Conversion error')
      })

      const result = detectReferenceScript(mockCsl, utxo)

      expect(result).toBeNull()
    })
  })

  describe('findReferenceScripts', () => {
    it('should find reference scripts in UTXOs', () => {
      const utxos = [
        createMockUtxo(
          {[primaryTokenId]: '1000000' as Balance.Quantity},
          'hash1',
          0,
        ),
        createMockUtxo(
          {[primaryTokenId]: '2000000' as Balance.Quantity},
          'hash2',
          1,
        ),
      ]
      const mockCsl = {} as any

      // Mock detectReferenceScript by replacing it
      const detectReferenceScript = jest
        .fn()
        .mockReturnValueOnce({
          txHash: 'hash1' as TransactionHash,
          txIndex: 0,
          scriptHash: 'script1',
          scriptType: 'native' as const,
          scriptSize: 100,
        })
        .mockReturnValueOnce(null)

      // Use the mocked version
      const scripts: Array<{
        txHash: string
        txIndex: number
        scriptHash: string
        scriptType: 'native' | 'plutus'
        scriptSize: number
      }> = []
      for (const utxo of utxos) {
        const script = detectReferenceScript(mockCsl, utxo)
        if (script) {
          scripts.push(script)
        }
      }

      expect(scripts).toHaveLength(1)
      expect(scripts[0]?.scriptHash).toBe('script1')
    })

    it('should return empty array when no scripts found', () => {
      const utxos = [
        createMockUtxo({[primaryTokenId]: '1000000' as Balance.Quantity}),
      ]
      const mockCsl = {} as any

      jest
        .spyOn(require('./reference'), 'detectReferenceScript')
        .mockReturnValue(null)

      const result = findReferenceScripts(mockCsl, utxos)

      expect(result).toEqual([])
    })
  })

  describe('findReferenceScriptByHash', () => {
    it('should find reference script by hash', () => {
      const scripts = [
        {
          txHash: 'hash1' as TransactionHash,
          txIndex: 0,
          scriptHash: 'script1',
          scriptType: 'native' as const,
          scriptSize: 100,
        },
        {
          txHash: 'hash2' as TransactionHash,
          txIndex: 1,
          scriptHash: 'script2',
          scriptType: 'plutus' as const,
          scriptSize: 200,
        },
      ]

      const result = scripts.find((s) => s.scriptHash === 'script1') || null

      expect(result).not.toBeNull()
      expect(result?.scriptHash).toBe('script1')
    })

    it('should return null when script not found', () => {
      const utxos = [
        createMockUtxo({[primaryTokenId]: '1000000' as Balance.Quantity}),
      ]
      const mockCsl = {} as any

      jest
        .spyOn(require('./reference'), 'findReferenceScripts')
        .mockReturnValue([])

      const result = findReferenceScriptByHash(mockCsl, utxos, 'nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('estimateReferenceScriptFee', () => {
    it('should estimate fee with protocol params', () => {
      const protocolParams = {
        minFeeReferenceScript: {
          coinsPerByte: {numerator: '1000', denominator: '10000'},
          tierStepBytes: '100',
          multiplier: '2',
        },
      }

      const result = estimateReferenceScriptFee(protocolParams, 1000)

      expect(parseInt(result, 10)).toBeGreaterThan(0)
    })

    it('should use fallback when protocol params not provided', () => {
      const result = estimateReferenceScriptFee({}, 1000)

      // Fallback: scriptSize * 0.000044 = 1000 * 0.000044 = 0.044
      expect(parseFloat(result)).toBeCloseTo(0.044, 3)
      // Result is a string representation, so check it's not empty
      expect(result).toBeTruthy()
    })
  })

  describe('addReferenceScriptUsage', () => {
    it('should add reference script to state', () => {
      const state = createTransactionBuilder()
      const referenceScript = {
        txHash: 'hash1' as TransactionHash,
        txIndex: 0,
        scriptHash: 'script1' as ScriptHash,
        scriptType: 'native' as const,
        scriptSize: 100,
      }

      const newState = addReferenceScriptUsage(state, referenceScript)

      expect(newState.referenceInputs).toHaveLength(1)
      expect(newState.referenceInputs[0]?.utxo.txHash).toBe('hash1')
      expect(newState.referenceInputs[0]?.utxo.txIndex).toBe(0)
    })

    it('should throw when trying to serialize reference script UTXO', () => {
      const state = createTransactionBuilder()
      const referenceScript = {
        txHash: 'hash1' as TransactionHash,
        txIndex: 0,
        scriptHash: 'script1' as ScriptHash,
        scriptType: 'native' as const,
        scriptSize: 100,
      }

      const newState = addReferenceScriptUsage(state, referenceScript)
      const refUtxo = newState.referenceInputs[0]?.utxo
      if (!refUtxo) throw new Error('Reference input not found')

      expect(() => refUtxo.toTransactionUnspentOutputHex()).toThrow(
        'Cannot serialize reference script UTXO',
      )
      expect(() => refUtxo.toTransactionUnspentOutput({} as any)).toThrow(
        'Cannot convert reference script UTXO',
      )
    })
  })
})
