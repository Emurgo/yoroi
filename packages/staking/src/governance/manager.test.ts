import {governanceManagerMaker, GovernanceAction} from './manager'
import {init} from '@emurgo/cross-csl-nodejs'
import {GovernanceApi, governanceApiMaker} from './api'
import {fetcher, mountStorage} from '@yoroi/common'

const apiMock: GovernanceApi = {
  getDRepById: () =>
    Promise.resolve({
      txId: 'tx',
      epoch: 123,
    }),
  getStakingKeyState: () =>
    Promise.resolve({
      drepDelegation: {tx: 'tx', slot: 123, epoch: 123, drep: 'abstain'},
    }),
}

describe('createGovernanceManager', () => {
  const cardano = init('global')
  const networkId = 1
  const options = {
    walletId: 'walletId',
    networkId,
    cardano,
    storage: mountStorage('wallet/'),
    api: governanceApiMaker({networkId, client: fetcher}),
  }

  afterEach(async () => {
    await options.storage.clear()
  })

  it('should return a manager', () => {
    expect(governanceManagerMaker(options)).toBeDefined()
  })

  describe('validateDRepID', () => {
    const governanceManager = governanceManagerMaker(options)

    it('should throw an error for a wrongly formatted DRep id', async () => {
      const invalidId =
        '0123456789012345678901234567890123456789012345678901234X'
      const errorMessage =
        'Invalid DRep ID. Must have a valid bech32 format or a valid key hash format.'

      await expect(() =>
        governanceManager.validateDRepID(invalidId),
      ).rejects.toThrow(errorMessage)
    })

    it('should throw an error when a DRep id that is not registered', async () => {
      const invalidId =
        'db1bc3c3f99ce68977ceaf27ab4dd917123ef9e73f85c304236eab21'
      const errorMessage = 'DRep ID not registered'

      await expect(() =>
        governanceManager.validateDRepID(invalidId),
      ).rejects.toThrow(errorMessage)
    })

    it('should not throw an error for a DRep id that is registered', async () => {
      const id = 'c1ba49d52822bc4ef30cbf77060251668f1a6ef15ca46d18f76cc758'

      const manager = governanceManagerMaker({
        ...options,
        api: apiMock,
      })

      await manager.validateDRepID(id)
    })

    it('should accept key hash as DRep ID', async () => {
      const manager = governanceManagerMaker({
        ...options,
        api: apiMock,
      })

      const keyHash = 'db1bc3c3f99ce68977ceaf27ab4dd917123ef9e73f85c304236eab23'

      await manager.validateDRepID(keyHash)
    })

    it('should accept bech32 address as DRep ID', async () => {
      const bech32Address =
        'drep1r73ah4wa3zqhw2fpnzyyj2lnya5zwjftkakgfk094y3mkerc53c'
      const manager = governanceManagerMaker({
        ...options,
        api: apiMock,
      })

      await manager.validateDRepID(bech32Address)
    })
  })

  describe('createDelegationCertificate', () => {
    it('should create delegation certificate', async () => {
      const privateKey = await cardano.Bip32PrivateKey.fromBytes(
        Buffer.from(privateKeyCBOR, 'hex'),
      )
      const publicKey = await privateKey.toPublic()
      const stakingKey = await publicKey
        .derive(2)
        .then((x) => x.derive(0))
        .then((x) => x.toRawKey())

      const drepId = 'c1ba49d52822bc4ef30cbf77060251668f1a6ef15ca46d18f76cc758'
      const manager = governanceManagerMaker(options)
      const certificate = await manager.createDelegationCertificate(
        drepId,
        stakingKey,
      )
      expect(certificate).toBeDefined()
      const certificateHex = Buffer.from(await certificate.toBytes()).toString(
        'hex',
      )
      expect(certificateHex).toBe(
        '83098200581cc3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e8200581cc1ba49d52822bc4ef30cbf77060251668f1a6ef15ca46d18f76cc758',
      )
    })
  })

  describe('latestGovernanceAction', () => {
    it('should return null if there is no action', async () => {
      const manager = governanceManagerMaker(options)
      const latestGovernanceAction = await manager.getLatestGovernanceAction()
      expect(latestGovernanceAction).toBeNull()
    })

    it('should return the latest vote action that was set', async () => {
      const manager = governanceManagerMaker(options)
      const action: GovernanceAction = {
        kind: 'vote',
        txID: 'txID',
        vote: 'no-confidence',
      }
      await manager.setLatestGovernanceAction(action)
      const latestGovernanceAction = await manager.getLatestGovernanceAction()
      expect(latestGovernanceAction).toEqual(action)
    })

    it('should return the latest delegation action that was set', async () => {
      const manager = governanceManagerMaker(options)
      const action: GovernanceAction = {
        kind: 'delegate-to-drep',
        txID: 'txID',
        drepID: 'drepID',
      }
      await manager.setLatestGovernanceAction(action)
      const latestGovernanceAction = await manager.getLatestGovernanceAction()
      expect(latestGovernanceAction).toEqual(action)
    })
  })
})

const privateKeyCBOR =
  '780de6f67db8e048fe17df60d1fff06dd700cc54b10fc4bcf30f59444d46204c0b890d7dce4c8142d4a4e8e26beac26d6f3c191a80d7b79cc5952968ad7ffbb7d43e76aa8d9b5ad9d91d48479ecd8ef6d00e8df8874e8658ece0cdef94c42367'
