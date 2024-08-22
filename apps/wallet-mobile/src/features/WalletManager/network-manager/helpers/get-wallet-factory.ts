import {Chain, Wallet} from '@yoroi/types'
import {freeze} from 'immer'

import {throwLoggedError} from '../../../../kernel/logger/helpers/throw-logged-error'
import {makeCardanoWallet} from '../../../../yoroi-wallets/cardano/cardano-wallet'
import * as MAINNET from '../../../../yoroi-wallets/cardano/constants/mainnet/constants'
import * as SANCHONET from '../../../../yoroi-wallets/cardano/constants/sanchonet/constants'
import * as TESTNET from '../../../../yoroi-wallets/cardano/constants/testnet/constants'
import {networkManagers} from '../../common/constants'
import {WalletFactory} from '../../common/types'

const ShelleyWalletMainnet = makeCardanoWallet(networkManagers[Chain.Network.Mainnet], 'cardano-cip1852', MAINNET)
const ShelleyWalletTestnet = makeCardanoWallet(networkManagers[Chain.Network.Preprod], 'cardano-cip1852', TESTNET)
const ShelleySanchonetWallet = makeCardanoWallet(networkManagers[Chain.Network.Sancho], 'cardano-cip1852', SANCHONET)
const ShelleyPreviewWallet = makeCardanoWallet(networkManagers[Chain.Network.Preview], 'cardano-cip1852', SANCHONET)
const ByronWallet = makeCardanoWallet(networkManagers[Chain.Network.Mainnet], 'cardano-bip44', MAINNET)
const ByronWalletTestnet = makeCardanoWallet(networkManagers[Chain.Network.Preprod], 'cardano-bip44', TESTNET)
const ByronSanchonetWallet = makeCardanoWallet(networkManagers[Chain.Network.Sancho], 'cardano-bip44', SANCHONET)
const ByronPreviewWallet = makeCardanoWallet(networkManagers[Chain.Network.Preview], 'cardano-bip44', SANCHONET)

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
      'cardano-cip1852': ShelleyWalletMainnet,
      'cardano-bip44': ByronWallet,
    },
    [Chain.Network.Preprod]: /* cardano testnet */ {
      'cardano-cip1852': ShelleyWalletTestnet,
      'cardano-bip44': ByronWalletTestnet,
    },
    [Chain.Network.Sancho]: /* cardano sanchonet */ {
      'cardano-cip1852': ShelleySanchonetWallet,
      'cardano-bip44': ByronSanchonetWallet,
    },
    [Chain.Network.Preview]: /* cardano preview */ {
      'cardano-cip1852': ShelleyPreviewWallet,
      'cardano-bip44': ByronPreviewWallet,
    },
  } as const)

  const networkImplementations = walletMap[network]
  if (!networkImplementations) throwLoggedError('getWalletFactory: Unable to find network implementations')

  const factory = networkImplementations?.[implementation]
  if (!factory) throwLoggedError('getWalletFactory: Unable to find wallet factory')

  return factory
}
