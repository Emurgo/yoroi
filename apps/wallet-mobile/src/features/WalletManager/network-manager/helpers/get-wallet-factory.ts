import {Chain, Wallet} from '@yoroi/types'
import {freeze} from 'immer'

import {logger} from '../../../../kernel/logger/logger'
import {ByronWallet} from '../../../../yoroi-wallets/cardano/byron/ByronWallet'
import * as MAINNET from '../../../../yoroi-wallets/cardano/constants/mainnet/constants'
import * as SANCHONET from '../../../../yoroi-wallets/cardano/constants/sanchonet/constants'
import * as TESTNET from '../../../../yoroi-wallets/cardano/constants/testnet/constants'
import {makeShelleyWallet} from '../../../../yoroi-wallets/cardano/shelley/ShelleyWallet'
import {WalletFactory} from '../../common/types'

const ShelleyWalletMainnet = makeShelleyWallet(MAINNET)
const ShelleyWalletTestnet = makeShelleyWallet(TESTNET)
const ShelleySanchonetWallet = makeShelleyWallet(SANCHONET)

/**
 * Retrieves the wallet factory based on the network and implementation ID
 *
 * @param {object} options Options object
 * @param {Chain.SupportedNetworks} options.network
 * @param {Wallet.Implementation} options.implementation
 * @returns {WalletFactory} The wallet factory
 * @throws {Error} If the wallet factory is not found
 */
export function getWalletFactory({
  network,
  implementation,
}: {
  network: Chain.SupportedNetworks
  implementation: Wallet.Implementation
}): WalletFactory {
  const walletMap: Record<Chain.SupportedNetworks, Partial<Record<Wallet.Implementation, WalletFactory>>> = freeze({
    [Chain.Network.Mainnet]: /* cardano mainnet */ {
      'cardano-shelley': ShelleyWalletMainnet,
      'cardano-byron': ByronWallet,
    },
    [Chain.Network.Preprod]: /* cardano testnet */ {
      'cardano-shelley': ShelleyWalletTestnet,
      'cardano-byron': ByronWallet,
    },
    [Chain.Network.Sancho]: /* cardano sanchonet */ {
      'cardano-shelley': ShelleySanchonetWallet,
      'cardano-byron': ByronWallet,
    },
  } as const)

  const factory = walletMap[network][implementation]

  if (!factory) {
    const error = new Error('getWalletFactory Unable to find wallet factory')
    logger.error(error)
    throw error
  }

  return factory
}
