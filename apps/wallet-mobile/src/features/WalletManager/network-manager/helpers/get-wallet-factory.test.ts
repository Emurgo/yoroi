import {Chain, Wallet} from '@yoroi/types'

import {getWalletFactory} from './get-wallet-factory'

describe('getWalletFactory', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return the correct wallet factory for Mainnet', () => {
    const network = Chain.Network.Mainnet
    const implementation: Wallet.Implementation = 'cardano-cip1852'

    const result = getWalletFactory({network, implementation})

    expect(result).toBeDefined()
  })

  it('should return the correct wallet factory for Preprod', () => {
    const network = Chain.Network.Preprod
    const implementation: Wallet.Implementation = 'cardano-cip1852'

    const result = getWalletFactory({network, implementation})

    expect(result).toBeDefined()
  })

  it('should return the correct wallet factory for Mainnet with implementation "haskell-byron"', () => {
    const network = Chain.Network.Mainnet
    const implementation: Wallet.Implementation = 'cardano-bip44'

    const result = getWalletFactory({network, implementation})

    expect(result).toBeDefined()
  })

  it('should throw for unknown network', () => {
    const network = 'unknown-network' as Chain.SupportedNetworks
    const implementation: Wallet.Implementation = 'cardano-cip1852'

    expect(() => getWalletFactory({network, implementation})).toThrow(
      'getWalletFactory: Unable to find network implementations',
    )
  })

  it('should throw for unknown implementation', () => {
    const network = Chain.Network.Mainnet
    const implementation = 'unknown-implementation' as Wallet.Implementation

    expect(() => getWalletFactory({network, implementation})).toThrow('getWalletFactory: Unable to find wallet factory')
  })
})
