import {StakePoolInfoRequest, StakePoolInfosAndHistories} from '@yoroi/staking'
import {Branded, TransactionCborBase64, WalletTransaction} from '@yoroi/types'

import {
  AccountStateResponse,
  TipStatusResponse,
  TxStatusResponse,
} from './api-types'
import {cardanoApiManagerMaker} from './manager'
import {
  Addresses,
  CardanoApiAdapter,
  CardanoBackend,
  EndpointPreference,
  WalletContext,
} from './types'

describe('cardanoApiManagerMaker', () => {
  const mockWalletContext: WalletContext = {
    walletId: 'test-wallet-id',
    publicKeyHex: Branded.asPublicKeyHex('test-public-key'),
    accountPubKeyHex: Branded.asPublicKeyHex('test-account-key'),
    paymentKeyHashes: [Branded.asKeyHash('hash1'), Branded.asKeyHash('hash2')],
    rewardAddresses: [Branded.asAddress('addr1')],
  }

  const createMockAdapter = (name: string): CardanoApiAdapter => ({
    async getTipStatus(): Promise<TipStatusResponse> {
      return {
        bestBlock: {
          hash: Branded.asBlockHash(`${name}-tip`),
          height: 100,
          epoch: null,
          slot: null,
          globalSlot: null,
        },
        safeBlock: {
          hash: Branded.asBlockHash(`${name}-safe`),
          height: 99,
          epoch: null,
          slot: null,
          globalSlot: null,
        },
      }
    },

    async fetchNewTxHistory(): Promise<{
      isLast: boolean
      transactions: Array<WalletTransaction>
    }> {
      return {
        isLast: true,
        transactions: [
          {
            id: Branded.asTransactionHash(`${name}-tx`),
            type: 'shelley',
            status: 'Successful',
            inputs: [],
            outputs: [],
            lastUpdatedAt: new Date().toISOString(),
            submittedAt: null,
            blockNum: null,
            blockHash: null,
            txOrdinal: null,
            epoch: null,
            slot: null,
            withdrawals: [],
            certificates: [],
            memo: null,
          },
        ],
      }
    },

    async filterUsedAddresses(): Promise<Addresses> {
      return [Branded.asAddress(`${name}-used-addr`)]
    },

    async submitTransaction(): Promise<void> {
      // Mock implementation
    },

    async getAccountState(): Promise<AccountStateResponse> {
      return {[`${name}-addr`]: null}
    },

    async bulkGetAccountState(): Promise<AccountStateResponse> {
      return {[`${name}-bulk-addr`]: null}
    },

    async getPoolInfo(
      _request: StakePoolInfoRequest,
    ): Promise<StakePoolInfosAndHistories> {
      return {[`${name}-pool`]: null} as StakePoolInfosAndHistories
    },

    async fetchTxStatus(): Promise<TxStatusResponse> {
      return {submissionStatus: {[`${name}-tx`]: {status: 'SUCCESS'}}}
    },

    async checkServerStatus() {
      return {isServerOk: true, serverTime: Date.now()}
    },

    async getFundInfo() {
      return {
        currentFund: null,
        nextFund: null,
      }
    },
  })

  describe('adapter selection', () => {
    it('should use backend-zero adapter when preference is backend-zero', async () => {
      const backendZeroAdapter = createMockAdapter('backend-zero')
      const legacyAdapter = createMockAdapter('legacy')

      const preferences: EndpointPreference = {
        getTipStatus: 'backend-zero',
        fetchNewTxHistory: 'backend-zero',
        filterUsedAddresses: 'backend-zero',
        submitTransaction: 'backend-zero',
        getAccountState: 'backend-zero',
        bulkGetAccountState: 'backend-zero',
        getPoolInfo: 'backend-zero',
        fetchTxStatus: 'backend-zero',
        checkServerStatus: 'legacy',
        getFundInfo: 'legacy',
      }

      const api = cardanoApiManagerMaker({
        backendZeroAdapter,
        legacyAdapter,
        preferences,
      })

      const result = await api.getTipStatus()
      expect(result.bestBlock.hash).toBe('backend-zero-tip')
    })

    it('should use legacy adapter when preference is legacy', async () => {
      const backendZeroAdapter = createMockAdapter('backend-zero')
      const legacyAdapter = createMockAdapter('legacy')

      const preferences: EndpointPreference = {
        getTipStatus: 'legacy',
        fetchNewTxHistory: 'legacy',
        filterUsedAddresses: 'legacy',
        submitTransaction: 'legacy',
        getAccountState: 'legacy',
        bulkGetAccountState: 'legacy',
        getPoolInfo: 'legacy',
        fetchTxStatus: 'legacy',
        checkServerStatus: 'legacy',
        getFundInfo: 'legacy',
      }

      const api = cardanoApiManagerMaker({
        backendZeroAdapter,
        legacyAdapter,
        preferences,
      })

      const result = await api.getTipStatus()
      expect(result.bestBlock.hash).toBe('legacy-tip')
    })
  })

  describe('wallet context validation', () => {
    it('should require wallet context for backend-zero endpoints that need it', async () => {
      const backendZeroAdapter = createMockAdapter('backend-zero')
      const legacyAdapter = createMockAdapter('legacy')

      const preferences: EndpointPreference = {
        getTipStatus: 'backend-zero',
        fetchNewTxHistory: 'backend-zero',
        filterUsedAddresses: 'backend-zero',
        submitTransaction: 'backend-zero',
        getAccountState: 'backend-zero',
        bulkGetAccountState: 'backend-zero',
        getPoolInfo: 'backend-zero',
        fetchTxStatus: 'backend-zero',
        checkServerStatus: 'legacy',
        getFundInfo: 'legacy',
      }

      const api = cardanoApiManagerMaker({
        backendZeroAdapter,
        legacyAdapter,
        preferences,
      })

      // Should throw when context is missing for endpoints that require it
      await expect(
        api.fetchNewTxHistory({
          addresses: [],
          untilBlock: Branded.asBlockHash('block-hash'),
        }),
      ).rejects.toThrow(
        'Backend-zero endpoint fetchNewTxHistory requires wallet context',
      )

      await expect(
        api.filterUsedAddresses([Branded.asAddress('addr1')]),
      ).rejects.toThrow(
        'Backend-zero endpoint filterUsedAddresses requires wallet context',
      )

      await expect(
        api.getAccountState({addresses: [Branded.asAddress('addr1')]}),
      ).rejects.toThrow(
        'Backend-zero endpoint getAccountState requires wallet context',
      )

      await expect(
        api.bulkGetAccountState([Branded.asAddress('addr1')]),
      ).rejects.toThrow(
        'Backend-zero endpoint bulkGetAccountState requires wallet context',
      )
    })

    it('should not require wallet context for endpoints that do not need it', async () => {
      const backendZeroAdapter = createMockAdapter('backend-zero')
      const legacyAdapter = createMockAdapter('legacy')

      const preferences: EndpointPreference = {
        getTipStatus: 'backend-zero',
        fetchNewTxHistory: 'backend-zero',
        filterUsedAddresses: 'backend-zero',
        submitTransaction: 'backend-zero',
        getAccountState: 'backend-zero',
        bulkGetAccountState: 'backend-zero',
        getPoolInfo: 'backend-zero',
        fetchTxStatus: 'backend-zero',
        checkServerStatus: 'legacy',
        getFundInfo: 'legacy',
      }

      const api = cardanoApiManagerMaker({
        backendZeroAdapter,
        legacyAdapter,
        preferences,
      })

      // These should work without context
      await expect(api.getTipStatus()).resolves.toBeDefined()
      await expect(
        api.submitTransaction('signed-tx' as TransactionCborBase64),
      ).resolves.toBeUndefined()
      await expect(api.getPoolInfo({poolIds: ['pool1']})).resolves.toBeDefined()
      await expect(
        api.fetchTxStatus({txHashes: [Branded.asTransactionHash('hash1')]}),
      ).resolves.toBeDefined()
    })

    it('should work with wallet context provided', async () => {
      const backendZeroAdapter = createMockAdapter('backend-zero')
      const legacyAdapter = createMockAdapter('legacy')

      const preferences: EndpointPreference = {
        getTipStatus: 'backend-zero',
        fetchNewTxHistory: 'backend-zero',
        filterUsedAddresses: 'backend-zero',
        submitTransaction: 'backend-zero',
        getAccountState: 'backend-zero',
        bulkGetAccountState: 'backend-zero',
        getPoolInfo: 'backend-zero',
        fetchTxStatus: 'backend-zero',
        checkServerStatus: 'legacy',
        getFundInfo: 'legacy',
      }

      const api = cardanoApiManagerMaker({
        backendZeroAdapter,
        legacyAdapter,
        preferences,
      })

      await expect(
        api.fetchNewTxHistory(
          {addresses: [], untilBlock: Branded.asBlockHash('block-hash')},
          mockWalletContext,
        ),
      ).resolves.toBeDefined()

      await expect(
        api.filterUsedAddresses(
          [Branded.asAddress('addr1')],
          mockWalletContext,
        ),
      ).resolves.toBeDefined()

      await expect(
        api.getAccountState(
          {addresses: [Branded.asAddress('addr1')]},
          mockWalletContext,
        ),
      ).resolves.toBeDefined()

      await expect(
        api.bulkGetAccountState(
          [Branded.asAddress('addr1')],
          mockWalletContext,
        ),
      ).resolves.toBeDefined()
    })
  })

  describe('endpoint availability validation', () => {
    it('should throw error for invalid preference', () => {
      const backendZeroAdapter = createMockAdapter('backend-zero')
      const legacyAdapter = createMockAdapter('legacy')

      const preferences: EndpointPreference = {
        getTipStatus: 'backend-zero',
        fetchNewTxHistory: 'backend-zero',
        filterUsedAddresses: 'backend-zero',
        submitTransaction: 'backend-zero',
        getAccountState: 'backend-zero',
        bulkGetAccountState: 'backend-zero',
        getPoolInfo: 'backend-zero',
        fetchTxStatus: 'backend-zero',
        checkServerStatus: 'backend-zero' as CardanoBackend, // Invalid - only legacy supports this
        getFundInfo: 'legacy',
      }

      const api = cardanoApiManagerMaker({
        backendZeroAdapter,
        legacyAdapter,
        preferences,
      })

      if (!api.checkServerStatus) {
        throw new Error('checkServerStatus should not be available')
      }
      return expect(api.checkServerStatus()).rejects.toThrow(
        'Backend backend-zero does not support endpoint checkServerStatus',
      )
    })
  })

  describe('optional methods', () => {
    it('should handle checkServerStatus when available', async () => {
      const backendZeroAdapter = createMockAdapter('backend-zero')
      const legacyAdapter = createMockAdapter('legacy')

      const preferences: EndpointPreference = {
        getTipStatus: 'backend-zero',
        fetchNewTxHistory: 'backend-zero',
        filterUsedAddresses: 'backend-zero',
        submitTransaction: 'backend-zero',
        getAccountState: 'backend-zero',
        bulkGetAccountState: 'backend-zero',
        getPoolInfo: 'backend-zero',
        fetchTxStatus: 'backend-zero',
        checkServerStatus: 'legacy',
        getFundInfo: 'legacy',
      }

      const api = cardanoApiManagerMaker({
        backendZeroAdapter,
        legacyAdapter,
        preferences,
      })

      const result = await api.checkServerStatus!()
      expect(result.isServerOk).toBe(true)
      expect(result.serverTime).toBeDefined()
    })

    it('should handle getFundInfo when available', async () => {
      const backendZeroAdapter = createMockAdapter('backend-zero')
      const legacyAdapter = createMockAdapter('legacy')

      const preferences: EndpointPreference = {
        getTipStatus: 'backend-zero',
        fetchNewTxHistory: 'backend-zero',
        filterUsedAddresses: 'backend-zero',
        submitTransaction: 'backend-zero',
        getAccountState: 'backend-zero',
        bulkGetAccountState: 'backend-zero',
        getPoolInfo: 'backend-zero',
        fetchTxStatus: 'backend-zero',
        checkServerStatus: 'legacy',
        getFundInfo: 'legacy',
      }

      const api = cardanoApiManagerMaker({
        backendZeroAdapter,
        legacyAdapter,
        preferences,
      })

      const result = await api.getFundInfo!()
      expect(result.currentFund).toBeNull()
      expect(result.nextFund).toBeNull()
    })

    it('should throw error when optional method is not available', () => {
      const backendZeroAdapter = createMockAdapter('backend-zero')
      const legacyAdapterWithoutOptional = {
        ...createMockAdapter('legacy'),
        checkServerStatus: undefined,
        getFundInfo: undefined,
      }

      const preferences: EndpointPreference = {
        getTipStatus: 'backend-zero',
        fetchNewTxHistory: 'backend-zero',
        filterUsedAddresses: 'backend-zero',
        submitTransaction: 'backend-zero',
        getAccountState: 'backend-zero',
        bulkGetAccountState: 'backend-zero',
        getPoolInfo: 'backend-zero',
        fetchTxStatus: 'backend-zero',
        checkServerStatus: 'legacy',
        getFundInfo: 'legacy',
      }

      const api = cardanoApiManagerMaker({
        backendZeroAdapter,
        legacyAdapter: legacyAdapterWithoutOptional,
        preferences,
      })

      return expect(api.checkServerStatus!()).rejects.toThrow(
        'checkServerStatus not available',
      )
    })
  })
})
