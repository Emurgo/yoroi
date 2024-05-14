import {connectionStorageMaker, dappConnectorApiMaker, dappConnectorMaker, ResolverWallet} from '@yoroi/dapp-connector'
import {DappConnector} from '@yoroi/dapp-connector'
import {App} from '@yoroi/types'

import {YoroiWallet} from '../../../yoroi-wallets/cardano/types'

export const validUrl = (url: string) => {
  return /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!&',,=.+]+$/g.test(url)
}

export function hasProtocol(url: string) {
  return /^[a-z]*:\/\//i.test(url)
}

export const urlWithProtocol = (url: string, defaultProtocol = 'https://') => {
  return hasProtocol(url) ? url : `${defaultProtocol}${url}`
}

export const getDomainFromUrl = (url: string) => {
  try {
    const parsedUrl = new URL(url)

    return {
      isSecure: parsedUrl.protocol === 'https:',
      domainName: parsedUrl.hostname.replace(/www./g, ''),
    }
  } catch (error) {
    return {
      isSecure: false,
      domainName: '',
    }
  }
}

export interface DAppItem {
  id: string
  name: string
  description: string
  category: string
  logo: string
  uri: string
  origins: string[]
}

const googleDappId = 'google_search'

export const getGoogleSearchItem = (searchQuery: string): DAppItem => ({
  id: googleDappId,
  name: searchQuery,
  description: 'Google',
  category: 'search',
  logo: '',
  uri: `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`,
  origins: ['https://www.google.com'],
})

export const isGoogleSearchItem = (dApp: DAppItem) => dApp.id === googleDappId

type CreateDappConnectorOptions = {
  appStorage: App.Storage
  wallet: YoroiWallet
  confirmConnection: (origin: string, manager: DappConnector) => Promise<boolean>
  signTx: (cbor: string) => Promise<string>
}

export const createDappConnector = (options: CreateDappConnectorOptions) => {
  const {wallet, appStorage, confirmConnection, signTx} = options
  const api = dappConnectorApiMaker()
  const handlerWallet: ResolverWallet = {
    id: wallet.id,
    networkId: wallet.networkId,
    getUsedAddresses: (params) => wallet.getUsedAddresses(params),
    getUnusedAddresses: () => wallet.getUnusedAddresses(),
    getBalance: (tokenId) => wallet.getBalance(tokenId),
    getChangeAddress: () => wallet.CIP30getChangeAddress(),
    getRewardAddresses: () => wallet.CIP30getRewardAddresses(),
    submitTx: async (cbor) => wallet.CIP30submitTx(cbor),
    getCollateral: async (value) => {
      // TODO: Move serialisation out of here
      const result = await wallet.CIP30getCollateral(value)
      if (!result) return null
      if (result.length === 0) return []
      return Promise.all(result.map((v) => v.toHex()))
    },
    getUtxos: async (value, pagination) => {
      const result = await wallet.CIP30getUtxos(value, pagination)
      if (!result) return [] // TODO: return null if value was given
      return Promise.all(result.map((v) => v.toHex()))
    },
    confirmConnection: (origin: string) => confirmConnection(origin, manager),
    signData: async (address, payload) => wallet.CIP30signData(address, payload),
    signTx: async (cbor: string, partial?: boolean) => {
      const rootKey = await signTx(cbor)
      const result = await wallet.CIP30signTx(rootKey, cbor, partial)
      return result.toHex()
    },
  }
  const storage = connectionStorageMaker({storage: appStorage.join('dapp-connections/')})
  const manager = dappConnectorMaker(storage, handlerWallet, api)
  return manager
}
