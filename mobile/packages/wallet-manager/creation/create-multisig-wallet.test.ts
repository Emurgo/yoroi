/**
 * Integration tests for multisig wallet creation
 */
import type {WalletEncryptedStorage} from '@yoroi/cardano-wallet'
import {Bip32PublicKeyHex, Chain, Wallet} from '@yoroi/types'

import {createMultisigWallet} from './create-multisig-wallet'

// Mock dependencies
jest.mock('@yoroi/cardano-wallet', () => ({
  buildPaymentScript: jest.fn().mockResolvedValue('mockPaymentScriptCbor'),
  buildStakingScript: jest.fn().mockResolvedValue('mockStakingScriptCbor'),
  deriveMultisigAccount: jest.fn().mockResolvedValue({
    sharedWalletKey: 'acct_shared_xvk1...' as Bip32PublicKeyHex,
  }),
}))

jest.mock('@yoroi/identicon', () => ({
  Blockies: jest.fn(() => ({
    asBase64: jest.fn(() => 'mockAvatar'),
  })),
}))

jest.mock('../network-manager/get-wallet-factory', () => ({
  getWalletFactory: jest.fn(() => ({
    calcChecksum: jest.fn(() => ({
      ImagePart: 'mockSeed',
      TextPart: 'MOCK',
    })),
  })),
}))

describe('create-multisig-wallet', () => {
  const mockMakeWalletEncryptedStorage = jest.fn(
    (): WalletEncryptedStorage => ({
      xpriv: {
        read: jest.fn().mockResolvedValue({value: 'mockRootKey'}),
        write: jest.fn().mockResolvedValue(undefined),
        remove: jest.fn().mockResolvedValue(undefined),
      },
      xpub: {
        read: jest.fn().mockResolvedValue({value: 'mockXPub'}),
        write: jest.fn().mockResolvedValue(undefined),
        remove: jest.fn().mockResolvedValue(undefined),
      },
      multisig: {
        read: jest.fn().mockResolvedValue({value: null}),
        write: jest.fn().mockResolvedValue(undefined),
      },
      clear: jest.fn().mockResolvedValue(undefined),
    }),
  )

  const mockCoSigners: ReadonlyArray<Wallet.CoSigner> = [
    {
      name: 'Co-signer 1',
      sharedWalletKey: 'acct_shared_xvk1...' as Bip32PublicKeyHex,
    },
    {
      name: 'Co-signer 2',
      sharedWalletKey: 'acct_shared_xvk2...' as Bip32PublicKeyHex,
    },
  ]

  const mockQuorumRules: Wallet.QuorumRules = {
    kind: 'RequireNOf',
    required: 2,
  }

  const mockParentWalletRootKeys = [
    {
      walletId: 'parent-wallet-1',
      rootKeyHex: 'mockRootKeyHex',
      accountVisual: 0,
      implementation: 'cardano-cip1852' as Wallet.Implementation,
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createMultisigWallet', () => {
    it('should create multisig wallet successfully', async () => {
      const result = await createMultisigWallet(
        {
          name: 'Test Multisig Wallet',
          coSigners: mockCoSigners,
          quorumRules: mockQuorumRules,
          parentWalletIds: ['parent-wallet-1'],
          parentWalletRootKeys: mockParentWalletRootKeys,
          network: Chain.Network.Preprod,
          version: 1,
        },
        mockMakeWalletEncryptedStorage,
      )

      expect(result).toBeDefined()
      expect(result.walletId).toBeDefined()
      expect(result.meta).toBeDefined()
      expect(result.meta.implementation).toBe('cardano-multisig')
      expect(result.meta.multisigMeta).toBeDefined()
      expect(result.paymentScriptCbor).toBeDefined()
      expect(result.stakingScriptCbor).toBeDefined()
    })

    it('should throw error if no co-signers provided', async () => {
      await expect(
        createMultisigWallet(
          {
            name: 'Test Multisig Wallet',
            coSigners: [],
            quorumRules: mockQuorumRules,
            parentWalletIds: ['parent-wallet-1'],
            parentWalletRootKeys: mockParentWalletRootKeys,
            network: Chain.Network.Preprod,
            version: 1,
          },
          mockMakeWalletEncryptedStorage,
        ),
      ).rejects.toThrow('At least one co-signer is required')
    })

    it('should throw error if RequireNOf required exceeds co-signers', async () => {
      await expect(
        createMultisigWallet(
          {
            name: 'Test Multisig Wallet',
            coSigners: mockCoSigners,
            quorumRules: {
              kind: 'RequireNOf',
              required: 5, // More than co-signers
            },
            parentWalletIds: ['parent-wallet-1'],
            parentWalletRootKeys: mockParentWalletRootKeys,
            network: Chain.Network.Preprod,
            version: 1,
          },
          mockMakeWalletEncryptedStorage,
        ),
      ).rejects.toThrow('Invalid quorum')
    })

    it('should create wallet with RequireAllOf quorum', async () => {
      const result = await createMultisigWallet(
        {
          name: 'Test Multisig Wallet',
          coSigners: mockCoSigners,
          quorumRules: {kind: 'RequireAllOf'},
          parentWalletIds: ['parent-wallet-1'],
          parentWalletRootKeys: mockParentWalletRootKeys,
          network: Chain.Network.Preprod,
          version: 1,
        },
        mockMakeWalletEncryptedStorage,
      )

      expect(result.meta.multisigMeta?.quorumRules.kind).toBe('RequireAllOf')
    })

    it('should create wallet with RequireAnyOf quorum', async () => {
      const result = await createMultisigWallet(
        {
          name: 'Test Multisig Wallet',
          coSigners: mockCoSigners,
          quorumRules: {kind: 'RequireAnyOf'},
          parentWalletIds: ['parent-wallet-1'],
          parentWalletRootKeys: mockParentWalletRootKeys,
          network: Chain.Network.Preprod,
          version: 1,
        },
        mockMakeWalletEncryptedStorage,
      )

      expect(result.meta.multisigMeta?.quorumRules.kind).toBe('RequireAnyOf')
    })
  })
})
