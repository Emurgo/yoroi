import type {CardanoWalletDependencies} from '@yoroi/cardano-wallet'
import {makeCardanoWallet} from '@yoroi/cardano-wallet'
import {getLogger, throwLoggedError} from '@yoroi/common'
import {Chain, Wallet} from '@yoroi/types'

import {freeze} from 'immer'

import {networkManagers} from '../common/constants'
import {WalletFactory} from '../common/types'

/**
 * Creates wallet factories with the given dependencies
 * This function should be called from the app with platform-specific dependencies
 */
export function createWalletFactories(
  dependencies: CardanoWalletDependencies,
): Record<
  Chain.SupportedNetworks,
  Record<Wallet.Implementation, WalletFactory>
> {
  const ShelleyWalletMainnet = makeCardanoWallet(
    networkManagers[Chain.Network.Mainnet],
    'cardano-cip1852',
    dependencies,
  )
  const ShelleyWalletTestnet = makeCardanoWallet(
    networkManagers[Chain.Network.Preprod],
    'cardano-cip1852',
    dependencies,
  )
  const ByronWalletMainnet = makeCardanoWallet(
    networkManagers[Chain.Network.Mainnet],
    'cardano-bip44',
    dependencies,
  )
  const ByronWalletTestnet = makeCardanoWallet(
    networkManagers[Chain.Network.Preprod],
    'cardano-bip44',
    dependencies,
  )
  const ShelleyWalletPreview = makeCardanoWallet(
    networkManagers[Chain.Network.Preview],
    'cardano-cip1852',
    dependencies,
  )
  const ByronWalletPreview = makeCardanoWallet(
    networkManagers[Chain.Network.Preview],
    'cardano-bip44',
    dependencies,
  )

  return freeze({
    [Chain.Network.Mainnet]: {
      'cardano-cip1852': ShelleyWalletMainnet,
      'cardano-bip44': ByronWalletMainnet,
    },
    [Chain.Network.Preprod]: {
      'cardano-cip1852': ShelleyWalletTestnet,
      'cardano-bip44': ByronWalletTestnet,
    },
    [Chain.Network.Preview]: {
      'cardano-cip1852': ShelleyWalletPreview,
      'cardano-bip44': ByronWalletPreview,
    },
  } as const)
}

// Legacy factory map - will be populated by createWalletFactories
let walletFactoryMap: ReturnType<typeof createWalletFactories> | null = null

/**
 * Initializes wallet factories with dependencies
 * Must be called before getWalletFactory can be used
 */
export function initializeWalletFactories(
  dependencies: CardanoWalletDependencies,
): void {
  walletFactoryMap = createWalletFactories(dependencies)
}

/**
 * Retrieves the wallet factory based on the network and implementation ID
 *
 * @param {object} options Options object
 * @param {Chain.SupportedNetworks} options.network
 * @param {Wallet.Implementation} options.implementation
 * @returns {WalletFactory} The wallet factory
 * @throws {Error} If the wallet factory is not found or factories not initialized
 */
export function getWalletFactory({
  network,
  implementation,
}: {
  network: Chain.SupportedNetworks
  implementation: Wallet.Implementation
}): WalletFactory {
  if (!walletFactoryMap) {
    throwLoggedError(getLogger())(
      'getWalletFactory: Wallet factories not initialized. Call initializeWalletFactories first.',
    )
  }

  const networkImplementations = walletFactoryMap?.[network]
  if (!networkImplementations) {
    throwLoggedError(getLogger())(
      'getWalletFactory: Unable to find network implementations',
    )
    throw new Error('Network implementations not found') // TypeScript needs this
  }

  const factory = networkImplementations[implementation]
  if (!factory)
    throwLoggedError(getLogger())(
      'getWalletFactory: Unable to find wallet factory',
    )

  return factory
}
