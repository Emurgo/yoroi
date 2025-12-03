import {CardanoApi} from '@yoroi/api'
import {buildNetworkManagers} from '@yoroi/blockchains'
import {Chain, Wallet} from '@yoroi/types'

import {freeze} from 'immer'

import {tokenManagers} from '~/features/Portfolio/common/constants'
import {isDev} from '~/kernel/constants'

export const addressModes: ReadonlyArray<Wallet.AddressMode> = freeze([
  'single',
  'multiple',
] as const)
export const implementations: ReadonlyArray<Wallet.Implementation> = freeze([
  'cardano-cip1852',
  'cardano-bip44',
] as const)

export const networkManagers = buildNetworkManagers({
  tokenManagers,
  apiMaker: CardanoApi.cardanoApiMaker,
})

// NOTE: needs update, SupportedNetworks is a client thing
const supportedNetworksDev: Array<Chain.SupportedNetworks> = freeze([
  Chain.Network.Mainnet,
  Chain.Network.Preprod,
])

const supportedNetworksProd: Array<Chain.SupportedNetworks> = freeze([
  Chain.Network.Mainnet,
  Chain.Network.Preprod,
])

export const availableNetworks = isDev
  ? supportedNetworksDev
  : supportedNetworksProd

export const linkToSupportOpenTicket = 'https://help.yoroi-wallet.com/en/'
