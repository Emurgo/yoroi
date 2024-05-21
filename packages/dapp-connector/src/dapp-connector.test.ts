import {storageMock} from './storage.mocks'
import {mockedData} from './mocks'
import {connectionStorageMaker} from './adapters/async-storage'
import {dappConnectorMaker} from './dapp-connector'
import {Api, dappConnectorApiMaker} from './adapters/api'
import {mockedDAppList} from './manager.mocks'
import {ResolverWallet} from './resolver'
import {init} from '@emurgo/cross-csl-nodejs'
import {TransactionWitnessSet} from '@emurgo/cross-csl-core'

const getDappConnector = (wallet = mockWallet) => {
  const storage = connectionStorageMaker({storage: storageMock})
  const api: Api = {
    getDApps: async () => mockedDAppList,
  }
  return dappConnectorMaker(storage, wallet, api)
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
    it('should init with default storage', async () => {
      const storage = connectionStorageMaker()
      const api = dappConnectorApiMaker()
      const connector = dappConnectorMaker(storage, mockWallet, api)
      expect(connector).toBeDefined()
    })

    it('should return 0 connections if there are no connections', async () => {
      const dappConnector = getDappConnector()
      expect(await dappConnector.listAllConnections()).toHaveLength(0)
    })

    it('should not crash when trying to remove a connection that does not exist', async () => {
      const dappConnector = getDappConnector()
      await dappConnector.removeConnection({dappOrigin: 'fake-url'})
    })

    it('should add a connection', async () => {
      const dappConnector = getDappConnector()
      await dappConnector.addConnection({dappOrigin: 'fake-url'})
      expect(await dappConnector.listAllConnections()).toHaveLength(1)
    })

    it('should allow to add more than one connection per wallet', async () => {
      const dappConnector = getDappConnector()
      await dappConnector.addConnection({dappOrigin: 'fake-url'})
      await dappConnector.addConnection({dappOrigin: 'fake-url-2'})
      expect(await dappConnector.listAllConnections()).toHaveLength(2)
    })

    it('should remove a connection', async () => {
      const dappConnector = getDappConnector()
      await dappConnector.addConnection({dappOrigin: 'fake-url-1'})
      await dappConnector.addConnection({dappOrigin: 'fake-url-2'})
      await dappConnector.addConnection({walletId: 'new-wallet-id', dappOrigin: 'fake-url-1'})

      await dappConnector.removeConnection({dappOrigin: 'fake-url-1'})
      expect(await dappConnector.listAllConnections()).toEqual([
        {walletId, dappOrigin: 'fake-url-2'},
        {walletId: 'new-wallet-id', dappOrigin: 'fake-url-1'},
      ])
    })

    it('should throw an error if connection already exists', async () => {
      const dappConnector = getDappConnector()
      await dappConnector.addConnection({dappOrigin: 'fake-url'})
      await expect(dappConnector.addConnection({walletId, dappOrigin: 'fake-url'})).rejects.toThrow(
        `Connection already exists: {"walletId":"${walletId}","dappOrigin":"fake-url"}`,
      )
    })
  })

  describe('handling connection events', () => {
    it('should throw an error if the event is not known', async () => {
      const dappConnector = getDappConnector()
      const event = createEvent('unknown')
      const sendMessage = jest.fn()
      await dappConnector.handleEvent(event, trustedUrl, sendMessage)
      expect(sendMessage).toHaveBeenCalledWith(
        '1',
        null,
        new Error(
          `Unknown method 'unknown' with params {"args":[],"browserContext":{"origin":"https://yoroi-wallet.com"}}`,
        ),
      )
    })

    it('should throw an error if the event malformed', async () => {
      const dappConnector = getDappConnector()
      const event = JSON.stringify({method: 'test'})
      const sendMessage = jest.fn()
      await dappConnector.handleEvent(event, trustedUrl, sendMessage)
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
      await dappConnector.handleEvent(event, 'https://another-url.com', sendMessage)
      const errorMessage = 'Origins do not match: https://yoroi-wallet.com !== https://another-url.com'
      expect(sendMessage).toHaveBeenCalledWith('1', null, new Error(errorMessage))
    })

    it('should handle log_message event without responding to client', async () => {
      const dappConnector = getDappConnector()
      const sendMessage = jest.fn()
      await dappConnector.handleEvent(createEvent('log_message', {args: [1, 2]}), trustedUrl, sendMessage)
      expect(sendMessage).not.toHaveBeenCalledWith(sendMessage)

      await dappConnector.handleEvent(createEvent('log_message'), trustedUrl, sendMessage)
    })

    it('should ignore log_message event if it has no arguments', async () => {
      const dappConnector = getDappConnector()
      const sendMessage = jest.fn()
      await dappConnector.handleEvent(createEvent('log_message', {args: undefined}), trustedUrl, sendMessage)
      expect(sendMessage).not.toHaveBeenCalledWith(sendMessage)
    })

    it('should handle cardano_enable event with true if the user confirms connection', async () => {
      const dappConnector = getDappConnector({...mockWallet, confirmConnection: () => Promise.resolve(true)})
      const event = createEvent('cardano_enable')
      const sendMessage = jest.fn()
      await dappConnector.handleEvent(event, trustedUrl, sendMessage)
      expect(sendMessage).toHaveBeenCalledWith('1', true)
    })

    it('should handle cardano_enable event with false if the user does not confirm connection', async () => {
      const dappConnector = getDappConnector({...mockWallet, confirmConnection: () => Promise.resolve(false)})
      const event = createEvent('cardano_enable')
      const sendMessage = jest.fn()
      await dappConnector.handleEvent(event, trustedUrl, sendMessage)
      expect(sendMessage).toHaveBeenCalledWith('1', false)
    })

    it('should not rely on user confirmation if the dapp is enabled', async () => {
      const wallet = {...mockWallet, confirmConnection: () => Promise.resolve(true)}
      const dappConnector = getDappConnector(wallet)
      const event = createEvent('cardano_enable')
      const sendMessage1 = jest.fn()
      const sendMessage2 = jest.fn()
      await dappConnector.handleEvent(event, trustedUrl, sendMessage1)
      expect(sendMessage1).toHaveBeenCalledWith('1', true)
      wallet.confirmConnection = () => Promise.resolve(false)
      await dappConnector.handleEvent(event, trustedUrl, sendMessage2)
      expect(sendMessage2).toHaveBeenCalledWith('1', true)
    })

    it('should save dapp connection if cardano_enable is resolved', async () => {
      const dappConnector = getDappConnector({...mockWallet, confirmConnection: () => Promise.resolve(true)})
      const event = createEvent('cardano_enable')
      const sendMessage = jest.fn()
      await dappConnector.handleEvent(event, trustedUrl, sendMessage)
      expect(await dappConnector.listAllConnections()).toEqual([
        {walletId: walletId, dappOrigin: 'https://yoroi-wallet.com'},
      ])
    })

    it('should not save dapp connection if cardano_enable is rejected', async () => {
      const dappConnector = getDappConnector({...mockWallet, confirmConnection: () => Promise.resolve(false)})
      const event = createEvent('cardano_enable')
      const sendMessage = jest.fn()
      await dappConnector.handleEvent(event, trustedUrl, sendMessage)
      expect(await dappConnector.listAllConnections()).toEqual([])
    })

    it('should handle cardano_is_enabled event with false for unconnected wallets', async () => {
      const dappConnector = getDappConnector()
      const event = createEvent('cardano_is_enabled')
      const sendMessage = jest.fn()
      await dappConnector.handleEvent(event, trustedUrl, sendMessage)
      expect(sendMessage).toHaveBeenCalledWith('1', false)
    })

    it('should handle cardano_is_enabled event with true for connected wallets', async () => {
      const dappConnector = getDappConnector({...mockWallet, confirmConnection: () => Promise.resolve(true)})
      const event = createEvent('cardano_is_enabled')
      const sendMessage = jest.fn()
      await dappConnector.addConnection({walletId: walletId, dappOrigin: 'https://yoroi-wallet.com'})
      await dappConnector.handleEvent(event, trustedUrl, sendMessage)
      expect(sendMessage).toHaveBeenCalledWith('1', true)
    })
  })

  describe('api calls', () => {
    it('should throw an error if api method is not known', async () => {
      const dappConnector = getDappConnector()
      const sendMessage = jest.fn()

      await dappConnector.handleEvent(createEvent('api.unknown'), trustedUrl, sendMessage)
      expect(sendMessage).toHaveBeenCalledWith('1', null, new Error(`Unknown method api.unknown`))

      await dappConnector.handleEvent(createEvent('api.unknown.something'), trustedUrl, sendMessage)
      expect(sendMessage).toHaveBeenCalledWith('1', null, new Error(`Invalid method api.unknown.something`))
    })

    it('should throw an error if user has not approved connection', async () => {
      const dappConnector = getDappConnector()
      const sendMessage = jest.fn()
      await dappConnector.handleEvent(createEvent('api.getBalance'), trustedUrl, sendMessage)
      const errorMessage =
        'Wallet b5d94758-26c5-48b0-af2b-6e68c3ef2dbf has not accepted the connection to https://yoroi-wallet.com'
      expect(sendMessage).toHaveBeenCalledWith('1', null, new Error(errorMessage))
    })

    it('should resolve getNetworkId with given networkId', async () => {
      const dappConnector = getDappConnector()
      const sendMessage = jest.fn()
      await dappConnector.addConnection({walletId: walletId, dappOrigin: 'https://yoroi-wallet.com'})
      await dappConnector.handleEvent(createEvent('api.getNetworkId'), trustedUrl, sendMessage)
      expect(sendMessage).toHaveBeenCalledWith('1', mockWallet.networkId)
    })

    it('should resolve getBalance with mocked data', async () => {
      const dappConnector = getDappConnector()
      const sendMessage = jest.fn()
      await dappConnector.addConnection({walletId, dappOrigin: 'https://yoroi-wallet.com'})
      await dappConnector.handleEvent(createEvent('api.getBalance'), trustedUrl, sendMessage)
      expect(sendMessage).toHaveBeenCalledWith('1', mockedData[walletId].balance)
    })

    it('should throw in getBalance with when incorrect arguments are presented', async () => {
      const dappConnector = getDappConnector()
      const sendMessage = jest.fn()
      await dappConnector.addConnection({walletId, dappOrigin: 'https://yoroi-wallet.com'})
      await dappConnector.handleEvent(createEvent('api.getBalance', {args: [1]}), trustedUrl, sendMessage)
      expect(sendMessage).toHaveBeenCalledWith('1', null, new Error(`Invalid params`))
    })

    it('should resolve getChangeAddress with mocked data', async () => {
      const dappConnector = getDappConnector()
      const sendMessage = jest.fn()
      await dappConnector.addConnection({walletId, dappOrigin: 'https://yoroi-wallet.com'})
      await dappConnector.handleEvent(createEvent('api.getChangeAddress'), trustedUrl, sendMessage)
      expect(sendMessage).toHaveBeenCalledWith('1', mockedData[walletId].changeAddresses[0])
    })

    it('should resolve getRewardAddresses with mocked data', async () => {
      const dappConnector = getDappConnector()
      const sendMessage = jest.fn()
      await dappConnector.addConnection({walletId, dappOrigin: 'https://yoroi-wallet.com'})
      await dappConnector.handleEvent(createEvent('api.getRewardAddresses'), trustedUrl, sendMessage)
      expect(sendMessage).toHaveBeenCalledWith('1', mockedData[walletId].rewardAddresses)
    })

    it('should resolve getUsedAddresses with mocked data', async () => {
      const dappConnector = getDappConnector({
        ...mockWallet,
        getUsedAddresses: () => Promise.resolve([{toHex: () => '00'}] as any),
      })
      const sendMessage = jest.fn()
      await dappConnector.addConnection({walletId, dappOrigin: 'https://yoroi-wallet.com'})
      await dappConnector.handleEvent(createEvent('api.getUsedAddresses'), trustedUrl, sendMessage)
      expect(sendMessage).toHaveBeenCalledWith('1', ['00'])
    })

    it('should resolve getUsedAddresses with mocked data also when pagination is provided', async () => {
      const dappConnector = getDappConnector({
        ...mockWallet,
        getUsedAddresses: () => Promise.resolve([{toHex: () => '00'}] as any),
      })
      const sendMessage = jest.fn()
      await dappConnector.addConnection({walletId, dappOrigin: 'https://yoroi-wallet.com'})
      await dappConnector.handleEvent(
        createEvent('api.getUsedAddresses', {
          args: [{page: 1, limit: 1}],
        }),
        trustedUrl,
        sendMessage,
      )
      expect(sendMessage).toHaveBeenCalledWith('1', ['00'])
    })

    it('should resolve signTx with mocked data if partial sign is unknown', async () => {
      const dappConnector = getDappConnector()
      const sendMessage = jest.fn()
      await dappConnector.addConnection({walletId, dappOrigin: 'https://yoroi-wallet.com'})
      await dappConnector.handleEvent(createEvent('api.signTx', {args: ['CBOR']}), trustedUrl, sendMessage)
      expect(sendMessage).toHaveBeenCalledTimes(1)
      const result: TransactionWitnessSet = sendMessage.mock.calls[0][1]
      expect(await result.toHex()).toBe('a0')
    })

    it('should resolve signTx with mocked data if partial sign is known', async () => {
      const dappConnector = getDappConnector()
      const sendMessage = jest.fn()
      await dappConnector.addConnection({walletId, dappOrigin: 'https://yoroi-wallet.com'})
      await dappConnector.handleEvent(createEvent('api.signTx', {args: ['CBOR', true]}), trustedUrl, sendMessage)
      expect(sendMessage).toHaveBeenCalledTimes(1)
      const result: TransactionWitnessSet = sendMessage.mock.calls[0][1]
      expect(await result.toHex()).toBe('a0')
    })

    it('should throw in signTx with when incorrect arguments are presented', async () => {
      const dappConnector = getDappConnector()
      const sendMessage = jest.fn()
      await dappConnector.addConnection({walletId, dappOrigin: 'https://yoroi-wallet.com'})
      await dappConnector.handleEvent(createEvent('api.signTx', {args: []}), trustedUrl, sendMessage)
      expect(sendMessage).toHaveBeenCalledWith('1', null, new Error(`Invalid params`))
    })

    it('should resolve signData with mocked data', async () => {
      const dappConnector = getDappConnector()
      const sendMessage = jest.fn()
      await dappConnector.addConnection({walletId, dappOrigin: 'https://yoroi-wallet.com'})
      await dappConnector.handleEvent(
        createEvent('api.signData', {
          args: [
            'addr1qxxvt9rzpdxxysmqp50d7f5a3gdescgrejsu7zsdxqjy8yun4cngaq46gr8c9qyz4td9ddajzqhjnrqvfh0gspzv9xnsmq6nqx',
            'CBOR',
          ],
        }),
        trustedUrl,
        sendMessage,
      )
      expect(sendMessage).toHaveBeenCalledWith('1', {key: '', signature: ''})
    })

    it('should throw in signData with when incorrect arguments are presented', async () => {
      const dappConnector = getDappConnector()
      const sendMessage = jest.fn()
      await dappConnector.addConnection({walletId, dappOrigin: 'https://yoroi-wallet.com'})
      await dappConnector.handleEvent(createEvent('api.signData', {args: []}), trustedUrl, sendMessage)
      expect(sendMessage).toHaveBeenCalledWith('1', null, new Error(`Invalid params`))
    })

    it('should resolve submitTx with mocked data', async () => {
      const dappConnector = getDappConnector()
      const sendMessage = jest.fn()
      await dappConnector.addConnection({walletId, dappOrigin: 'https://yoroi-wallet.com'})
      await dappConnector.handleEvent(createEvent('api.submitTx', {args: ['CBOR']}), trustedUrl, sendMessage)
      expect(sendMessage).toHaveBeenCalledWith('1', 'tx-id')
    })

    it('should throw in submitTx with when incorrect arguments are presented', async () => {
      const dappConnector = getDappConnector()
      const sendMessage = jest.fn()
      await dappConnector.addConnection({walletId, dappOrigin: 'https://yoroi-wallet.com'})
      await dappConnector.handleEvent(createEvent('api.submitTx', {args: []}), trustedUrl, sendMessage)
      expect(sendMessage).toHaveBeenCalledWith('1', null, new Error(`Invalid params`))
    })

    it('should resolve getCollateral with mocked data', async () => {
      const dappConnector = getDappConnector({
        ...mockWallet,
        getCollateral: () => Promise.resolve([{toHex: () => '00'}] as any),
      })
      const sendMessage = jest.fn()
      await dappConnector.addConnection({walletId, dappOrigin: 'https://yoroi-wallet.com'})
      await dappConnector.handleEvent(createEvent('api.getCollateral'), trustedUrl, sendMessage)
      expect(sendMessage).toHaveBeenCalledWith('1', ['00'])
    })

    it('should resolve getCollateral with null if not enough funds', async () => {
      const dappConnector = getDappConnector()
      const sendMessage = jest.fn()
      await dappConnector.addConnection({walletId, dappOrigin: 'https://yoroi-wallet.com'})
      await dappConnector.handleEvent(createEvent('api.getCollateral', {args: ['100000000']}), trustedUrl, sendMessage)
      expect(sendMessage).toHaveBeenCalledWith('1', null)
    })

    it('should resolve getUnusedAddresses with mocked data', async () => {
      const dappConnector = getDappConnector({
        ...mockWallet,
        getUnusedAddresses: () => Promise.resolve([{toHex: () => '00'}] as any),
      })
      const sendMessage = jest.fn()
      await dappConnector.addConnection({walletId, dappOrigin: 'https://yoroi-wallet.com'})
      await dappConnector.handleEvent(createEvent('api.getUnusedAddresses'), trustedUrl, sendMessage)
      expect(sendMessage).toHaveBeenCalledWith('1', ['00'])
    })

    it('should resolve getExtensions with CIP30', async () => {
      const dappConnector = getDappConnector()
      const sendMessage = jest.fn()
      await dappConnector.addConnection({walletId, dappOrigin: 'https://yoroi-wallet.com'})
      await dappConnector.handleEvent(createEvent('api.getExtensions'), trustedUrl, sendMessage)
      expect(sendMessage).toHaveBeenCalledWith('1', [{cip: 30}])
    })

    it('should resolve getUtxos with mocked data', async () => {
      const dappConnector = getDappConnector({
        ...mockWallet,
        getUtxos: () => Promise.resolve([{toHex: () => '00'}] as any),
      })
      const sendMessage = jest.fn()
      await dappConnector.addConnection({walletId, dappOrigin: 'https://yoroi-wallet.com'})
      await dappConnector.handleEvent(createEvent('api.getUtxos'), trustedUrl, sendMessage)
      expect(sendMessage).toHaveBeenCalledWith('1', ['00'])
    })

    it('should resolve getUtxos with mocked data also when pagination is provided', async () => {
      const dappConnector = getDappConnector({
        ...mockWallet,
        getUtxos: () => Promise.resolve([{toHex: () => '00'}] as any),
      })
      const sendMessage = jest.fn()
      await dappConnector.addConnection({walletId, dappOrigin: 'https://yoroi-wallet.com'})
      await dappConnector.handleEvent(
        createEvent('api.getUtxos', {
          args: ['100000000', {page: 1, limit: 1}],
        }),
        trustedUrl,
        sendMessage,
      )
      expect(sendMessage).toHaveBeenCalledWith('1', ['00'])
    })

    it('should resolve getUtxos with null if not enough funds', async () => {
      const dappConnector = getDappConnector()
      const sendMessage = jest.fn()
      await dappConnector.addConnection({walletId, dappOrigin: 'https://yoroi-wallet.com'})
      await dappConnector.handleEvent(createEvent('api.getUtxos', {args: ['100000000']}), trustedUrl, sendMessage)
      expect(sendMessage).toHaveBeenCalledWith('1', null)
    })
  })

  describe('getDAppList', () => {
    it('should return list of dapps and filters', async () => {
      const dappConnector = getDappConnector()
      expect(await dappConnector.getDAppList()).toEqual(mockedDAppList)
    })
  })
})

const createEvent = (method: string, params?: object) => {
  return JSON.stringify({
    id: '1',
    method,
    params: {args: [], ...params, browserContext: {origin: 'https://yoroi-wallet.com'}},
  })
}

const walletId = 'b5d94758-26c5-48b0-af2b-6e68c3ef2dbf'

const CSL = init('test')
const mockWallet: ResolverWallet = {
  signTx: () => Promise.resolve(CSL.TransactionWitnessSet.new()),
  signData: () => Promise.resolve({key: '', signature: ''}),
  id: walletId,
  networkId: 1,
  confirmConnection: async () => true,
  getBalance: () => CSL.Value.fromHex('1a062ea8a0'),
  getUnusedAddresses: () => Promise.resolve([]),
  getUsedAddresses: () => Promise.resolve([]),
  getChangeAddress: () =>
    CSL.Address.fromHex(
      '017ef00ee3672330155382a2857573868af466b88aa8c4081f45583e1784d958399bcce03402fd853d43a4e7366f2018932e5aff4eea904693',
    ),
  getRewardAddresses: () =>
    Promise.all([CSL.Address.fromHex('e184d958399bcce03402fd853d43a4e7366f2018932e5aff4eea904693')]),
  getUtxos: () => Promise.resolve([]),
  getCollateral: () => Promise.resolve([]),
  submitTx: () => Promise.resolve('tx-id'),
}
const trustedUrl = 'https://yoroi-wallet.com/'
