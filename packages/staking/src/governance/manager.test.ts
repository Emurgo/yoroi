import {describe, it, expect} from '@jest/globals'

import {createGovernanceManager} from './manager'
import {init} from '@emurgo/cross-csl-nodejs'

describe('createGovernanceManager', () => {
  const cardano = init('global')
  const options = {networkId: 1, cardano}

  it('should return a manager', () => {
    expect(createGovernanceManager(options)).toBeDefined()
  })

  describe('validateDRepID', () => {
    const governanceManager = createGovernanceManager(options)

    it('should throw an error when for a DRep id that has wrong length', async () => {
      const invalidId = 'abc'
      const errorMessage = 'invalid DRep ID length, must be 56 characters'

      await expect(() => governanceManager.validateDRepID(invalidId)).rejects.toThrow(errorMessage)
    })

    it('should throw an error for a wrongly formatted DRep id', async () => {
      const invalidId = '0123456789012345678901234567890123456789012345678901234X'
      const errorMessage = 'invalid DRep ID format, must be hexadecimal'

      await expect(() => governanceManager.validateDRepID(invalidId)).rejects.toThrow(errorMessage)
    })

    it('should throw an error when a DRep id that is not registered', async () => {
      const invalidId = 'db1bc3c3f99ce68977ceaf27ab4dd917123ef9e73f85c304236eab21'
      const errorMessage = 'DRep ID not registered'

      await expect(() => governanceManager.validateDRepID(invalidId)).rejects.toThrow(errorMessage)
    })

    it('should not throw an error for a DRep id that is registered', async () => {
      const invalidId = 'c1ba49d52822bc4ef30cbf77060251668f1a6ef15ca46d18f76cc758'

      await governanceManager.validateDRepID(invalidId)
    })
  })

  describe('createDelegationCertificate', () => {
    it('should create delegation certificate', async () => {
      const privateKey = await cardano.Bip32PrivateKey.fromBytes(Buffer.from(privateKeyCBOR, 'hex'))
      const publicKey = await privateKey.toPublic()
      const stakingKey = await publicKey
        .derive(2)
        .then((x) => x.derive(0))
        .then((x) => x.toRawKey())

      const drepId = 'c1ba49d52822bc4ef30cbf77060251668f1a6ef15ca46d18f76cc758'
      const manager = createGovernanceManager(options)
      const certificate = await manager.createDelegationCertificate(drepId, stakingKey)
      expect(certificate).toBeDefined()
      const certificateHex = Buffer.from(await certificate.toBytes()).toString('hex')
      expect(certificateHex).toBe(
        '83028200581cc3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e581cc1ba49d52822bc4ef30cbf77060251668f1a6ef15ca46d18f76cc758',
      )
    })
  })
})

const privateKeyCBOR =
  '780de6f67db8e048fe17df60d1fff06dd700cc54b10fc4bcf30f59444d46204c0b890d7dce4c8142d4a4e8e26beac26d6f3c191a80d7b79cc5952968ad7ffbb7d43e76aa8d9b5ad9d91d48479ecd8ef6d00e8df8874e8658ece0cdef94c42367'
