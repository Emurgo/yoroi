import {Transaction} from '@emurgo/cross-csl-core'
import {connectionStorageMaker, dappConnectorApiMaker, dappConnectorMaker, ResolverWallet} from '@yoroi/dapp-connector'
import {DappConnector} from '@yoroi/dapp-connector'
import {App, Wallet} from '@yoroi/types'
import BigNumber from 'bignumber.js'

import {cip30ExtensionMaker} from '../../../yoroi-wallets/cardano/cip30/cip30'
import {cip95ExtensionMaker, supportsCIP95} from '../../../yoroi-wallets/cardano/cip95/cip95'
import {YoroiWallet} from '../../../yoroi-wallets/cardano/types'
import {collateralConfig} from '../../../yoroi-wallets/cardano/utxoManager/utxos'

function hasProtocol(url: string) {
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
  isSingleAddress: boolean
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
  isSingleAddress: false,
})

export const isGoogleSearchItem = (dApp: DAppItem) => dApp.id === googleDappId

type CreateDappConnectorOptions = {
  appStorage: App.Storage
  wallet: YoroiWallet
  meta: Wallet.Meta
  confirmConnection: (origin: string, manager: DappConnector) => Promise<boolean>
  signTx: (options: {cbor: string; manager: DappConnector}) => Promise<string>
  signData: (address: string, payload: string) => Promise<string>
  signTxWithHW: (options: {cbor: string; partial?: boolean; manager: DappConnector}) => Promise<Transaction>
  signDataWithHW: (address: string, payload: string) => Promise<{signature: string; key: string}>
  sendReorganisationTx: ({manager}: {manager: DappConnector}) => Promise<void>
}

export const createDappConnector = (options: CreateDappConnectorOptions) => {
  const {wallet, meta, appStorage, confirmConnection, signTx, signData} = options
  const api = dappConnectorApiMaker()
  const cip30 = cip30ExtensionMaker(wallet, meta)
  const cip95 = supportsCIP95(meta.implementation) ? cip95ExtensionMaker(wallet, meta) : null

  const cip95handler = cip95
    ? {
        signData: async (address: string, payload: string) => {
          if (meta.isHW) {
            return options.signDataWithHW(address, payload)
          }

          const rootKey = await signData(address, payload)
          return cip95.signData(rootKey, address, payload)
        },
        getPubDRepKey: () => cip95.getPubDRepKey(),
        getRegisteredPubStakeKeys: () => cip95.getRegisteredPubStakeKeys(),
        getUnregisteredPubStakeKeys: () => cip95.getUnregisteredPubStakeKeys(),
      }
    : undefined

  const handlerWallet: ResolverWallet = {
    network: wallet.networkManager.network,
    id: wallet.id,
    networkId: wallet.networkManager.chainId,
    getUsedAddresses: (params) => cip30.getUsedAddresses(params),
    getUnusedAddresses: () => cip30.getUnusedAddresses(),
    getBalance: (tokenId) => cip30.getBalance(tokenId),
    getChangeAddress: () => cip30.getChangeAddress(),
    getRewardAddresses: () => cip30.getRewardAddresses(),
    submitTx: (cbor) => cip30.submitTx(cbor),
    getCollateral: (value) => cip30.getCollateral(value),
    getUtxos: (value, pagination) => cip30.getUtxos(value, pagination),
    confirmConnection: (origin: string) => confirmConnection(origin, manager),
    signData: async (address, payload) => {
      if (meta.isHW) {
        return options.signDataWithHW(address, payload)
      }

      const rootKey = await signData(address, payload)
      return cip30.signData(rootKey, address, payload)
    },
    signTx: async (cbor: string, partial?: boolean) => {
      if (meta.isHW) {
        const tx = await options.signTxWithHW({cbor, partial, manager})
        return tx.witnessSet()
      }

      const rootKey = await signTx({cbor, manager})
      return cip30.signTx(rootKey, cbor, partial)
    },
    // NOTE: amount (value argument) is a CIP-30 requirement for getCollateral method
    // but in Yoroi collateral is generated with minimum amount at the moment
    sendReorganisationTx: async (value?: string) => {
      if (value && new BigNumber(value).gt(new BigNumber(collateralConfig.maxLovelace))) {
        return Promise.reject(new Error('Collateral value is too high'))
      }

      return options.sendReorganisationTx({manager})
    },
    cip95: cip95handler,
  }
  const storage = connectionStorageMaker({storage: appStorage.join('dapp-connections/')})
  const manager = dappConnectorMaker(storage, handlerWallet, api)
  return manager
}

export const getDappFallbackLogo = (website: string) => {
  const withoutProtocol = website.replace(/(^\w+:|^)\/\//, '')
  return `https://api.faviconkit.com/${withoutProtocol}/32`
}
