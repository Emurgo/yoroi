/**
 * Unit tests for multisig script utilities
 */
import {ScriptCbor} from '@yoroi/types'

import {CardanoMobileWrapped} from '../wrappedCsl'
import {
  getSignPolicy,
  isNativeScript,
  isValidSharedWalletScript,
} from './script-utils'

// Mock CardanoMobileWrapped
jest.mock('../wrappedCsl', () => ({
  CardanoMobileWrapped: {
    cslScope: jest.fn((fn) => {
      const mockCsl = {
        NativeScript: {
          fromHex: jest.fn((hex: string) => {
            if (hex === 'invalid') return null
            return {
              asScriptAll: jest.fn(() => ({
                nativeScripts: jest.fn(() => ({
                  len: jest.fn(() => 2),
                  get: jest.fn((i: number) => ({
                    asScriptPubkey: jest.fn(() => ({
                      addrKeyhash: jest.fn(() => ({
                        toHex: jest.fn(() => `keyHash${i}`),
                      })),
                    })),
                  })),
                })),
              })),
              asScriptAny: jest.fn(() => null),
              asScriptNOfK: jest.fn(() => null),
            }
          }),
        },
      }
      return fn(mockCsl)
    }),
  },
}))

describe('script-utils', () => {
  const mockScriptCbor = 'mockScriptCbor' as ScriptCbor

  describe('isValidSharedWalletScript', () => {
    it('should return true for valid shared wallet script', () => {
      const result = CardanoMobileWrapped.cslScope((csl) => {
        return isValidSharedWalletScript(csl, mockScriptCbor)
      })
      expect(result).toBe(true)
    })

    it('should return false for invalid script', () => {
      const result = CardanoMobileWrapped.cslScope((csl) => {
        return isValidSharedWalletScript(csl, 'invalid' as ScriptCbor)
      })
      expect(result).toBe(false)
    })
  })

  describe('getSignPolicy', () => {
    it('should extract sign policy from valid script', () => {
      const result = CardanoMobileWrapped.cslScope((csl) => {
        return getSignPolicy(csl, mockScriptCbor)
      })
      expect(result).toBeDefined()
      if (result) {
        expect(result.requiredCosigners).toBeGreaterThan(0)
        expect(result.signers).toBeDefined()
        expect(Array.isArray(result.signers)).toBe(true)
      }
    })

    it('should return undefined for invalid script', () => {
      const result = CardanoMobileWrapped.cslScope((csl) => {
        return getSignPolicy(csl, 'invalid' as ScriptCbor)
      })
      expect(result).toBeUndefined()
    })
  })

  describe('isNativeScript', () => {
    it('should return true for native script', () => {
      const result = CardanoMobileWrapped.cslScope((csl) => {
        return isNativeScript(csl, mockScriptCbor)
      })
      expect(result).toBe(true)
    })

    it('should return false for invalid script', () => {
      const result = CardanoMobileWrapped.cslScope((csl) => {
        return isNativeScript(csl, 'invalid' as ScriptCbor)
      })
      expect(result).toBe(false)
    })
  })
})
