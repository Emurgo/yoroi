import {Wallet} from '@yoroi/types'
import {freeze} from 'immer'

import {buildPortfolioTokenManagers} from '../../Portfolio/common/helpers/build-token-managers'
import {buildNetworkManagers} from '../network-manager/network-manager'

export const addressModes: ReadonlyArray<Wallet.AddressMode> = freeze(['single', 'multiple'] as const)
export const implementations: ReadonlyArray<Wallet.Implementation> = freeze([
  'cardano-cip1852',
  'cardano-bip44',
] as const)

export const {tokenManagers, tokenStorages} = buildPortfolioTokenManagers()
export const networkManagers = buildNetworkManagers({tokenManagers})
