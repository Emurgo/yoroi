import {Chain} from '@yoroi/types'

import {init} from '@emurgo/cross-csl-nodejs'

import {connectionStorageMaker, Storage} from './adapters/async-storage'
import {resolverHandleEvent, ResolverWallet} from './resolver'
import {storageMock} from './storage.mocks'

const CSL = init('test')
const walletId = 'test-wallet-id'

const createMockWallet = (overrides?: Partial<ResolverWallet>): ResolverWallet => {
  return {
    id: walletId,
    networkId: 1,
    network: Chain.Network.Mainnet,
    confirmConnection: jest.fn().mockResolvedValue(true),
    getBalance: jest.fn().mockResolvedValue(CSL.Value.fromHex('1a062ea8a0')),
    getUnusedAddresses: jest.fn().mockReturnValue([]),
    getUsedAddresses: jest.fn().mockReturnValue([]),
    getChangeAddress: jest.fn().mockReturnValue(
      CSL.Address.fromHex(
        '017ef00ee3672330155382a2857573868af466b88aa8c4081f45583e1784d958399bcce03402fd853d43a4e7366f2018932e5aff4eea904693',
      ),
    ),
    getRewardAddresses: jest.fn().mockReturnValue([]),
    getUtxos: jest.fn().mockResolvedValue([]),
    getCollateral: jest.fn().mockResolvedValue([]),
    getCollateralInfo: jest.fn().mockReturnValue({
      collateralId: '',
      isConfirmed: false,
    }),
    submitTx: jest.fn().mockResolvedValue('tx-id'),
    signTx: jest.fn().mockResolvedValue('signed-tx'),
    signData: jest.fn().mockResolvedValue({signature: 'sig', key: 'key'}),
    sendReorganisationTx: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}

const createMockStorage = (): Storage => {
  return connectionStorageMaker({storage: storageMock})
}

describe('resolver', () => {
  beforeEach(() => {
    storageMock.clear()
    jest.clearAllMocks()
  })

  describe('resolverHandleEvent', () => {
    it('should return early if eventData is not a string', async () => {
      const wallet = createMockWallet()
      const storage = createMockStorage()
      const sendMessage = jest.fn()

      await resolverHandleEvent(
        null,
        'https://example.com',
        wallet,
        sendMessage,
        storage,
        [],
      )

      expect(sendMessage).not.toHaveBeenCalled()
    })

    it('should return early if JSON parsing fails', async () => {
      const wallet = createMockWallet()
      const storage = createMockStorage()
      const sendMessage = jest.fn()

      await resolverHandleEvent(
        'invalid json',
        'https://example.com',
        wallet,
        sendMessage,
        storage,
        [],
      )

      expect(sendMessage).not.toHaveBeenCalled()
    })

    it('should return early if source is not dapp-connector', async () => {
      const wallet = createMockWallet()
      const storage = createMockStorage()
      const sendMessage = jest.fn()

      await resolverHandleEvent(
        JSON.stringify({
          id: '1',
          method: 'api.getBalance',
          params: {},
          source: 'other-source',
        }),
        'https://example.com',
        wallet,
        sendMessage,
        storage,
        [],
      )

      expect(sendMessage).not.toHaveBeenCalled()
    })

    it('should return early if id is not a string', async () => {
      const wallet = createMockWallet()
      const storage = createMockStorage()
      const sendMessage = jest.fn()

      await resolverHandleEvent(
        JSON.stringify({
          id: 123,
          method: 'api.getBalance',
          params: {},
          source: 'dapp-connector',
        }),
        'https://example.com',
        wallet,
        sendMessage,
        storage,
        [],
      )

      expect(sendMessage).not.toHaveBeenCalled()
    })

    it('should return early if method is not a string', async () => {
      const wallet = createMockWallet()
      const storage = createMockStorage()
      const sendMessage = jest.fn()

      await resolverHandleEvent(
        JSON.stringify({
          id: '1',
          method: 123,
          params: {},
          source: 'dapp-connector',
        }),
        'https://example.com',
        wallet,
        sendMessage,
        storage,
        [],
      )

      expect(sendMessage).not.toHaveBeenCalled()
    })

    it('should return early if params is not a record', async () => {
      const wallet = createMockWallet()
      const storage = createMockStorage()
      const sendMessage = jest.fn()

      await resolverHandleEvent(
        JSON.stringify({
          id: '1',
          method: 'api.getBalance',
          params: 'not-an-object',
          source: 'dapp-connector',
        }),
        'https://example.com',
        wallet,
        sendMessage,
        storage,
        [],
      )

      expect(sendMessage).not.toHaveBeenCalled()
    })

    it('should handle log_message event without sending message', async () => {
      const wallet = createMockWallet()
      const storage = createMockStorage()
      await storage.save({
        walletId: wallet.id,
        dappOrigin: 'https://example.com',
        network: Chain.Network.Mainnet,
      })
      const sendMessage = jest.fn()

      await resolverHandleEvent(
        JSON.stringify({
          id: '1',
          method: 'log_message',
          params: {
            args: ['test message'],
            browserContext: {origin: 'https://example.com'},
          },
          source: 'dapp-connector',
        }),
        'https://example.com',
        wallet,
        sendMessage,
        storage,
        [],
      )

      // log_message should not send a message
      expect(sendMessage).not.toHaveBeenCalled()
    })

    it('should handle log_message with non-string args', async () => {
      const wallet = createMockWallet()
      const storage = createMockStorage()
      await storage.save({
        walletId: wallet.id,
        dappOrigin: 'https://example.com',
        network: Chain.Network.Mainnet,
      })
      const sendMessage = jest.fn()

      await resolverHandleEvent(
        JSON.stringify({
          id: '1',
          method: 'log_message',
          params: {
            args: [123, {key: 'value'}, null],
            browserContext: {origin: 'https://example.com'},
          },
          source: 'dapp-connector',
        }),
        'https://example.com',
        wallet,
        sendMessage,
        storage,
        [],
      )

      expect(sendMessage).not.toHaveBeenCalled()
    })

    it('should handle log_message when params.args is not an array', async () => {
      const wallet = createMockWallet()
      const storage = createMockStorage()
      await storage.save({
        walletId: wallet.id,
        dappOrigin: 'https://example.com',
        network: Chain.Network.Mainnet,
      })
      const sendMessage = jest.fn()

      await resolverHandleEvent(
        JSON.stringify({
          id: '1',
          method: 'log_message',
          params: {
            args: 'not-an-array',
            browserContext: {origin: 'https://example.com'},
          },
          source: 'dapp-connector',
        }),
        'https://example.com',
        wallet,
        sendMessage,
        storage,
        [],
      )

      expect(sendMessage).not.toHaveBeenCalled()
    })

    it('should handle errors and send error message', async () => {
      const wallet = createMockWallet({
        getBalance: jest.fn().mockRejectedValue(new Error('Test error')),
      })
      const storage = createMockStorage()
      await storage.save({
        walletId: wallet.id,
        dappOrigin: 'https://example.com',
        network: Chain.Network.Mainnet,
      })
      const sendMessage = jest.fn()

      await resolverHandleEvent(
        JSON.stringify({
          id: '1',
          method: 'api.getBalance',
          params: {
            args: [],
            browserContext: {origin: 'https://example.com'},
          },
          source: 'dapp-connector',
        }),
        'https://example.com',
        wallet,
        sendMessage,
        storage,
        [],
      )

      expect(sendMessage).toHaveBeenCalledWith('1', null, expect.any(Error))
    })
  })
})

