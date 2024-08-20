import {Chain, Wallet} from '@yoroi/types'
import {freeze} from 'immer'

import {isDev} from '../../../kernel/env'
import {buildPortfolioTokenManagers} from '../../Portfolio/common/helpers/build-token-managers'
import {buildNetworkManagers} from '../network-manager/network-manager'

export const addressModes: ReadonlyArray<Wallet.AddressMode> = freeze(['single', 'multiple'] as const)
export const implementations: ReadonlyArray<Wallet.Implementation> = freeze([
  'cardano-cip1852',
  'cardano-bip44',
] as const)

export const {tokenManagers, tokenStorages} = buildPortfolioTokenManagers()
export const networkManagers = buildNetworkManagers({tokenManagers})

const supportedNetworksDev: Array<Chain.SupportedNetworks> = freeze([
  Chain.Network.Mainnet,
  Chain.Network.Preprod,
  Chain.Network.Sancho,
])

const supportedNetworksProd: Array<Chain.SupportedNetworks> = freeze([Chain.Network.Mainnet, Chain.Network.Preprod])

export const availableNetworks = isDev ? supportedNetworksDev : supportedNetworksProd
