import {Logger} from '../../../../legacy/logging'
import {HWDeviceInfo} from '../../../hw'
import {makeMemosManager} from '../../../memos'
import {YoroiStorage} from '../../../storage'
import {WalletFactory} from '../../../walletManager'
import {deriveRewardAddressHex, YoroiWallet} from '../../shared'
import {AddressChain} from '../../shared/chain/chain'
import {TransactionManager} from '../../shared/transactionManager/transactionManager'
import {makeUtxoManager} from '../../shared/utxoManager/utxoManager'
import {parseWalletJSON} from '..'
import {
  ACCOUNT_INDEX,
  API_ROOT,
  CIP1852,
  COIN_TYPE,
  DISCOVERY_BLOCK_SIZE,
  DISCOVERY_GAP_SIZE,
  HARD_DERIVATION_START,
  NETWORK_ID,
  WALLET_IMPLEMENTATION_ID,
} from './constants'
import {ShelleyWallet} from './ShelleyWallet'

export const ShelleyWalletFactory: WalletFactory = {
  async create({id, storage, mnemonic, password}) {
    const {rootKey, accountPubKeyHex} = await makeKeys({mnemonic})
    const {internalChain, externalChain} = await addressChains.create({accountPubKeyHex})

    const wallet = await commonCreate({
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
  }) {
    const {internalChain, externalChain} = await addressChains.create({accountPubKeyHex})

    return commonCreate({
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

  async restore({walletMeta, storage}) {
    const data = await storage.getItem('data', parseWalletJSON)
    if (!data) throw new Error('Cannot read saved data')
    Logger.debug('openWallet::data', data)
    Logger.info('restore wallet', walletMeta.name)

    const {internalChain, externalChain} = addressChains.restore({data})

    const wallet = await commonCreate({
      id: walletMeta.id,
      storage,
      internalChain,
      externalChain,
      accountPubKeyHex: data.publicKeyHex ?? internalChain.publicKey, // can be null for versions < 3.0.2, in which case we can just retrieve from address generator
      hwDeviceInfo: data.hwDeviceInfo, // hw wallet
      isReadOnly: data.isReadOnly ?? false, // readonly wallet
      isEasyConfirmationEnabled: data.isEasyConfirmationEnabled,
      lastGeneratedAddressIndex: data.lastGeneratedAddressIndex ?? 0, // AddressManager
    })

    return wallet
  },
}

async function commonCreate({
  id,
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
  storage: YoroiStorage
  internalChain: AddressChain
  externalChain: AddressChain
  isReadOnly: boolean
  isEasyConfirmationEnabled: boolean
  lastGeneratedAddressIndex?: number
}) {
  const rewardAddressHex = await deriveRewardAddressHex(accountPubKeyHex, NETWORK_ID)
  const utxoManager = await makeUtxoManager({storage: storage.join('utxoManager/'), apiUrl: API_ROOT})
  const transactionManager = await TransactionManager.create(storage.join('txs/'))
  const memosManager = await makeMemosManager(storage.join('memos/'))

  const wallet = new ShelleyWallet({
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
}

const makeKeys = async ({mnemonic}: {mnemonic: string}) => {
  const rootKeyPtr = await generateWalletRootKey(mnemonic)
  const rootKey: string = Buffer.from(await rootKeyPtr.asBytes()).toString('hex')

  const purpose = CIP1852
  const accountPubKeyHex = await rootKeyPtr
    .derive(purpose)
    .then((key) => key.derive(COIN_TYPE))
    .then((key) => key.derive(ACCOUNT_INDEX + HARD_DERIVATION_START))
    .then((accountKey) => accountKey.toPublic())
    .then((accountPubKey) => accountPubKey.asBytes())
    .then((bytes) => Buffer.from(bytes).toString('hex'))

  return {
    rootKey,
    accountPubKeyHex,
  }
}

const addressChains = {
  create: async ({accountPubKeyHex}: {accountPubKeyHex: string}) => {
    const internalChain = new AddressChain(
      new AddressGenerator(accountPubKeyHex, 'Internal', WALLET_IMPLEMENTATION_ID, NETWORK_ID),
      DISCOVERY_BLOCK_SIZE,
      DISCOVERY_GAP_SIZE,
    )
    const externalChain = new AddressChain(
      new AddressGenerator(accountPubKeyHex, 'External', WALLET_IMPLEMENTATION_ID, NETWORK_ID),
      DISCOVERY_BLOCK_SIZE,
      DISCOVERY_GAP_SIZE,
    )

    // Create at least one address in each block
    await internalChain.initialize()
    await externalChain.initialize()

    return {internalChain, externalChain}
  },

  restore: ({data}: {data: WalletJSON}) => {
    return {
      internalChain: AddressChain.fromJSON(data.internalChain, NETWORK_ID),
      externalChain: AddressChain.fromJSON(data.externalChain, NETWORK_ID),
    }
  },
}

const encryptAndSaveRootKey = (wallet: YoroiWallet, rootKey: string, password: string) =>
  wallet.encryptedStorage.rootKey.write(rootKey, password)
