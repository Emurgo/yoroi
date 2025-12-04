import {Chain, Wallet} from '@yoroi/types'

import {freeze} from 'immer'

export const addressModes: ReadonlyArray<Wallet.AddressMode> = freeze([
  'single',
  'multiple',
] as const)
export const implementations: ReadonlyArray<Wallet.Implementation> = freeze([
  'cardano-cip1852',
  'cardano-bip44',
  'cardano-multisig',
] as const)

export const availableNetworks: ReadonlyArray<Chain.SupportedNetworks> = freeze(
  [
    Chain.Network.Mainnet,
    Chain.Network.Preprod,
    Chain.Network.Preview,
  ] as const,
)

// NOTE: networkManagers is now created in the app (src/common/network-managers.ts)
// and passed to makeWalletManager via WalletManagerOptions
// This ensures packages don't import from the app

export const linkToSupportOpenTicket = 'https://help.yoroi-wallet.com/en/'
