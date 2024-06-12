import {Chain} from '@yoroi/types'

import {WalletImplementation} from '../../common/types'
import {getWalletFactory} from './get-wallet-factory'

describe('getWalletFactory', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return the correct wallet factory for Mainnet', () => {
    const network = Chain.Network.Mainnet
    const implementation: WalletImplementation = 'cardano-shelley'

    const result = getWalletFactory({network, implementation})

    expect(result).toBeDefined()
  })

  it('should return the correct wallet factory for Preprod', () => {
    const network = Chain.Network.Preprod
    const implementation: WalletImplementation = 'cardano-shelley'

    const result = getWalletFactory({network, implementation})

    expect(result).toBeDefined()
  })

  it('should return the correct wallet factory for Sancho', () => {
    const network = Chain.Network.Sancho
    const implementation: WalletImplementation = 'cardano-shelley'

    const result = getWalletFactory({network, implementation})

    expect(result).toBeDefined()
  })

  it('should return the correct wallet factory for Mainnet with implementation "haskell-byron"', () => {
    const network = Chain.Network.Mainnet
    const implementation: WalletImplementation = 'cardano-byron'

    const result = getWalletFactory({network, implementation})

    expect(result).toBeDefined()
  })

  it('should throw for unknown network', () => {
    const network = 'unknown-network' as Chain.SupportedNetworks
    const implementation: WalletImplementation = 'cardano-shelley'

    expect(() => getWalletFactory({network, implementation})).toThrow('getWalletFactory Unable to find wallet factory')
  })

  it('should throw for unknown implementation', () => {
    const network = Chain.Network.Mainnet
    const implementation = 'unknown-implementation' as WalletImplementation

    expect(() => getWalletFactory({network, implementation})).toThrow('getWalletFactory Unable to find wallet factory')
  })
})
