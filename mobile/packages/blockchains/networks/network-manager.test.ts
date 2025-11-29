import {getLogger} from '@yoroi/common'
import {createTokenManagerMock} from '@yoroi/portfolio'
import {Chain} from '@yoroi/types'

import {protocolParamsPlaceholder} from '../cardano/constants'
import {networkConfigs} from './network-configs'
import {buildNetworkManagers} from './network-manager'

// Mock the shared logger
jest.mock('@yoroi/common', () => {
  const actual = jest.requireActual('@yoroi/common')
  const mockLogger = {
    error: jest.fn(),
    level: 'Debug' as const,
    debug: jest.fn(),
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    enable: jest.fn(),
    disable: jest.fn(),
    addTransport: jest.fn(),
  }
  return {
    ...actual,
    getLogger: jest.fn(() => mockLogger),
  }
})

describe('buildNetworkManagers', () => {
  const mockTokenManagers = {
    [Chain.Network.Mainnet]: createTokenManagerMock(),
    [Chain.Network.Preprod]: createTokenManagerMock(),
    [Chain.Network.Preview]: createTokenManagerMock(),
  }
  const mockLogger = getLogger()
  const mockApiMaker = jest.fn().mockReturnValue({
    getProtocolParams: jest.fn().mockResolvedValue({}),
    getBestBlock: jest.fn().mockResolvedValue({}),
    getUtxoData: jest.fn().mockResolvedValue({}),
  })

  it('should build network managers correctly', async () => {
    const managers = buildNetworkManagers({
      tokenManagers: mockTokenManagers,
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
      apiMaker: mockApiMaker,
    })

    const cardanoManager = managers[Chain.Network.Mainnet]
    const protocolParams = await cardanoManager.api.protocolParams()
    expect(protocolParams).toEqual(protocolParamsPlaceholder)
    expect(mockLogger.error).toHaveBeenCalled()
  })

  it('coverage only - should use provided apiMaker', () => {
    const managers = buildNetworkManagers({
      tokenManagers: mockTokenManagers,
      apiMaker: mockApiMaker,
    })
    expect(managers).toBeDefined()
  })

  it('should return frozen managers object', () => {
    const managers = buildNetworkManagers({
      tokenManagers: mockTokenManagers,
      apiMaker: mockApiMaker,
    })

    // Verify managers are frozen (readonly) - Object.freeze prevents modifications
    expect(Object.isFrozen(managers)).toBe(true)
  })
})
