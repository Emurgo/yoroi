import {StakePoolInfoRequest, StakePoolInfosAndHistories} from '@yoroi/staking'

import {
  AccountStateResponse,
  RawTransaction,
  TipStatusResponse,
  TxStatusResponse,
} from './api-types'
import {cardanoApiManagerMaker} from './manager'
import {
  CardanoApiAdapter,
  CardanoBackend,
  EndpointPreference,
  WalletContext,
} from './types'

describe('cardanoApiManagerMaker', () => {
  const mockWalletContext: WalletContext = {
    walletId: 'test-wallet-id',
    publicKeyHex: 'test-public-key',
    accountPubKeyHex: 'test-account-key',
    paymentKeyHashes: ['hash1', 'hash2'],
    rewardAddresses: ['addr1'],
  }

  const createMockAdapter = (name: string): CardanoApiAdapter => ({
    async getTipStatus(): Promise<TipStatusResponse> {
      return {
        bestBlock: {
          hash: `${name}-tip`,
          height: 100,
          epoch: null,
          slot: null,
          globalSlot: null,
        },
        safeBlock: {
          hash: `${name}-safe`,
          height: 99,
          epoch: null,
          slot: null,
          globalSlot: null,
        },
      }
    },

    async fetchNewTxHistory(): Promise<{
      isLast: boolean
      transactions: Array<RawTransaction>
    }> {
      return {
        isLast: true,
        transactions: [{type: 'shelley', hash: `${name}-tx`} as RawTransaction],
      }
    },

    async filterUsedAddresses(): Promise<string[]> {
      return [`${name}-used-addr`]
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
        api.fetchNewTxHistory({addresses: [], untilBlock: 'block-hash'}),
      ).rejects.toThrow(
        'Backend-zero endpoint fetchNewTxHistory requires wallet context',
      )

      await expect(api.filterUsedAddresses(['addr1'])).rejects.toThrow(
        'Backend-zero endpoint filterUsedAddresses requires wallet context',
      )

      await expect(api.getAccountState({addresses: ['addr1']})).rejects.toThrow(
        'Backend-zero endpoint getAccountState requires wallet context',
      )

      await expect(api.bulkGetAccountState(['addr1'])).rejects.toThrow(
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
      await expect(api.submitTransaction('signed-tx')).resolves.toBeUndefined()
      await expect(api.getPoolInfo({poolIds: ['pool1']})).resolves.toBeDefined()
      await expect(
        api.fetchTxStatus({txHashes: ['hash1']}),
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
          {addresses: [], untilBlock: 'block-hash'},
          mockWalletContext,
        ),
      ).resolves.toBeDefined()

      await expect(
        api.filterUsedAddresses(['addr1'], mockWalletContext),
      ).resolves.toBeDefined()

      await expect(
        api.getAccountState({addresses: ['addr1']}, mockWalletContext),
      ).resolves.toBeDefined()

      await expect(
        api.bulkGetAccountState(['addr1'], mockWalletContext),
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
