/**
 * Multisig wallet factory
 * Creates wallet factories for multisig (script-based) wallets
 */
import type {CardanoWalletDependencies} from '@yoroi/cardano-wallet'
import {makeCardanoWallet} from '@yoroi/cardano-wallet'
import {getLogger} from '@yoroi/logger'
import {Chain, Network, Wallet} from '@yoroi/types'

import {walletChecksum} from '@emurgo/cip4-js'
import {freeze} from 'immer'

import {WalletFactory} from '../common/types'

/**
 * Create a multisig wallet factory
 * Multisig wallets are script-based and don't use traditional key derivation
 */
export const makeMultisigWalletFactory = (
  networkManager: Network.Manager,
  dependencies: CardanoWalletDependencies,
): WalletFactory => {
  const logger = getLogger()

  // Use the regular cardano wallet factory but with multisig implementation
  // The makeCardanoWallet function now supports multisigMeta parameter
  const baseFactory = makeCardanoWallet(
    networkManager,
    'cardano-multisig',
    dependencies,
  )

  return freeze({
    build: async ({
      id,
      accountVisual,
      multisigMeta,
    }: {
      id: string
      accountVisual: number
      multisigMeta: Wallet.MultisigWalletMeta
    }): Promise<import('@yoroi/cardano-wallet').YoroiWallet> => {
      if (!multisigMeta) {
        throw new Error('Multisig wallet requires multisigMeta')
      }

      logger.debug('makeMultisigWalletFactory: Building multisig wallet', {
        id,
        accountVisual,
        coSignerCount: multisigMeta.coSigners.length,
      })

      // Build using the extended makeCardanoWallet with multisigMeta
      return baseFactory.build({
        id,
        accountVisual,
        multisigMeta,
      })
    },

    calcChecksum: (
      pubKeyHex: string,
    ): import('@yoroi/cardano-wallet').CardanoTypes.WalletChecksum => {
      // For multisig wallets, we can use the first co-signer's key for checksum
      // or derive from script hash
      return walletChecksum(pubKeyHex)
    },

    makeKeys: ({
      mnemonic: _mnemonic,
      csl: _csl,
    }: {
      mnemonic: string
      csl: import('@emurgo/cross-csl-core').WasmModuleProxy
    }): {
      rootKey: string
      accountPubKeyHex: string
    } => {
      // Multisig wallets don't use traditional key derivation from mnemonic
      // They derive shared wallet keys from parent wallets
      // This method is kept for compatibility but shouldn't be used for multisig wallets
      logger.warn(
        'makeKeys called on multisig wallet factory - multisig wallets use shared keys from parent wallets',
      )
      throw new Error(
        'Multisig wallets do not derive keys from mnemonic. Use deriveMultisigAccount instead.',
      )
    },
  })
}

/**
 * Create multisig wallet factories for all networks
 */
export const createMultisigWalletFactories = (
  dependencies: CardanoWalletDependencies,
  networkManagers: Readonly<Record<Chain.SupportedNetworks, Network.Manager>>,
): Record<Chain.SupportedNetworks, WalletFactory> => {
  return freeze({
    [Chain.Network.Mainnet]: makeMultisigWalletFactory(
      networkManagers[Chain.Network.Mainnet],
      dependencies,
    ),
    [Chain.Network.Preprod]: makeMultisigWalletFactory(
      networkManagers[Chain.Network.Preprod],
      dependencies,
    ),
  } as const)
}
