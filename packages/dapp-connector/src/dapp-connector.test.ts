import {dappConnectorMaker, connectionStorageMaker} from './index'
import {storageMock} from './storage.mocks'
import {mockedData} from './mocks'

const getDappConnector = () => {
  const storage = connectionStorageMaker({...storageMock})
  return dappConnectorMaker(storage)
}

describe('DappConnector', () => {
  afterEach(() => {
    storageMock.clear()
  })

  describe('initialization', () => {
    it('should create init script', () => {
      const dappConnector = getDappConnector()
      const initScript = dappConnector.getWalletConnectorScript({
        iconUrl: 'example.png',
        apiVersion: '1.0.0',
        sessionId: '123',
        walletName: 'Yoroi Wallet',
      })
      expect(initScript).toMatch(/example\.png/)
      expect(initScript).toMatch(/Object\.freeze/)
    })
  })

  describe('connection management', () => {
    it('should return 0 connections if there are no connections', async () => {
      const dappConnector = getDappConnector()
      expect(await dappConnector.listAllConnections()).toHaveLength(0)
    })

    it('should not crash when trying to remove a connection that does not exist', async () => {
      const dappConnector = getDappConnector()
      await dappConnector.removeConnection({walletId, dappOrigin: 'fake-url'})
    })

    it('should add a connection', async () => {
      const dappConnector = getDappConnector()
      await dappConnector.addConnection({walletId, dappOrigin: 'fake-url'})
      expect(await dappConnector.listAllConnections()).toHaveLength(1)
    })

    it('should allow to add more than one connection per wallet', async () => {
      const dappConnector = getDappConnector()
      await dappConnector.addConnection({walletId: walletId, dappOrigin: 'fake-url'})
      await dappConnector.addConnection({walletId: walletId, dappOrigin: 'fake-url-2'})
      expect(await dappConnector.listAllConnections()).toHaveLength(2)
    })

    it('should remove a connection', async () => {
      const dappConnector = getDappConnector()
      await dappConnector.addConnection({walletId, dappOrigin: 'fake-url-1'})
      await dappConnector.addConnection({walletId, dappOrigin: 'fake-url-2'})
      await dappConnector.addConnection({walletId: 'new-wallet-id', dappOrigin: 'fake-url-1'})

      await dappConnector.removeConnection({walletId, dappOrigin: 'fake-url-1'})
      expect(await dappConnector.listAllConnections()).toEqual([
        {walletId, dappOrigin: 'fake-url-2'},
        {walletId: 'new-wallet-id', dappOrigin: 'fake-url-1'},
      ])
    })
  })

  describe('handling connection events', () => {
    it('should throw an error if the event is not known', async () => {
      const dappConnector = getDappConnector()
      const event = createEvent('unknown')
      const sendMessage = jest.fn()
      await dappConnector.handleEvent(event, trustedUrl, mockWallet, sendMessage)
      expect(sendMessage).toHaveBeenCalledWith(
        '1',
        null,
        new Error(`Unknown method 'unknown' with params {"browserContext":{"origin":"https://yoroi-wallet.com"}}`),
      )
    })

    it('should throw an error if the event malformed', async () => {
      const dappConnector = getDappConnector()
      const event = JSON.stringify({method: 'test'})
      const sendMessage = jest.fn()
      await dappConnector.handleEvent(event, trustedUrl, mockWallet, sendMessage)
      expect(sendMessage).toHaveBeenCalledWith(
        undefined,
        null,
        new Error(`Unknown method 'test' with params undefined`),
      )
    })

    it('should throw an error if the origins do not match', async () => {
      const dappConnector = getDappConnector()
      const event = createEvent('cardano_enable')
      const sendMessage = jest.fn()
      await dappConnector.handleEvent(event, 'https://another-url.com', mockWallet, sendMessage)
      const errorMessage = 'Origins do not match: https://yoroi-wallet.com !== https://another-url.com'
      expect(sendMessage).toHaveBeenCalledWith('1', null, new Error(errorMessage))
    })

    it('should handle log_message event without responding to client', async () => {
      const dappConnector = getDappConnector()
      const sendMessage = jest.fn()
      await dappConnector.handleEvent(createEvent('log_message', {args: [1, 2]}), trustedUrl, mockWallet, sendMessage)
      expect(sendMessage).not.toHaveBeenCalledWith(sendMessage)

      await dappConnector.handleEvent(createEvent('log_message'), trustedUrl, mockWallet, sendMessage)
    })

    it('should handle cardano_enable event with true if the user confirms connection', async () => {
      const dappConnector = getDappConnector()
      const event = createEvent('cardano_enable')
      const sendMessage = jest.fn()
      await dappConnector.handleEvent(
        event,
        trustedUrl,
        {...mockWallet, confirmConnection: () => Promise.resolve(true)},
        sendMessage,
      )
      expect(sendMessage).toHaveBeenCalledWith('1', true)
    })

    it('should handle cardano_enable event with false if the user does not confirm connection', async () => {
      const dappConnector = getDappConnector()
      const event = createEvent('cardano_enable')
      const sendMessage = jest.fn()
      await dappConnector.handleEvent(
        event,
        trustedUrl,
        {...mockWallet, confirmConnection: () => Promise.resolve(false)},
        sendMessage,
      )
      expect(sendMessage).toHaveBeenCalledWith('1', false)
    })

    it('should not rely on user confirmation if the dapp is enabled', async () => {
      const dappConnector = getDappConnector()
      const event = createEvent('cardano_enable')
      const sendMessage1 = jest.fn()
      const sendMessage2 = jest.fn()
      await dappConnector.handleEvent(
        event,
        trustedUrl,
        {...mockWallet, confirmConnection: () => Promise.resolve(true)},
        sendMessage1,
      )
      expect(sendMessage1).toHaveBeenCalledWith('1', true)
      await dappConnector.handleEvent(
        event,
        trustedUrl,
        {...mockWallet, confirmConnection: () => Promise.resolve(false)},
        sendMessage2,
      )
      expect(sendMessage2).toHaveBeenCalledWith('1', true)
    })

    it('should save dapp connection if cardano_enable is resolved', async () => {
      const dappConnector = getDappConnector()
      const event = createEvent('cardano_enable')
      const sendMessage = jest.fn()
      await dappConnector.handleEvent(
        event,
        trustedUrl,
        {...mockWallet, confirmConnection: () => Promise.resolve(true)},
        sendMessage,
      )
      expect(await dappConnector.listAllConnections()).toEqual([
        {walletId: walletId, dappOrigin: 'https://yoroi-wallet.com'},
      ])
    })

    it('should not save dapp connection if cardano_enable is rejected', async () => {
      const dappConnector = getDappConnector()
      const event = createEvent('cardano_enable')
      const sendMessage = jest.fn()
      await dappConnector.handleEvent(
        event,
        trustedUrl,
        {...mockWallet, confirmConnection: () => Promise.resolve(false)},
        sendMessage,
      )
      expect(await dappConnector.listAllConnections()).toEqual([])
    })

    it('should handle cardano_is_enabled event with false for unconnected wallets', async () => {
      const dappConnector = getDappConnector()
      const event = createEvent('cardano_is_enabled')
      const sendMessage = jest.fn()
      await dappConnector.handleEvent(event, trustedUrl, mockWallet, sendMessage)
      expect(sendMessage).toHaveBeenCalledWith('1', false)
    })

    it('should handle cardano_is_enabled event with true for connected wallets', async () => {
      const dappConnector = getDappConnector()
      const event = createEvent('cardano_is_enabled')
      const sendMessage = jest.fn()
      await dappConnector.addConnection({walletId: walletId, dappOrigin: 'https://yoroi-wallet.com'})
      await dappConnector.handleEvent(
        event,
        trustedUrl,
        {...mockWallet, confirmConnection: () => Promise.resolve(true)},
        sendMessage,
      )
      expect(sendMessage).toHaveBeenCalledWith('1', true)
    })
  })

  describe('api calls', () => {
    it('should throw an error if api method is not known', async () => {
      const dappConnector = getDappConnector()
      const sendMessage = jest.fn()

      await dappConnector.handleEvent(createEvent('api.unknown'), trustedUrl, mockWallet, sendMessage)
      expect(sendMessage).toHaveBeenCalledWith('1', null, new Error(`Unknown method api.unknown`))

      await dappConnector.handleEvent(createEvent('api.unknown.something'), trustedUrl, mockWallet, sendMessage)
      expect(sendMessage).toHaveBeenCalledWith('1', null, new Error(`Invalid method api.unknown.something`))
    })

    it('should throw an error if user has not approved connection', async () => {
      const dappConnector = getDappConnector()
      const sendMessage = jest.fn()
      await dappConnector.handleEvent(createEvent('api.getBalance'), trustedUrl, mockWallet, sendMessage)
      const errorMessage =
        'Wallet b5d94758-26c5-48b0-af2b-6e68c3ef2dbf has not accepted the connection to https://yoroi-wallet.com'
      expect(sendMessage).toHaveBeenCalledWith('1', null, new Error(errorMessage))
    })

    it('should resolve getNetworkId with given networkId', async () => {
      const dappConnector = getDappConnector()
      const sendMessage = jest.fn()
      await dappConnector.addConnection({walletId: walletId, dappOrigin: 'https://yoroi-wallet.com'})
      await dappConnector.handleEvent(createEvent('api.getNetworkId'), trustedUrl, mockWallet, sendMessage)
      expect(sendMessage).toHaveBeenCalledWith('1', mockWallet.networkId)
    })

    it('should resolve getBalance with mocked data', async () => {
      const dappConnector = getDappConnector()
      const sendMessage = jest.fn()
      await dappConnector.addConnection({walletId, dappOrigin: 'https://yoroi-wallet.com'})
      await dappConnector.handleEvent(createEvent('api.getBalance'), trustedUrl, mockWallet, sendMessage)
      expect(sendMessage).toHaveBeenCalledWith('1', mockedData[walletId].balance)
    })

    it('should resolve getChangeAddresses with mocked data', async () => {
      const dappConnector = getDappConnector()
      const sendMessage = jest.fn()
      await dappConnector.addConnection({walletId, dappOrigin: 'https://yoroi-wallet.com'})
      await dappConnector.handleEvent(createEvent('api.getChangeAddresses'), trustedUrl, mockWallet, sendMessage)
      expect(sendMessage).toHaveBeenCalledWith('1', mockedData[walletId].changeAddresses)
    })

    it('should resolve getRewardAddresses with mocked data', async () => {
      const dappConnector = getDappConnector()
      const sendMessage = jest.fn()
      await dappConnector.addConnection({walletId, dappOrigin: 'https://yoroi-wallet.com'})
      await dappConnector.handleEvent(createEvent('api.getRewardAddresses'), trustedUrl, mockWallet, sendMessage)
      expect(sendMessage).toHaveBeenCalledWith('1', mockedData[walletId].rewardAddresses)
    })

    it('should resolve getUsedAddresses with mocked data', async () => {
      const dappConnector = getDappConnector()
      const sendMessage = jest.fn()
      await dappConnector.addConnection({walletId, dappOrigin: 'https://yoroi-wallet.com'})
      await dappConnector.handleEvent(createEvent('api.getUsedAddresses'), trustedUrl, mockWallet, sendMessage)
      expect(sendMessage).toHaveBeenCalledWith('1', mockedData[walletId].usedAddresses)
    })
  })
})

const createEvent = (method: string, params?: object) => {
  return JSON.stringify({id: '1', method, params: {...params, browserContext: {origin: 'https://yoroi-wallet.com'}}})
}

const walletId = 'b5d94758-26c5-48b0-af2b-6e68c3ef2dbf'

const mockWallet = {id: walletId, networkId: 1, confirmConnection: async () => true}
const trustedUrl = 'https://yoroi-wallet.com/'
