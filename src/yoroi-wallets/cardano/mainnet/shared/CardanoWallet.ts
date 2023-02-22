/* eslint-disable @typescript-eslint/no-explicit-any */

import {CONFIG, getWalletConfigById, isByron} from '../../../legacy/config'
import {Logger} from '../../../legacy/logging'
import {HWDeviceInfo} from '../../hw'
import {makeMemosManager} from '../../memos'
import {YoroiStorage} from '../../storage'
import type {TokenInfo} from '../../types'
import {parseSafe} from '../../utils/parsing'
import {WalletMeta} from '../../walletManager'
import {generateWalletRootKey, ShelleyWallet, ShelleyWalletTestnet} from '../'
import {AddressChain, AddressChainJSON, AddressGenerator} from '../shared/chain'
import {getCardanoNetworkConfigById} from '../networks'
import {TransactionManager} from '../shared/transactionManager'
import {isYoroiWallet, NetworkId, WalletImplementationId, YoroiWallet} from '../types'
import {deriveRewardAddressHex} from '../utils'
import {makeUtxoManager} from '../utxoManager'

export type ShelleyWalletJSON = {
  version: string
  networkId: NetworkId
  walletImplementationId: WalletImplementationId
  isHW: boolean
  hwDeviceInfo: null | HWDeviceInfo
  isReadOnly: boolean
  isEasyConfirmationEnabled: boolean
  publicKeyHex?: string
  lastGeneratedAddressIndex: number
  internalChain: AddressChainJSON
  externalChain: AddressChainJSON
}

export type ByronWalletJSON = Omit<ShelleyWalletJSON, 'account'>

export type WalletJSON = ShelleyWalletJSON | ByronWalletJSON

export const CardanoWallet = {
  async create({
    id,
    storage,
    mnemonic,
    password,
  }: {
    id: string
    storage: YoroiStorage
    mnemonic: string
    password: string
  }): Promise<YoroiWallet> {
    const data = await storage.getItem('data', parseWalletJSON)
    const implementationId: WalletImplementationId = data?.walletImplementationId ?? 'haskell-shelley'
    const networkId = data?.networkId ?? 1
    const {rootKey, accountPubKeyHex} = await makeKeys({mnemonic, implementationId})
    const {internalChain, externalChain} = await addressChains.create({implementationId, networkId, accountPubKeyHex})

    const wallet = await this.commonCreate({
      id,
      storage,
      accountPubKeyHex,
      hwDeviceInfo: null, // hw wallet
      isReadOnly: false, // readonly wallet
      internalChain,
      externalChain,
      isEasyConfirmationEnabled: false,
    })

    await encryptAndSaveRootKey(wallet, rootKey, password)

    return wallet
  },

  async createBip44({
    id,
    storage,
    accountPubKeyHex,
    hwDeviceInfo, // hw wallet
    isReadOnly, // readonly wallet
  }: {
    accountPubKeyHex: string
    hwDeviceInfo: HWDeviceInfo | null
    id: string
    isReadOnly: boolean
    storage: YoroiStorage
  }): Promise<YoroiWallet> {
    const data = await storage.getItem('data', parseWalletJSON)
    const implementationId: WalletImplementationId = data?.walletImplementationId ?? 'haskell-shelley'
    const networkId = data?.networkId ?? 1
    const {internalChain, externalChain} = await addressChains.create({implementationId, networkId, accountPubKeyHex})

    return this.commonCreate({
      id,
      storage,
      accountPubKeyHex,
      hwDeviceInfo, // hw wallet
      isReadOnly, // readonly wallet
      internalChain,
      externalChain,
      isEasyConfirmationEnabled: false,
    })
  },

  async restore({walletMeta, storage}: {storage: YoroiStorage; walletMeta: WalletMeta}) {
    const data = await storage.getItem('data', parseWalletJSON)
    if (!data) throw new Error('Cannot read saved data')
    Logger.debug('openWallet::data', data)
    Logger.info('restore wallet', walletMeta.name)

    const networkId = data.networkId ?? walletMeta.networkId // can be null for versions < 3.0.0
    const {internalChain, externalChain} = addressChains.restore({data, networkId})

    const wallet = await this.commonCreate({
      id: walletMeta.id,
      networkId,
      storage,
      internalChain,
      externalChain,

      implementationId: data.walletImplementationId ?? walletMeta.walletImplementationId, // can be null for versions < 3.0.2
      accountPubKeyHex: data.publicKeyHex ?? internalChain.publicKey, // can be null for versions < 3.0.2, in which case we can just retrieve from address generator
      hwDeviceInfo: data.hwDeviceInfo, // hw wallet
      isReadOnly: data.isReadOnly ?? false, // readonly wallet
      isEasyConfirmationEnabled: data.isEasyConfirmationEnabled,
      lastGeneratedAddressIndex: data.lastGeneratedAddressIndex ?? 0, // AddressManager
    })

    return wallet
  },

  async commonCreate({
    id,
    networkId,
    storage,
    internalChain,
    externalChain,

    accountPubKeyHex,
    hwDeviceInfo, // hw wallet
    isReadOnly, // readonly wallet
    isEasyConfirmationEnabled,
    lastGeneratedAddressIndex = 0,
  }: {
    accountPubKeyHex: string
    hwDeviceInfo: HWDeviceInfo | null
    id: string
    implementationId: WalletImplementationId
    networkId: NetworkId
    storage: YoroiStorage
    internalChain: AddressChain
    externalChain: AddressChain
    isReadOnly: boolean
    isEasyConfirmationEnabled: boolean
    lastGeneratedAddressIndex?: number
  }) {
    const rewardAddressHex = await deriveRewardAddressHex(accountPubKeyHex, networkId)
    const apiUrl = getCardanoNetworkConfigById(networkId).BACKEND.API_ROOT
    const utxoManager = await makeUtxoManager({storage: storage.join('utxoManager/'), apiUrl})
    const transactionManager = await TransactionManager.create(storage.join('txs/'))
    const memosManager = await makeMemosManager(storage.join('memos/'))

    const wallet: any =
      networkId === 1
        ? new ShelleyWallet({
            storage,
            id,
            utxoManager,
            hwDeviceInfo,
            isReadOnly,
            accountPubKeyHex,
            rewardAddressHex,
            internalChain,
            externalChain,
            isEasyConfirmationEnabled,
            lastGeneratedAddressIndex,
            transactionManager,
            memosManager,
          })
        : new ShelleyWalletTestnet({
            storage,
            id,
            utxoManager,
            hwDeviceInfo,
            isReadOnly,
            accountPubKeyHex,
            rewardAddressHex,
            internalChain,
            externalChain,
            isEasyConfirmationEnabled,
            lastGeneratedAddressIndex,
            transactionManager,
            memosManager,
          })

    await wallet.discoverAddresses()
    wallet.setupSubscriptions()
    wallet.isInitialized = true
    wallet.save()
    wallet.notify({type: 'initialize'})

    if (!isYoroiWallet(wallet)) throw new Error('invalid wallet')
    return wallet
  },
}

const makeKeys = async ({mnemonic, implementationId}: {mnemonic: string; implementationId: WalletImplementationId}) => {
  const rootKeyPtr = await generateWalletRootKey(mnemonic)
  const rootKey: string = Buffer.from(await rootKeyPtr.asBytes()).toString('hex')

  const purpose = isByron(implementationId)
    ? CONFIG.NUMBERS.WALLET_TYPE_PURPOSE.BIP44
    : CONFIG.NUMBERS.WALLET_TYPE_PURPOSE.CIP1852
  const accountPubKeyHex = await rootKeyPtr
    .derive(purpose)
    .then((key) => key.derive(CONFIG.NUMBERS.COIN_TYPES.CARDANO))
    .then((key) => key.derive(CONFIG.NUMBERS.ACCOUNT_INDEX + CONFIG.NUMBERS.HARD_DERIVATION_START))
    .then((accountKey) => accountKey.toPublic())
    .then((accountPubKey) => accountPubKey.asBytes())
    .then((bytes) => Buffer.from(bytes).toString('hex'))

  return {
    rootKey,
    accountPubKeyHex,
  }
}

const addressChains = {
  create: async ({
    accountPubKeyHex,
    implementationId,
    networkId,
  }: {
    accountPubKeyHex: string
    implementationId: WalletImplementationId
    networkId: NetworkId
  }) => {
    const walletConfig = getWalletConfigById(implementationId)
    const internalChain = new AddressChain(
      new AddressGenerator(accountPubKeyHex, 'Internal', implementationId, networkId),
      walletConfig.DISCOVERY_BLOCK_SIZE,
      walletConfig.DISCOVERY_GAP_SIZE,
    )
    const externalChain = new AddressChain(
      new AddressGenerator(accountPubKeyHex, 'External', implementationId, networkId),
      walletConfig.DISCOVERY_BLOCK_SIZE,
      walletConfig.DISCOVERY_GAP_SIZE,
    )

    // Create at least one address in each block
    await internalChain.initialize()
    await externalChain.initialize()

    return {internalChain, externalChain}
  },

  restore: ({data, networkId}: {data: WalletJSON; networkId: NetworkId}) => {
    return {
      internalChain: AddressChain.fromJSON(data.internalChain, networkId),
      externalChain: AddressChain.fromJSON(data.externalChain, networkId),
    }
  },
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
  'networkId',
  'walletImplementationId',
  'internalChain',
  'externalChain',
  'isEasyConfirmationEnabled',
  'lastGeneratedAddressIndex',
]

export const primaryTokenInfo: Record<'mainnet' | 'testnet', TokenInfo> = {
  mainnet: {
    id: '',
    name: 'ADA',
    decimals: 6,
    description: 'Cardano',
    ticker: 'ADA',
    symbol: '₳',
    group: '',
    logo: '',
    url: '',
    fingerprint: '',
  },
  testnet: {
    id: '',
    name: 'TADA',
    decimals: 6,
    description: 'Cardano',
    ticker: 'TADA',
    symbol: '₳',
    group: '',
    logo: '',
    url: '',
    fingerprint: '',
  },
}

const encryptAndSaveRootKey = (wallet: YoroiWallet, rootKey: string, password: string) =>
  wallet.encryptedStorage.rootKey.write(rootKey, password)
