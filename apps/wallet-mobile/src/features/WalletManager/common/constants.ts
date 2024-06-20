import {Wallet} from '@yoroi/types'
import {freeze} from 'immer'

import {Keychain} from '../../../kernel/storage/Keychain'
import {rootStorage} from '../../../kernel/storage/rootStorage'
import {buildPortfolioTokenManagers} from '../../Portfolio/common/helpers/build-token-managers'
import {buildNetworkManagers} from '../network-manager/network-manager'
import {WalletManager} from '../wallet-manager'

export const addressModes: ReadonlyArray<Wallet.AddressMode> = freeze(['single', 'multiple'] as const)
export const implementations: ReadonlyArray<Wallet.Implementation> = freeze([
  'cardano-cip1852',
  'cardano-bip44',
] as const)

export const {tokenManagers, tokenStorages} = buildPortfolioTokenManagers()
export const networkManagers = buildNetworkManagers({tokenManagers})
export const walletManager = new WalletManager({networkManagers, rootStorage, keychainManager: Keychain})
