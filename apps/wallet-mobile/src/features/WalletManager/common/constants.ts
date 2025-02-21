import {buildNetworkManagers} from '@yoroi/blockchains'
import {Chain, Wallet} from '@yoroi/types'
import {freeze} from 'immer'

import {isDev} from '../../../kernel/env'
import {logger} from '../../../kernel/logger/logger'
import {buildPortfolioTokenManagers} from '../../Portfolio/common/helpers/build-token-managers'

export const addressModes: ReadonlyArray<Wallet.AddressMode> = freeze(['single', 'multiple'] as const)
export const implementations: ReadonlyArray<Wallet.Implementation> = freeze([
  'cardano-cip1852',
  'cardano-bip44',
] as const)

const {tokenManagers} = buildPortfolioTokenManagers()
export const networkManagers = buildNetworkManagers({tokenManagers, logger})

// NOTE: needs update, SupportedNetworks is a client thing
const supportedNetworksDev: Array<Chain.SupportedNetworks> = freeze([Chain.Network.Mainnet, Chain.Network.Preprod])

const supportedNetworksProd: Array<Chain.SupportedNetworks> = freeze([Chain.Network.Mainnet, Chain.Network.Preprod])

export const availableNetworks = isDev ? supportedNetworksDev : supportedNetworksProd
