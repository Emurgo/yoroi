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
  signData: (address: string, payload: string) => Promise<string>
}

export const createDappConnector = (options: CreateDappConnectorOptions) => {
  const {wallet, appStorage, confirmConnection, signTx, signData} = options
  const api = dappConnectorApiMaker()
  const handlerWallet: ResolverWallet = {
    id: wallet.id,
    networkId: wallet.networkId,
    getUsedAddresses: (params) => wallet.CIP30getUsedAddresses(params),
    getUnusedAddresses: () => wallet.CIP30getUnusedAddresses(),
    getBalance: (tokenId) => wallet.CIP30getBalance(tokenId),
    getChangeAddress: () => wallet.CIP30getChangeAddress(),
    getRewardAddresses: () => wallet.CIP30getRewardAddresses(),
    submitTx: (cbor) => wallet.CIP30submitTx(cbor),
    getCollateral: (value) => wallet.CIP30getCollateral(value),
    getUtxos: (value, pagination) => wallet.CIP30getUtxos(value, pagination),
    confirmConnection: (origin: string) => confirmConnection(origin, manager),
    signData: async (address, payload) => {
      const rootKey = await signData(address, payload)
      return wallet.CIP30signData(rootKey, address, payload)
    },
    signTx: async (cbor: string, partial?: boolean) => {
      const rootKey = await signTx(cbor)
      return wallet.CIP30signTx(rootKey, cbor, partial)
    },
  }
  const storage = connectionStorageMaker({storage: appStorage.join('dapp-connections/')})
  const manager = dappConnectorMaker(storage, handlerWallet, api)
  return manager
}

export const getDappFallbackLogo = (website: string) => {
  const withoutProtocol = website.replace(/(^\w+:|^)\/\//, '')
  return `https://api.faviconkit.com/${withoutProtocol}/144`
}
