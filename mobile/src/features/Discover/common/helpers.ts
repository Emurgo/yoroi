import {
  YoroiWallet,
  cip30ExtensionMaker,
  cip95ExtensionMaker,
  collateralConfig,
  supportsCIP95,
} from '@yoroi/cardano-wallet'
import {
  DappConnector,
  ResolverWallet,
  connectionStorageMaker,
  dappConnectorMaker,
} from '@yoroi/dapp-connector'
import {App, Wallet} from '@yoroi/types'

import {Transaction} from '@emurgo/cross-csl-core'
import BigNumber from 'bignumber.js'

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

export const DAPP_LOGO_BASE_URL =
  'https://raw.githubusercontent.com/Emurgo/yoroi-config/refs/heads/main/images'

export type DAppItem = {
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
const directUrlId = 'direct_url'

/**c
 * Checks if a string looks like a URL
 * Matches patterns like:
 * - example.com
 * - www.example.com
 * - http://example.com
 * - https://example.com
 * - example.com/path
 */
export const looksLikeUrl = (str: string): boolean => {
  if (!str || str.trim() === '') return false

  const trimmed = str.trim()

  // Check if it already has a protocol
  if (hasProtocol(trimmed)) {
    try {
      const url = new URL(trimmed)
      return !!url
    } catch {
      return false
    }
  }

  // Check for domain-like patterns (contains a dot and looks like a domain)
  // Matches: example.com, www.example.com, subdomain.example.com
  // But not: just words, single word, or strings without dots
  const domainPattern =
    /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(\/.*)?$/

  // Also check for localhost patterns
  const localhostPattern = /^localhost(:\d+)?(\/.*)?$/i

  return domainPattern.test(trimmed) || localhostPattern.test(trimmed)
}

export const getDirectUrlItem = (url: string): DAppItem => {
  const normalizedUrl = urlWithProtocol(url)
  try {
    const parsedUrl = new URL(normalizedUrl)
    const domainName = parsedUrl.hostname.replace(/^www\./, '')

    return {
      id: directUrlId,
      name: domainName,
      description: 'Navigate to URL',
      category: 'url',
      logo: '',
      uri: normalizedUrl,
      origins: [parsedUrl.origin],
      isSingleAddress: false,
    }
  } catch {
    // Fallback if URL parsing fails
    return {
      id: directUrlId,
      name: url,
      description: 'Navigate to URL',
      category: 'url',
      logo: '',
      uri: normalizedUrl,
      origins: [],
      isSingleAddress: false,
    }
  }
}

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
export const isDirectUrlItem = (dApp: DAppItem) => dApp.id === directUrlId

type CreateDappConnectorOptions = {
  appStorage: App.Storage
  wallet: YoroiWallet
  meta: Wallet.Meta
  confirmConnection: (
    origin: string,
    manager: DappConnector,
  ) => Promise<boolean>
  signTx: (options: {cbor: string; manager: DappConnector}) => Promise<string>
  signData: (address: string, payload: string) => Promise<string>
  signTxWithHW: (options: {
    cbor: string
    partial?: boolean
  }) => Promise<Transaction>
  signDataWithHW: (
    address: string,
    payload: string,
  ) => Promise<{signature: string; key: string}>
  sendReorganisationTx: ({
    manager,
    value,
  }: {
    manager: DappConnector
    value?: string
  }) => Promise<void>
}

export const createDappConnector = (options: CreateDappConnectorOptions) => {
  const {wallet, meta, appStorage, confirmConnection, signTx, signData} =
    options
  const cip30 = cip30ExtensionMaker(wallet, meta, {
    createCollateralEntry: wallet._dependencies.createCollateralEntry,
  })
  const cip95 = supportsCIP95(meta.implementation)
    ? cip95ExtensionMaker(wallet, meta)
    : null

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
    submitTx: async (cbor) => {
      return await cip30.submitTx(cbor)
    },
    getCollateral: async (value) => await cip30.getCollateral(value),
    getCollateralInfo: () => {
      const collateralInfo = wallet.getCollateralInfo()
      return {
        collateralId: collateralInfo.collateralId,
        isConfirmed: collateralInfo.isConfirmed,
      }
    },
    getUtxos: async (value, pagination) =>
      await cip30.getUtxos(value, pagination),
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
        const tx = await options.signTxWithHW({cbor, partial})
        // Convert Transaction to signed transaction CBOR hex
        // Transaction is already copied via copyFromCSL, so toBytes() can be called outside scope
        return Buffer.from(tx.toBytes()).toString('hex')
      }

      const rootKey = await signTx({cbor, manager})
      // Return signed transaction CBOR hex string (CIP-30 spec requirement)
      return await cip30.signTx(rootKey, cbor, partial)
    },
    // NOTE: amount (value argument) is a CIP-30 requirement for getCollateral method
    // but in Yoroi collateral is generated with minimum amount at the moment
    sendReorganisationTx: async (value?: string) => {
      if (
        value &&
        new BigNumber(value).gt(new BigNumber(collateralConfig.maxLovelace))
      ) {
        return Promise.reject(new Error('Collateral value is too high'))
      }

      return options.sendReorganisationTx({manager, value})
    },
    cip95: cip95handler,
  }
  const storage = connectionStorageMaker({
    storage: appStorage.join('dapp-connections/'),
  })
  const manager = dappConnectorMaker(storage, handlerWallet)
  return manager
}

export const getDappFallbackLogo = (website: string) => {
  // FaviconKit stopped operations in March 2025, using the favicon from the website
  const withoutProtocol = website.replace(/(^\w+:|^)\/\//, '')
  return `https://${withoutProtocol}/favicon.ico`
}

export const getTabIndexesByOrigins = (
  tabs: Array<{url: string}>,
  origins: string[],
): number[] => {
  return tabs.reduce<number[]>((acc, tab, index) => {
    try {
      const tabOrigin = new URL(tab.url).origin
      if (origins.includes(tabOrigin)) {
        acc.push(index)
      }
    } catch {
      // Invalid URL, skip
    }
    return acc
  }, [])
}
