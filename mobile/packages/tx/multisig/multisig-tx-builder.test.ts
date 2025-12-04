/**
 * Unit tests for multisig transaction builder
 */
import {ScriptCbor} from '@yoroi/types'

import {buildTransaction} from '../transaction-builder/builder'
import {buildMultisigTransaction} from './multisig-tx-builder'

// Mock dependencies
jest.mock('../transaction-builder/builder', () => ({
  buildTransaction: jest.fn(),
}))

jest.mock('@yoroi/cardano-wallet', () => ({
  CardanoMobileWrapped: {
    cslScope: jest.fn((fn) => {
      // Create a shared mock NativeScripts object that can be reused
      const createMockNativeScripts = () => ({
        len: jest.fn(() => 0),
        get: jest.fn(() => null),
        add: jest.fn(),
      })

      const mockCsl = {
        Transaction: {
          fromHex: jest.fn((_hex: string) => {
            const mockWitnessSet = {
              nativeScripts: jest.fn(() => createMockNativeScripts()),
              setNativeScripts: jest.fn(),
              setVkeys: jest.fn(),
              setBootstraps: jest.fn(),
            }
            return {
              witnessSet: jest.fn(() => mockWitnessSet),
              body: jest.fn(() => ({
                toBytes: jest.fn(() => Buffer.from('body')),
              })),
              auxiliaryData: jest.fn(() => null),
            }
          }),
          new: jest.fn((_body, _witnessSet, _auxData) => ({
            toBytes: jest.fn(() => Buffer.from('updatedTx')),
          })),
        },
        TransactionWitnessSet: {
          new: jest.fn(() => ({
            nativeScripts: jest.fn(() => createMockNativeScripts()),
            setNativeScripts: jest.fn(),
            setVkeys: jest.fn(),
            setBootstraps: jest.fn(),
          })),
        },
        NativeScripts: {
          new: jest.fn(() => createMockNativeScripts()),
        },
        NativeScript: {
          fromHex: jest.fn((hex: string) => ({
            toHex: jest.fn(() => hex),
          })),
        },
      }
      return fn(mockCsl)
    }),
  },
}))

describe('multisig-tx-builder', () => {
  const mockState = {
    inputs: [],
    outputs: [],
    options: {},
  } as any

  const mockProtocolParams = {} as any
  const mockPaymentScriptCbor = 'paymentScriptCbor' as ScriptCbor
  const mockStakingScriptCbor = 'stakingScriptCbor' as ScriptCbor

  beforeEach(() => {
    jest.clearAllMocks()
    ;(buildTransaction as jest.Mock).mockResolvedValue({
      cbor: 'mockTransactionCbor',
      inputs: [],
      outputs: [],
      certificates: [],
      withdrawals: [],
    })
  })

  describe('buildMultisigTransaction', () => {
    it('should build multisig transaction with native scripts', async () => {
      const result = await buildMultisigTransaction({
        state: mockState,
        protocolParams: mockProtocolParams,
        paymentScriptCbor: mockPaymentScriptCbor,
        stakingScriptCbor: mockStakingScriptCbor,
      })

      expect(result).toBeDefined()
      expect(result.cbor).toBeDefined()
      expect(buildTransaction).toHaveBeenCalled()
    })

    it('should throw error if buildTransaction fails', async () => {
      ;(buildTransaction as jest.Mock).mockRejectedValue(
        new Error('Build failed'),
      )

      await expect(
        buildMultisigTransaction({
          state: mockState,
          protocolParams: mockProtocolParams,
          paymentScriptCbor: mockPaymentScriptCbor,
          stakingScriptCbor: mockStakingScriptCbor,
        }),
      ).rejects.toThrow('Build failed')
    })

    it('should throw error if transaction builder returns no CBOR', async () => {
      ;(buildTransaction as jest.Mock).mockResolvedValue({
        cbor: null,
      })

      await expect(
        buildMultisigTransaction({
          state: mockState,
          protocolParams: mockProtocolParams,
          paymentScriptCbor: mockPaymentScriptCbor,
          stakingScriptCbor: mockStakingScriptCbor,
        }),
      ).rejects.toThrow('Transaction builder did not return CBOR')
    })
  })
})
