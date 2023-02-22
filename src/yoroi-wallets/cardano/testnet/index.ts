import {parseSafe} from '../..'
import {YoroiStorage} from '../../storage'
import {WalletModule} from '../../walletManager'
import {NETWORK_ID} from './shelley/protocol'
import {CardanoTestnetShelley, WalletJSON} from './shelley/ShelleyWallet'

export const CardanoTestnet: WalletModule = {
  matchNetworkId: (networkId: number) => {
    if (networkId === NETWORK_ID) {
      return true // shelley testnet
    }

    return false
  },

  Wallet: {
    async create(args) {
      const implementationId = await getImplementationId(args.storage)
      const Wallet = getWalletImplementation(implementationId)

      return Wallet.create(args)
    },

    async createBip44(args) {
      const implementationId = await getImplementationId(args.storage)
      const Wallet = getWalletImplementation(implementationId)

      return Wallet.createBip44(args)
    },

    async restore(args) {
      const implementationId = await getImplementationId(args.storage)
      const Wallet = getWalletImplementation(implementationId)

      return Wallet.restore(args)
    },
  },
}

const getImplementationId = async (storage: YoroiStorage) => {
  const walletJSON = await storage.getItem('data', parseWalletJSON)
  if (!walletJSON) throw new Error('Cannot read saved data')
  
  return walletJSON.walletImplementationId
}

const getWalletImplementation = (implementationId: ImplementationId) => {
  if (implementationId === 'haskell-shelley') {
    return CardanoTestnetShelley
  }

  if (implementationId === 'haskell-shelley-24') {
    return CardanoTestnetShelley
  }

  throw new Error('Unknown wallet implementation')
}

const parseWalletJSON = (data: unknown) => {
  const parsed = parseSafe(data)
  return isWalletJSON(parsed) ? parsed : undefined
}

const isWalletJSON = (data: unknown): data is WalletJSON => {
  const candidate = data as WalletJSON
  return !!candidate && typeof candidate === 'object' && keys.every((key) => key in candidate)
}

const keys: Array<keyof WalletJSON> = [
  'publicKeyHex',
  'walletImplementationId',
  'internalChain',
  'externalChain',
  'isEasyConfirmationEnabled',
  'lastGeneratedAddressIndex',
]

type ImplementationId = 'haskell-shelley' | 'haskell-shelley-24'
