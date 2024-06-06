import {Chain} from '@yoroi/types'

import {WalletImplementationId} from '../../../../yoroi-wallets/types'
import {getWalletFactory} from './get-wallet-factory'

describe('getWalletFactory', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return the correct wallet factory for Mainnet', () => {
    const network = Chain.Network.Mainnet
    const implementationId: WalletImplementationId = 'haskell-shelley'

    const result = getWalletFactory({network, implementationId})

    expect(result).toBeDefined()
  })

  it('should return the correct wallet factory for Preprod', () => {
    const network = Chain.Network.Preprod
    const implementationId: WalletImplementationId = 'haskell-shelley'

    const result = getWalletFactory({network, implementationId})

    expect(result).toBeDefined()
  })

  it('should return the correct wallet factory for Sancho', () => {
    const network = Chain.Network.Sancho
    const implementationId: WalletImplementationId = 'haskell-shelley'

    const result = getWalletFactory({network, implementationId})

    expect(result).toBeDefined()
  })

  it('should return the correct wallet factory for Mainnet with implementationId "haskell-byron"', () => {
    const network = Chain.Network.Mainnet
    const implementationId: WalletImplementationId = 'haskell-byron'

    const result = getWalletFactory({network, implementationId})

    expect(result).toBeDefined()
  })

  it('should throw for unknown network', () => {
    const network = 'unknown-network' as Chain.SupportedNetworks
    const implementationId: WalletImplementationId = 'haskell-shelley'

    expect(() => getWalletFactory({network, implementationId})).toThrow(
      'getWalletFactory Unable to find wallet factory',
    )
  })

  it('should throw for unknown implementationId', () => {
    const network = Chain.Network.Mainnet
    const implementationId = 'unknown-implementationId' as WalletImplementationId

    expect(() => getWalletFactory({network, implementationId})).toThrow(
      'getWalletFactory Unable to find wallet factory',
    )
  })
})
