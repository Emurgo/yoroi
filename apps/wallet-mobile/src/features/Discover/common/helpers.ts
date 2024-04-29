import {connectionStorageMaker, dappConnectorApiMaker, dappConnectorMaker, ResolverWallet} from '@yoroi/dapp-connector'
import {App} from '@yoroi/types'
import {Alert} from 'react-native'

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

export const createDappConnector = (appStorage: App.Storage, wallet: YoroiWallet) => {
  const api = dappConnectorApiMaker()
  const handlerWallet: ResolverWallet = {
    id: wallet.id,
    networkId: wallet.networkId,
    getUsedAddresses: (params) => wallet.getUsedAddresses(params),
    getUnusedAddresses: () => wallet.getUnusedAddresses(),
    getBalance: (tokenId) => wallet.getBalance(tokenId),
    confirmConnection: async (origin: string) => {
      return new Promise<boolean>((resolve) => {
        // TODO: Use modal with translations here instead of alert
        Alert.alert('Confirm connection', `Do you want to connect to ${origin}?`, [
          {text: 'Cancel', style: 'cancel', onPress: () => resolve(false)},
          {text: 'OK', onPress: () => resolve(true)},
        ])
      })
    },
  }
  const storage = connectionStorageMaker({storage: appStorage.join('dapp-connections/')})
  return dappConnectorMaker(storage, handlerWallet, api)
}
