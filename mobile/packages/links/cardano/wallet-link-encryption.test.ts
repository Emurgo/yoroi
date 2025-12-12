import {Hex, hex} from '@yoroi/common'
import {App} from '@yoroi/types'

import {
  type CSLDecryptFunction,
  type CSLEncryptFunction,
  type RandomHexStringFunction,
  type WalletLinkEncryptionAlgorithm,
  decryptWalletData,
  encryptWalletData,
} from './wallet-link-encryption'

describe('wallet-link-encryption', () => {
  const testData = 'deadbeef1234567890abcdef'
  const testPassword = 'test-password-123'

  describe('encryptWalletData', () => {
    describe('plain algorithm', () => {
      it('should return data unchanged', () => {
        const result = encryptWalletData(testData, testPassword, 'plain')
        expect(result).toBe(testData)
      })
    })

    describe('chacha20poly1305 algorithm', () => {
      it('should encrypt data successfully', () => {
        const encrypted = encryptWalletData(
          testData,
          testPassword,
          'chacha20poly1305',
        )
        expect(encrypted).toBeDefined()
        expect(encrypted).not.toBe(testData)
        expect(encrypted.length).toBeGreaterThan(0)
        // Should be hex string
        expect(/^[0-9a-f]+$/i.test(encrypted)).toBe(true)
      })

      it('should produce different output for same input (nonce randomness)', () => {
        const encrypted1 = encryptWalletData(
          testData,
          testPassword,
          'chacha20poly1305',
        )
        const encrypted2 = encryptWalletData(
          testData,
          testPassword,
          'chacha20poly1305',
        )
        expect(encrypted1).not.toBe(encrypted2)
      })

      it('should use custom randomHexString when provided', () => {
        const mockRandomHex: RandomHexStringFunction = jest.fn((length) => {
          // Return predictable hex string for testing
          return hex.fromUtf8('0'.repeat(length / 2)) as Hex
        })

        encryptWalletData(testData, testPassword, 'chacha20poly1305', {
          randomHexString: mockRandomHex,
        })

        // Should be called for salt (32 hex chars = 16 bytes) and nonce (24 hex chars = 12 bytes)
        expect(mockRandomHex).toHaveBeenCalledWith(32) // salt
        expect(mockRandomHex).toHaveBeenCalledWith(24) // nonce
      })
    })

    describe('chacha20poly1305-csl algorithm', () => {
      const mockCslEncrypt: CSLEncryptFunction = jest.fn(
        (_passwordHex, saltHex, nonceHex, dataHex) => {
          // Mock CSL format: data + tag + nonce + salt
          return dataHex + 'tag' + nonceHex + saltHex
        },
      )

      const mockRandomHex: RandomHexStringFunction = jest.fn((length) => {
        return hex.fromUtf8('0'.repeat(length / 2)) as Hex
      })

      it('should encrypt using CSL format when options provided', () => {
        const result = encryptWalletData(
          testData,
          testPassword,
          'chacha20poly1305-csl',
          {
            cslEncrypt: mockCslEncrypt,
            randomHexString: mockRandomHex,
          },
        )

        expect(mockCslEncrypt).toHaveBeenCalled()
        expect(result).toBeDefined()
      })

      it('should throw error when cslEncrypt is missing', () => {
        expect(() =>
          encryptWalletData(testData, testPassword, 'chacha20poly1305-csl', {
            randomHexString: mockRandomHex,
          }),
        ).toThrow('CSL encrypt function and randomHexString are required')
      })

      it('should throw error when randomHexString is missing', () => {
        expect(() =>
          encryptWalletData(testData, testPassword, 'chacha20poly1305-csl', {
            cslEncrypt: mockCslEncrypt,
          }),
        ).toThrow('CSL encrypt function and randomHexString are required')
      })
    })

    describe('unsupported algorithm', () => {
      it('should throw error for unsupported algorithm', () => {
        expect(() =>
          encryptWalletData(
            testData,
            testPassword,
            'unsupported' as WalletLinkEncryptionAlgorithm,
          ),
        ).toThrow('Unsupported encryption algorithm')
      })
    })
  })

  describe('decryptWalletData', () => {
    describe('plain algorithm', () => {
      it('should return data unchanged', () => {
        const result = decryptWalletData(testData, testPassword, 'plain')
        expect(result).toBe(testData)
      })
    })

    describe('chacha20poly1305 algorithm', () => {
      it('should decrypt encrypted data successfully', () => {
        const encrypted = encryptWalletData(
          testData,
          testPassword,
          'chacha20poly1305',
        )
        const decrypted = decryptWalletData(
          encrypted,
          testPassword,
          'chacha20poly1305',
        )
        expect(decrypted).toBe(testData)
      })

      it('should throw WrongPassword error for wrong password', () => {
        const encrypted = encryptWalletData(
          testData,
          testPassword,
          'chacha20poly1305',
        )
        expect(() =>
          decryptWalletData(encrypted, 'wrong-password', 'chacha20poly1305'),
        ).toThrow(App.Errors.WrongPassword)
      })

      it('should throw error for invalid encrypted data (too short)', () => {
        const invalidData = 'deadbeef' // Too short
        expect(() =>
          decryptWalletData(invalidData, testPassword, 'chacha20poly1305'),
        ).toThrow('Invalid encrypted data: too short')
      })

      it('should throw WrongPassword error for corrupted data', () => {
        // Create valid-length but corrupted data
        const corruptedData = '0'.repeat(100) // Valid length but wrong format
        expect(() =>
          decryptWalletData(corruptedData, testPassword, 'chacha20poly1305'),
        ).toThrow(App.Errors.WrongPassword)
      })
    })

    describe('chacha20poly1305-csl algorithm', () => {
      const mockCslDecrypt: CSLDecryptFunction = jest.fn(
        (_passwordHex, _encryptedDataHex) => {
          // Mock successful decryption
          return testData
        },
      )

      it('should decrypt using CSL format when options provided', () => {
        const encryptedData = 'encrypteddata' + 'tag' + 'nonce' + 'salt'
        const result = decryptWalletData(
          encryptedData,
          testPassword,
          'chacha20poly1305-csl',
          {
            cslDecrypt: mockCslDecrypt,
          },
        )

        expect(mockCslDecrypt).toHaveBeenCalled()
        expect(result).toBe(testData)
      })

      it('should throw error when cslDecrypt is missing', () => {
        expect(() =>
          decryptWalletData(
            'encrypteddata',
            testPassword,
            'chacha20poly1305-csl',
          ),
        ).toThrow('CSL decrypt function is required')
      })

      it('should throw WrongPassword error when CSL decryption fails', () => {
        const mockCslDecryptFail: CSLDecryptFunction = jest.fn(() => {
          throw new Error('Decryption failed')
        })

        expect(() =>
          decryptWalletData(
            'encrypteddata',
            testPassword,
            'chacha20poly1305-csl',
            {
              cslDecrypt: mockCslDecryptFail,
            },
          ),
        ).toThrow(App.Errors.WrongPassword)
      })
    })

    describe('unsupported algorithm', () => {
      it('should throw error for unsupported algorithm', () => {
        expect(() =>
          decryptWalletData(
            testData,
            testPassword,
            'unsupported' as WalletLinkEncryptionAlgorithm,
          ),
        ).toThrow('Unsupported encryption algorithm')
      })
    })
  })

  describe('roundtrip encryption/decryption', () => {
    it('should successfully encrypt and decrypt with chacha20poly1305', () => {
      const originalData = 'deadbeef1234567890abcdef'
      const password = 'my-secure-password'

      const encrypted = encryptWalletData(
        originalData,
        password,
        'chacha20poly1305',
      )
      const decrypted = decryptWalletData(
        encrypted,
        password,
        'chacha20poly1305',
      )

      expect(decrypted).toBe(originalData)
    })

    it('should successfully encrypt and decrypt with chacha20poly1305-csl', () => {
      const originalData = 'deadbeef1234567890abcdef'
      const password = 'my-secure-password'

      // Create mock CSL functions that simulate real behavior
      let encryptedData: string | null = null

      const mockCslEncrypt: CSLEncryptFunction = jest.fn(
        (_passwordHex, saltHex, nonceHex, dataHex) => {
          // Store encrypted data for decryption
          encryptedData = dataHex + 'tag' + nonceHex + saltHex
          return encryptedData
        },
      )

      const mockCslDecrypt: CSLDecryptFunction = jest.fn(
        (_passwordHex, encryptedDataHex) => {
          // Extract original data from mock format
          if (encryptedDataHex === encryptedData) {
            return originalData
          }
          throw new Error('Decryption failed')
        },
      )

      const mockRandomHex: RandomHexStringFunction = jest.fn((length) => {
        return hex.fromUtf8('0'.repeat(length / 2)) as Hex
      })

      const encrypted = encryptWalletData(
        originalData,
        password,
        'chacha20poly1305-csl',
        {
          cslEncrypt: mockCslEncrypt,
          randomHexString: mockRandomHex,
        },
      )

      const decrypted = decryptWalletData(
        encrypted,
        password,
        'chacha20poly1305-csl',
        {
          cslDecrypt: mockCslDecrypt,
        },
      )

      expect(decrypted).toBe(originalData)
    })
  })
})
