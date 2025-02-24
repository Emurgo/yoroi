import {App, Chain} from '@yoroi/types'
import {createTokenManagerMock} from '@yoroi/portfolio'

import {networkConfigs} from './network-configs'
import {protocolParamsPlaceholder} from '../cardano/constants'
import {buildNetworkManagers} from './network-manager'

describe('buildNetworkManagers', () => {
  const mockTokenManagers = {
    [Chain.Network.Mainnet]: createTokenManagerMock(),
    [Chain.Network.Preprod]: createTokenManagerMock(),
    [Chain.Network.Preview]: createTokenManagerMock(),
  }
  const mockLogger = {
    error: jest.fn(),
    level: App.Logger.Level.Debug,
    debug: jest.fn(),
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    enable: jest.fn(),
    disable: jest.fn(),
    addTransport: jest.fn(),
  }
  const mockApiMaker = jest.fn().mockReturnValue({
    getProtocolParams: jest.fn().mockResolvedValue({}),
    getBestBlock: jest.fn().mockResolvedValue({}),
    getUtxoData: jest.fn().mockResolvedValue({}),
  })

  it('should build network managers correctly', async () => {
    const managers = buildNetworkManagers({
      tokenManagers: mockTokenManagers,
      logger: mockLogger,
      apiMaker: mockApiMaker,
    })

    expect(managers).toBeDefined()
    expect(Object.keys(managers)).toEqual(Object.keys(networkConfigs))

    const cardanoManager = managers[Chain.Network.Mainnet]
    expect(cardanoManager).toBeDefined()
    expect(cardanoManager.api).toBeDefined()
    expect(cardanoManager.api.protocolParams).toBeDefined()
    expect(cardanoManager.api.bestBlock).toBeDefined()
    expect(cardanoManager.api.utxoData).toBeDefined()
  })

  it('should use protocolParamsPlaceholder on protocolParams error', async () => {
    mockApiMaker.mockReturnValueOnce({
      getProtocolParams: jest.fn().mockRejectedValue(new Error('Test error')),
      getBestBlock: jest.fn().mockResolvedValue({}),
      getUtxoData: jest.fn().mockResolvedValue({}),
    })

    const managers = buildNetworkManagers({
      tokenManagers: mockTokenManagers,
      logger: mockLogger,
      apiMaker: mockApiMaker,
    })

    const cardanoManager = managers[Chain.Network.Mainnet]
    const protocolParams = await cardanoManager.api.protocolParams()
    expect(protocolParams).toEqual(protocolParamsPlaceholder)
    expect(mockLogger.error).toHaveBeenCalled()
  })

  it('coverage only - should use default cardanoApiMaker', () => {
    const managers = buildNetworkManagers({
      tokenManagers: mockTokenManagers,
      logger: mockLogger,
    })
    expect(managers).toBeDefined()
  })
})
