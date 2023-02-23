import {HWDeviceInfo, parseSafe} from '../..'
import {YoroiStorage} from '../../storage'
import {NetworkModule} from '../../walletManager'
import { AddressChainJSON } from '../shared/chain/chain'
import {NETWORK_ID} from './shelley/constants'
import {ShelleyWalletFactory} from './shelley/ShelleyWalletFactory'

export const CardanoTestnet: NetworkModule = {
  matchNetworkId: (networkId: number) => {
    if (networkId === NETWORK_ID) {
      return true // shelley testnet
    }

    return false
  },

  WalletFactory: {
    async create(args, factoryId: FactoryId) {
      const {create} = getWalletFactory(factoryId)

      return create(args)
    },

    async restore(args) {
      const walletJSON = await getWalletJSON(args.storage)
      const factoryId = getFactoryId(walletJSON)
      const {restore} = getWalletFactory(factoryId)

      return restore(args)
    },
  },
}

const getWalletJSON = async (storage: YoroiStorage) => {
  const walletJSON = await storage.getItem('data', parseWalletJSON)
  if (!walletJSON) throw new Error('Cannot read saved data')

  return walletJSON
}

const getFactoryId = (walletJSON: WalletJSON) => {
  if (walletJSON.isHW) return "bip44"
  if (walletJSON.isReadOnly) return "bip44"
  if (walletJSON.walletImplementationId === "haskell-shelley-24") return "cip1852"
  if (walletJSON.walletImplementationId === "haskell-shelley") return "cip1852"

  throw new Error('Unknown wallet implementation')
}

const getWalletFactory = (factoryId: FactoryId) => {
  if (factoryId === 'cip1852') {
    return ShelleyWalletFactory
  }

  if (factoryId === 'bip44') {
    return Bip44WalletFactory
  }

  throw new Error('Unknown wallet implementation')
}

type WalletJSON = {
  version: number
  isHW: boolean
  hwDeviceInfo: HWDeviceInfo | null
  publicKeyHex: string
  isReadOnly: boolean
  internalChain: AddressChainJSON
  externalChain: AddressChainJSON
  isEasyConfirmationEnabled: boolean
  lastGeneratedAddressIndex: number
  walletImplementationId: string
}

export const parseWalletJSON = (data: unknown) => {
  const parsed = parseSafe(data)
  return isWalletJSON(parsed) ? parsed : undefined
}

const isWalletJSON = (data: unknown): data is WalletJSON => {
  const candidate = data as WalletJSON
  return !!candidate && typeof candidate === 'object' && keys.every((key) => key in candidate)
}

const keys: Array<keyof WalletJSON> = [
  'publicKeyHex',
  'internalChain',
  'externalChain',
  'isEasyConfirmationEnabled',
  'lastGeneratedAddressIndex',
]

type FactoryId = 'cip1852' | 'bip44'
