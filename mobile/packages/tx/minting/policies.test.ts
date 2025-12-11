import {calculatePolicyId, validateMintingScript} from './policies'
import type {MintingScript} from './types'

describe('minting policies', () => {
  describe('validateMintingScript', () => {
    it('should validate native script', () => {
      const script: MintingScript = {
        type: 'native',
        script: 'abcdef123456',
      }
      const result = validateMintingScript(script)

      expect(result.valid).toBe(true)
    })

    it('should validate plutus script', () => {
      const script: MintingScript = {
        type: 'plutus',
        script: 'abcdef123456',
      }
      const result = validateMintingScript(script)

      expect(result.valid).toBe(true)
    })

    it('should reject invalid script type', () => {
      const script = {type: 'invalid', script: 'abcdef'} as any
      const result = validateMintingScript(script)

      expect(result.valid).toBe(false)
      expect(result.error).toBe('Invalid script type')
    })

    it('should reject missing script', () => {
      const script = {type: 'native'} as any
      const result = validateMintingScript(script)

      expect(result.valid).toBe(false)
      expect(result.error).toBe('Script must be a hex string')
    })

    it('should reject non-hex script', () => {
      const script: MintingScript = {
        type: 'native',
        script: 'invalid-hex!',
      }
      const result = validateMintingScript(script)

      expect(result.valid).toBe(false)
      expect(result.error).toBe('Script must be valid hex')
    })
  })

  describe('calculatePolicyId', () => {
    it('should calculate policy ID for native script', () => {
      const script: MintingScript = {
        type: 'native',
        script: 'abcdef123456',
      }
      const mockNativeScript = {
        hash: jest.fn(() => ({
          toHex: () => 'policy_id_hex',
        })),
      }
      const mockCsl = {
        NativeScript: {
          fromHex: jest.fn(() => mockNativeScript),
        },
      }

      const result = calculatePolicyId(mockCsl as any, script)

      expect(result).toBe('policy_id_hex')
      expect(mockCsl.NativeScript.fromHex).toHaveBeenCalledWith('abcdef123456')
    })

    it('should calculate policy ID for plutus script', () => {
      const script: MintingScript = {
        type: 'plutus',
        script: 'abcdef123456',
      }
      const mockPlutusScript = {
        hash: jest.fn(() => ({
          toHex: () => 'policy_id_hex',
        })),
      }
      const mockCsl = {
        PlutusScript: {
          fromHex: jest.fn(() => mockPlutusScript),
        },
      }

      const result = calculatePolicyId(mockCsl as any, script)

      expect(result).toBe('policy_id_hex')
      expect(mockCsl.PlutusScript.fromHex).toHaveBeenCalledWith('abcdef123456')
    })

    it('should throw error for invalid native script', () => {
      const script: MintingScript = {
        type: 'native',
        script: 'invalid',
      }
      const mockCsl = {
        NativeScript: {
          fromHex: jest.fn(() => null),
        },
      }

      expect(() => calculatePolicyId(mockCsl as any, script)).toThrow(
        'Invalid native script',
      )
    })

    it('should throw error for invalid plutus script', () => {
      const script: MintingScript = {
        type: 'plutus',
        script: 'invalid',
      }
      const mockCsl = {
        PlutusScript: {
          fromHex: jest.fn(() => null),
        },
      }

      expect(() => calculatePolicyId(mockCsl as any, script)).toThrow(
        'Invalid Plutus script',
      )
    })
  })
})
