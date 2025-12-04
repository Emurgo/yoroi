/**
 * Unit tests for multisig native script building
 */

import {Wallet} from '@yoroi/types'
import {Bip32PublicKeyHex} from '@yoroi/types'

import {buildPaymentScript, buildStakingScript} from './build-native-script'

// Mock CardanoMobileWrapped
jest.mock('../wrappedCsl', () => ({
  CardanoMobileWrapped: {
    cslScope: jest.fn((fn) => {
      // Create a mock CSL scope
      const mockCsl = {
        Bip32PublicKey: {
          fromBytes: jest.fn((bytes: Uint8Array) => ({
            derive: jest.fn((index: number) => ({
              derive: jest.fn((index2: number) => ({
                toRawKey: jest.fn(() => ({
                  hash: jest.fn(() => ({
                    toHex: jest.fn(() => 'mockKeyHash'),
                  })),
                })),
              })),
            })),
          })),
        }),
        Ed25519KeyHash: {
          fromBytes: jest.fn(() => ({
            toHex: jest.fn(() => 'mockKeyHash'),
          })),
        },
        ScriptPubkey: {
          new: jest.fn(() => ({
            addrKeyhash: jest.fn(() => ({
              toHex: jest.fn(() => 'mockKeyHash'),
            })),
          })),
        },
        NativeScript: {
          newScriptPubkey: jest.fn((scriptPubkey) => ({
            toHex: jest.fn(() => 'mockScriptCbor'),
            asScriptPubkey: jest.fn(() => scriptPubkey),
          })),
          newScriptAll: jest.fn((scriptAll) => ({
            toHex: jest.fn(() => 'mockScriptCbor'),
          })),
          newScriptAny: jest.fn((scriptAny) => ({
            toHex: jest.fn(() => 'mockScriptCbor'),
          })),
          newScriptNOfK: jest.fn((scriptNOfK) => ({
            toHex: jest.fn(() => 'mockScriptCbor'),
          })),
        },
        NativeScripts: {
          new: jest.fn(() => ({
            add: jest.fn(),
            len: jest.fn(() => 0),
            get: jest.fn(() => null),
          })),
        },
        ScriptAll: {
          new: jest.fn((scripts) => ({
            nativeScripts: jest.fn(() => scripts),
          })),
        },
        ScriptAny: {
          new: jest.fn((scripts) => ({
            nativeScripts: jest.fn(() => scripts),
          })),
        },
        ScriptNOfK: {
          new: jest.fn((n, scripts) => ({
            n: jest.fn(() => n),
            nativeScripts: jest.fn(() => scripts),
          })),
        },
      }
      return fn(mockCsl)
    }),
  },
}))

describe('build-native-script', () => {
  const mockSigners: ReadonlyArray<Bip32PublicKeyHex> = [
    'acct_shared_xvk1z8kc04y...' as Bip32PublicKeyHex,
    'acct_shared_xvk2z9ld15z...' as Bip32PublicKeyHex,
    'acct_shared_xvk3z0me26a...' as Bip32PublicKeyHex,
  ]

  describe('buildPaymentScript', () => {
    it('should build RequireAllOf script', async () => {
      const quorumRules: Wallet.QuorumRules = {kind: 'RequireAllOf'}
      const result = await buildPaymentScript(mockSigners, quorumRules)
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })

    it('should build RequireAnyOf script', async () => {
      const quorumRules: Wallet.QuorumRules = {kind: 'RequireAnyOf'}
      const result = await buildPaymentScript(mockSigners, quorumRules)
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })

    it('should build RequireNOf script', async () => {
      const quorumRules: Wallet.QuorumRules = {
        kind: 'RequireNOf',
        required: 2,
      }
      const result = await buildPaymentScript(mockSigners, quorumRules)
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })

    it('should handle empty signers array', async () => {
      const quorumRules: Wallet.QuorumRules = {kind: 'RequireAllOf'}
      await expect(
        buildPaymentScript([], quorumRules),
      ).rejects.toThrow()
    })
  })

  describe('buildStakingScript', () => {
    it('should build RequireAllOf script', async () => {
      const quorumRules: Wallet.QuorumRules = {kind: 'RequireAllOf'}
      const result = await buildStakingScript(mockSigners, quorumRules)
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })

    it('should build RequireAnyOf script', async () => {
      const quorumRules: Wallet.QuorumRules = {kind: 'RequireAnyOf'}
      const result = await buildStakingScript(mockSigners, quorumRules)
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })

    it('should build RequireNOf script', async () => {
      const quorumRules: Wallet.QuorumRules = {
        kind: 'RequireNOf',
        required: 2,
      }
      const result = await buildStakingScript(mockSigners, quorumRules)
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })
  })
})

