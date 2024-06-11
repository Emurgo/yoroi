import {Chain} from '@yoroi/types'
import {freeze} from 'immer'

import {logger} from '../../../../kernel/logger/logger'
import {ByronWallet} from '../../../../yoroi-wallets/cardano/byron/ByronWallet'
import * as MAINNET from '../../../../yoroi-wallets/cardano/constants/mainnet/constants'
import * as SANCHONET from '../../../../yoroi-wallets/cardano/constants/sanchonet/constants'
import * as TESTNET from '../../../../yoroi-wallets/cardano/constants/testnet/constants'
import {makeShelleyWallet} from '../../../../yoroi-wallets/cardano/shelley/ShelleyWallet'
import {WalletImplementationId} from '../../../../yoroi-wallets/types'
import {WalletFactory} from '../../common/types'

const ShelleyWalletMainnet = makeShelleyWallet(MAINNET)
const ShelleyWalletTestnet = makeShelleyWallet(TESTNET)
const ShelleySanchonetWallet = makeShelleyWallet(SANCHONET)

/**
 * Retrieves the wallet factory based on the network and implementation ID
 *
 * @param {object} options Options object
 * @param {Chain.SupportedNetworks} options.network - The network
 * @param {WalletImplementationId} options.implementationId - The implementation ID
 * @returns {WalletFactory} The wallet factory
 * @throws {Error} If the wallet factory is not found
 */
export function getWalletFactory({
  network,
  implementationId,
}: {
  network: Chain.SupportedNetworks
  implementationId: WalletImplementationId
}): WalletFactory {
  const walletMap: Record<Chain.SupportedNetworks, Partial<Record<WalletImplementationId, WalletFactory>>> = freeze({
    [Chain.Network.Mainnet]: /* cardano mainnet */ {
      'haskell-shelley': ShelleyWalletMainnet,
      'haskell-shelley-24': ShelleyWalletMainnet,
      'haskell-byron': ByronWallet,
    },
    [Chain.Network.Preprod]: /* cardano testnet */ {
      'haskell-shelley': ShelleyWalletTestnet,
      'haskell-shelley-24': ShelleyWalletTestnet,
    },
    [Chain.Network.Sancho]: /* cardano sanchonet */ {
      'haskell-shelley': ShelleySanchonetWallet,
      'haskell-shelley-24': ShelleySanchonetWallet,
    },
  } as const)

  const factory = walletMap[network]?.[implementationId]

  if (!factory) {
    const error = new Error('getWalletFactory Unable to find wallet factory')
    logger.error(error)
    throw error
  }

  return factory
}
