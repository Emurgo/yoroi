// @flow

import _ from 'lodash'
import {BigNumber} from 'bignumber.js'
import {defaultMemoize} from 'reselect'
import uuid from 'uuid'
import ExtendableError from 'es6-error'
import {
  Address,
  AddressDiscrimination,
  Bip32PublicKey,
  Bip32PrivateKey,
} from 'react-native-chain-libs'
import DeviceInfo from 'react-native-device-info'

import storage from '../utils/storage'
import KeyStore from './KeyStore'
import {AddressChain, AddressGenerator} from './chain'
import * as util from './byron/util'
import * as jormungandrUtil from './jormungandr/util'
import {
  createDelegationTx,
  signDelegationTx,
  filterAddressesByStakingKey,
} from './jormungandr/delegationUtils'
import {ADDRESS_TYPE_TO_CHANGE} from './commonUtils'
import * as api from '../api/byron/api'
import * as jormunApi from '../api/jormungandr/api'
import {CONFIG} from '../config/config'
import {NETWORK_REGISTRY} from '../config/types'
import {isJormungandr} from '../config/networks'
import assert from '../utils/assert'
import {ObjectValues} from '../utils/flow'
import {Logger} from '../utils/logging'
import {
  synchronize,
  nonblockingSynchronize,
  IsLockedError,
} from '../utils/promise'
import {TransactionCache} from './transactionCache'
import {validatePassword} from '../utils/validators'
import {
  canBiometricEncryptionBeEnabled,
  isSystemAuthSupported,
} from '../helpers/deviceSettings'

import type {
  Addressing,
  RawUtxo,
  TransactionInput,
  PoolInfoRequest,
  PreparedTransactionData,
  V3SignedTx,
  V3UnsignedTxAddressedUtxoData,
  TxBodiesRequest,
  TxBodiesResponse,
} from '../types/HistoryTransaction'
import type {Mutex} from '../utils/promise'
import type {CryptoAccount} from './byron/util'
import type {HWDeviceInfo} from './byron/ledgerUtils'
import type {DelegationTxData, PoolData} from './jormungandr/delegationUtils'
import type {NetworkId} from '../config/types'

/**
 * returns all used addresses (external and change addresses concatenated)
 * including addressing info
 * note: uses byron api by default
 */
export const mnemonicsToAddresses = async (
  mnemonic: string,
): Promise<Array<{|address: string, ...Addressing|}>> => {
  const masterKey = await util.getMasterKeyFromMnemonic(mnemonic)
  const account = await util.getAccountFromMasterKey(masterKey)
  const internalChain = new AddressChain(
    new AddressGenerator(account, 'Internal'),
  )
  const externalChain = new AddressChain(
    new AddressGenerator(account, 'External'),
  )
  const chains = [['Internal', internalChain], ['External', externalChain]]
  for (const chain of chains) {
    await chain[1].initialize()
    await chain[1].sync(api.filterUsedAddresses)
  }
  // get addresses in chunks
  const addrChunks = [
    ...internalChain.getBlocks(),
    ...externalChain.getBlocks(),
  ]
  const filteredAddresses = []
  for (let i = 0; i < addrChunks.length; i++) {
    filteredAddresses.push(...(await api.filterUsedAddresses(addrChunks[i])))
  }
  // return addresses with addressing info
  return filteredAddresses.map((addr) => {
    let change
    let index
    if (internalChain.isMyAddress(addr)) {
      change = CONFIG.NUMBERS.CHAIN_DERIVATIONS.INTERNAL
      index = internalChain.getIndexOfAddress(addr)
    } else if (externalChain.isMyAddress(addr)) {
      change = CONFIG.NUMBERS.CHAIN_DERIVATIONS.EXTERNAL
      index = externalChain.getIndexOfAddress(addr)
    } else {
      // should not happen
      throw new Error('mnemonicsToAddresses: could not find address index')
    }
    return {
      address: addr,
      addressing: {
        account: CONFIG.NUMBERS.ACCOUNT_INDEX,
        change,
        index,
      },
    }
  })
}

// note: uses byron api by default
export const balanceForAddresses = async (
  addresses: Array<string>,
): Promise<{fundedAddresses: Array<string>, sum: BigNumber}> => {
  const {fundedAddresses, sum} = await api.bulkFetchUTXOSumForAddresses(
    addresses,
  )
  return {
    fundedAddresses,
    sum,
  }
}

export type EncryptionMethod = 'BIOMETRICS' | 'SYSTEM_PIN' | 'MASTER_PASSWORD'

type WalletState = {|
  lastGeneratedAddressIndex: number,
|}

export class InvalidState extends ExtendableError {}

export class Wallet {
  // $FlowFixMe null
  _id: string = null

  _networkId: NetworkId = -1

  _isHW: boolean = false

  _hwDeviceInfo: ?HWDeviceInfo

  _isEasyConfirmationEnabled: boolean = false

  // $FlowFixMe null
  _internalChain: AddressChain = null
  // $FlowFixMe null
  _externalChain: AddressChain = null

  // chimeric account address
  _chimericAccountAddress: ?string

  // last known version the wallet has been created/restored
  _version: ?string

  _state: WalletState = {
    lastGeneratedAddressIndex: 0,
  }

  _isInitialized: boolean = false
  _doFullSyncMutex: Mutex = {name: 'doFullSyncMutex', lock: null}
  _subscriptions: Array<(Wallet) => any> = []
  // $FlowFixMe null
  _transactionCache: TransactionCache = null
  _isUsedAddressIndexSelector = defaultMemoize((perAddressTxs) =>
    _.mapValues(perAddressTxs, (txs) => {
      assert.assert(!!txs, 'perAddressTxs cointains false-ish value')
      return txs.length > 0
    }),
  )

  /* global $Shape */
  updateState(update: $Shape<WalletState>) {
    Logger.debug('WalletManager update state')
    Logger.debug('Update', update)

    this._state = {
      ...this._state,
      ...update,
    }

    this.notify()
  }

  async encryptAndSaveMasterKey(
    encryptionMethod: EncryptionMethod,
    masterKey: string,
    password?: string,
  ) {
    await KeyStore.storeData(this._id, encryptionMethod, masterKey, password)
  }

  async getDecryptedMasterKey(masterPassword: string, intl: any) {
    return await KeyStore.getData(
      this._id,
      'MASTER_PASSWORD',
      '',
      masterPassword,
      intl,
    )
  }

  async enableEasyConfirmation(masterPassword: string, intl: any) {
    const decryptedMasterKey = await this.getDecryptedMasterKey(
      masterPassword,
      intl,
    )

    await this.encryptAndSaveMasterKey('BIOMETRICS', decryptedMasterKey)
    await this.encryptAndSaveMasterKey('SYSTEM_PIN', decryptedMasterKey)

    this._isEasyConfirmationEnabled = true
  }

  async changePassword(masterPassword: string, newPassword: string, intl: any) {
    const isNewPasswordValid = _.isEmpty(
      validatePassword(newPassword, newPassword),
    )

    if (!isNewPasswordValid) {
      throw new Error('New password is not valid')
    }

    const masterKey = await this.getDecryptedMasterKey(masterPassword, intl)

    await this.encryptAndSaveMasterKey(
      'MASTER_PASSWORD',
      masterKey,
      newPassword,
    )
  }

  // needs to be bound
  notify = () => {
    this._subscriptions.forEach((handler) => handler(this))
  }

  subscribe(handler: (Wallet) => any) {
    this._subscriptions.push(handler)
  }

  get transactions() {
    return this._transactionCache.transactions
  }

  get confirmationCounts() {
    return this._transactionCache.confirmationCounts
  }

  _setupSubscriptions() {
    this._transactionCache.subscribe(this.notify)
    this._internalChain.addSubscriberToNewAddresses(this.notify)
    this._externalChain.addSubscriberToNewAddresses(this.notify)
  }

  async _initialize(
    networkId: NetworkId,
    account: CryptoAccount | string,
    chimericAccountAddr: ?string,
    hwDeviceInfo: ?HWDeviceInfo,
  ) {
    this._networkId = networkId

    this._isHW = hwDeviceInfo != null

    this._hwDeviceInfo = hwDeviceInfo

    this._transactionCache = new TransactionCache()

    // initialize address chains
    this._internalChain = new AddressChain(
      new AddressGenerator(account, 'Internal', isJormungandr(networkId)),
    )
    this._externalChain = new AddressChain(
      new AddressGenerator(account, 'External', isJormungandr(networkId)),
    )

    this._chimericAccountAddress = chimericAccountAddr

    this._version = DeviceInfo.getVersion()

    // Create at least one address in each block
    await this._internalChain.initialize()
    await this._externalChain.initialize()

    this._setupSubscriptions()
    this.notify()

    this._isInitialized = true
    return this._id
  }

  async _create(mnemonic: string, newPassword: string, networkId: NetworkId) {
    Logger.info(`create wallet (networkId=${String(networkId)})`)
    this._id = uuid.v4()
    assert.assert(!this._isInitialized, 'createWallet: !isInitialized')
    const masterKey = await jormungandrUtil.generateWalletRootKey(mnemonic)
    const masterKeyHex = Buffer.from(await masterKey.as_bytes()).toString('hex')
    await this.encryptAndSaveMasterKey(
      'MASTER_PASSWORD',
      masterKeyHex,
      newPassword,
    )
    let account: CryptoAccount | string
    let chimericAccountAddr
    if (isJormungandr(networkId)) {
      const accountKey = await (await (await masterKey.derive(
        CONFIG.NUMBERS.WALLET_TYPE_PURPOSE.CIP1852,
      )).derive(CONFIG.NUMBERS.COIN_TYPES.CARDANO)).derive(
        0 + CONFIG.NUMBERS.HARD_DERIVATION_START,
      )
      const accountPubKey = await accountKey.to_public()
      const stakingKey = await (await (await accountPubKey.derive(
        CONFIG.NUMBERS.CHAIN_DERIVATIONS.CHIMERIC_ACCOUNT,
      )).derive(CONFIG.NUMBERS.STAKING_KEY_INDEX)).to_raw_key()
      const chimericAccountAddrPtr = await Address.account_from_public_key(
        stakingKey,
        CONFIG.NETWORKS.JORMUNGANDR.IS_MAINNET
          ? await AddressDiscrimination.Production
          : await AddressDiscrimination.Test,
      )
      account = Buffer.from(await accountPubKey.as_bytes()).toString('hex')
      chimericAccountAddr = Buffer.from(
        await chimericAccountAddrPtr.as_bytes(),
      ).toString('hex')
    } else {
      account = await util.getAccountFromMasterKey(masterKeyHex)
    }

    return await this._initialize(
      networkId,
      account,
      chimericAccountAddr,
      null, // this is not a HW
    )
  }

  async _createWithBip44Account(
    accountPublicKey: string,
    networkId: NetworkId,
    hwDeviceInfo: ?HWDeviceInfo,
  ) {
    Logger.info(
      `create wallet with account pub key (networkId=${String(networkId)})`,
    )
    Logger.debug('account pub key', accountPublicKey)
    this._id = uuid.v4()
    assert.assert(!this._isInitialized, 'createWallet: !isInitialized')
    const chimericAccountAddr = null // only byron wallets supported for now
    const accountObj: CryptoAccount = {
      root_cached_key: accountPublicKey,
      derivation_scheme: 'V2',
    }
    return await this._initialize(
      networkId,
      accountObj,
      chimericAccountAddr,
      hwDeviceInfo,
    )
  }

  async _integrityCheck(data) {
    try {
      if (isJormungandr(this._networkId)) {
        const accountHex = this._internalChain._addressGenerator.account
        if (!(typeof accountHex === 'string' || accountHex instanceof String)) {
          throw new Error('wallet::_integrityCheck: invalid account')
        }
        // note(v-almonacid): renamed accountAddress by chimericAccountAddress
        // for more clarity, so this check step is needed
        if (this._chimericAccountAddress == null) {
          const retrieveChimericAddr = async (data) => {
            if (data.accountAddress != null) return data.accountAddress
            const accountPubKey = await Bip32PublicKey.from_bytes(
              Buffer.from(accountHex, 'hex'),
            )
            const stakingKey = await (await (await accountPubKey.derive(
              CONFIG.NUMBERS.CHAIN_DERIVATIONS.CHIMERIC_ACCOUNT,
            )).derive(CONFIG.NUMBERS.STAKING_KEY_INDEX)).to_raw_key()
            const chimericAccountAddrPtr = await Address.account_from_public_key(
              stakingKey,
              CONFIG.NETWORKS.JORMUNGANDR.IS_MAINNET
                ? await AddressDiscrimination.Production
                : await AddressDiscrimination.Test,
            )
            return Buffer.from(
              await chimericAccountAddrPtr.as_bytes(),
            ).toString('hex')
          }
          this._chimericAccountAddress = await retrieveChimericAddr(data)
        }
      }
      if (this._networkId === NETWORK_REGISTRY.UNDEFINED) {
        // prettier-ignore
        this._networkId =
          data.isShelley != null
            ? data.isShelley
              ? NETWORK_REGISTRY.JORMUNGANDR
              : NETWORK_REGISTRY.BYRON_MAINNET
            : (() => {
              throw new Error('wallet::_integrityCheck: networkId')
            })()
      }
    } catch (e) {
      Logger.error('wallet::_integrityCheck', e)
      throw new InvalidState()
    }
  }

  async _restore(data) {
    Logger.info('restore wallet')
    assert.assert(!this._isInitialized, 'restoreWallet: !isInitialized')
    this._state = {
      lastGeneratedAddressIndex: data.lastGeneratedAddressIndex,
    }
    this._networkId =
      data.networkId != null ? data.networkId : NETWORK_REGISTRY.UNDEFINED
    this._isHW = data.isHW != null ? data.isHW : false
    this._hwDeviceInfo = data.hwDeviceInfo
    // note(v-almonacid): chimericAccountAddr can be null. _integrityCheck is
    // required for versions <= 2.1.0
    this._chimericAccountAddress = data.chimericAccountAddress
    this._version = data.version
    this._internalChain = AddressChain.fromJSON(data.internalChain)
    this._externalChain = AddressChain.fromJSON(data.externalChain)
    this._transactionCache = TransactionCache.fromJSON(data.transactionCache)
    this._isEasyConfirmationEnabled = data.isEasyConfirmationEnabled

    await this._integrityCheck(data)

    // subscriptions
    this._setupSubscriptions()

    this._isInitialized = true
  }

  async doFullSync() {
    return await synchronize(this._doFullSyncMutex, () => this._doFullSync())
  }

  async tryDoFullSync() {
    try {
      return await nonblockingSynchronize(this._doFullSyncMutex, () =>
        this._doFullSync(),
      )
    } catch (e) {
      if (e instanceof IsLockedError) {
        return null
      } else {
        throw e
      }
    }
  }

  getLastUsedIndex(chain: AddressChain): number {
    for (let i = chain.size() - 1; i >= 0; i--) {
      if (this.isUsedAddress(chain.addresses[i])) {
        return i
      }
    }
    return -1
  }

  async _doFullSync() {
    Logger.info('Do full sync')
    assert.assert(this._isInitialized, 'doFullSync: isInitialized')
    const filterFn = isJormungandr(this._networkId)
      ? jormunApi.filterUsedAddresses
      : api.filterUsedAddresses
    await Promise.all([
      this._internalChain.sync(filterFn),
      this._externalChain.sync(filterFn),
    ])
    // TODO: implement for shelley
    if (!isJormungandr(this._networkId)) {
      Logger.info('Discovery done, now syncing transactions')
      let keepGoing = true
      while (keepGoing) {
        keepGoing = await this._transactionCache.doSyncStep([
          ...this._internalChain.getBlocks(),
          ...this._externalChain.getBlocks(),
        ])
      }
    }

    // update receive screen to include any new addresses found
    const lastUsedIndex = this.getLastUsedIndex(this._externalChain)
    if (lastUsedIndex > this._state.lastGeneratedAddressIndex) {
      this._state.lastGeneratedAddressIndex = lastUsedIndex
    }
    return this._transactionCache.transactions
  }

  get chimericAccountAddress() {
    assert.assert(
      isJormungandr(this._networkId),
      'get chimericAccountAddress: isJormungandr',
    )
    return this._chimericAccountAddress
  }

  get internalAddresses() {
    return this._internalChain.addresses
  }

  get externalAddresses() {
    return this._externalChain.addresses
  }

  isUsedAddress(address: string) {
    return (
      !!this._transactionCache.perAddressTxs[address] &&
      this._transactionCache.perAddressTxs[address].length > 0
    )
  }

  get isUsedAddressIndex() {
    return this._isUsedAddressIndexSelector(
      this._transactionCache.perAddressTxs,
    )
  }

  get numReceiveAddresses() {
    return this._state.lastGeneratedAddressIndex + 1
  }

  canGenerateNewReceiveAddress() {
    const lastUsedIndex = this.getLastUsedIndex(this._externalChain)
    const maxIndex = lastUsedIndex + CONFIG.WALLET.MAX_GENERATED_UNUSED
    if (this._state.lastGeneratedAddressIndex >= maxIndex) {
      return false
    }
    return this.numReceiveAddresses < this.externalAddresses.length
  }

  generateNewUiReceiveAddressIfNeeded() {
    /* new addresse is automatically generated when you use the latest unused */
    const lastGeneratedAddress = this._externalChain.addresses[
      this._state.lastGeneratedAddressIndex
    ]
    if (!this.isUsedAddress(lastGeneratedAddress)) {
      return false
    }
    return this.generateNewUiReceiveAddress()
  }

  generateNewUiReceiveAddress(): boolean {
    if (!this.canGenerateNewReceiveAddress()) return false

    this.updateState({
      lastGeneratedAddressIndex: this._state.lastGeneratedAddressIndex + 1,
    })

    return true
  }

  transformUtxoToInput(utxo: RawUtxo): TransactionInput {
    const chains = [
      ['Internal', this._internalChain],
      ['External', this._externalChain],
    ]

    let addressInfo = null
    chains.forEach(([type, chain]) => {
      if (chain.isMyAddress(utxo.receiver)) {
        addressInfo = {
          change: ADDRESS_TYPE_TO_CHANGE[type],
          index: chain.getIndexOfAddress(utxo.receiver),
        }
      }
    })

    /* :: if (!addressInfo) throw 'assert' */
    assert.assert(addressInfo, `Address not found for utxo: ${utxo.receiver}`)

    return {
      ptr: {
        id: utxo.tx_hash,
        index: utxo.tx_index,
      },
      value: {
        address: utxo.receiver,
        value: utxo.amount,
      },
      addressing: {
        account: CONFIG.NUMBERS.ACCOUNT_INDEX,
        change: addressInfo.change,
        index: addressInfo.index,
      },
    }
  }

  getChangeAddress() {
    const candidateAddresses = this._internalChain.addresses
    const unseen = candidateAddresses.filter(
      (addr) => !this.isUsedAddress(addr),
    )
    assert.assert(unseen.length > 0, 'Cannot find change address')
    return _.first(unseen)
  }

  async prepareTransaction(
    utxos: Array<RawUtxo>,
    receiverAddress: string,
    amount: BigNumber,
  ): Promise<PreparedTransactionData> {
    const inputs = utxos.map((utxo) => this.transformUtxoToInput(utxo))

    const outputs = [{address: receiverAddress, value: amount.toFixed(0)}]
    const changeAddress = this.getChangeAddress()
    const fakeWallet = await util.generateFakeWallet()
    const fakeTx = await util.signTransaction(
      fakeWallet,
      inputs,
      outputs,
      changeAddress,
    )
    Logger.debug('Inputs', inputs)
    Logger.debug('Outputs', outputs)
    Logger.debug('Change address', changeAddress)

    return {
      inputs,
      outputs,
      changeAddress,
      fee: fakeTx.fee,
    }
  }

  async signTx(
    transaction: PreparedTransactionData,
    decryptedMasterKey: string,
  ) {
    const {inputs, outputs, changeAddress, fee} = transaction

    const signedTxData = await util.signTransaction(
      await util.getWalletFromMasterKey(decryptedMasterKey),
      inputs,
      outputs,
      changeAddress,
    )

    assert.assert(fee.eq(signedTxData.fee), 'Transaction fee does not match')

    return Buffer.from(signedTxData.cbor_encoded_tx, 'hex').toString('base64')
  }

  async submitTransaction(signedTx: string) {
    const submitTxFn = isJormungandr(this._networkId)
      ? jormunApi.submitTransaction
      : api.submitTransaction
    const response = await submitTxFn(signedTx)
    Logger.info(response)
    return response
  }

  async getStakingKey() {
    assert.assert(
      isJormungandr(this._networkId),
      'getStakingKey: isJormungandr',
    )
    // TODO: save account public key as class member to avoid fetching
    // from internal chain?
    const accountHex = this._internalChain._addressGenerator.account
    if (!(typeof accountHex === 'string' || accountHex instanceof String)) {
      throw new Error('wallet::getStakingKey: invalid account')
    }
    const accountPubKey = await Bip32PublicKey.from_bytes(
      Buffer.from(accountHex, 'hex'),
    )
    const stakingKey = await (await (await accountPubKey.derive(
      CONFIG.NUMBERS.CHAIN_DERIVATIONS.CHIMERIC_ACCOUNT,
    )).derive(CONFIG.NUMBERS.STAKING_KEY_INDEX)).to_raw_key()
    Logger.info(
      `getStakingKey: ${Buffer.from(await stakingKey.as_bytes()).toString(
        'hex',
      )}`,
    )
    return stakingKey
  }

  async getChangeAddressShelley() {
    assert.assert(
      isJormungandr(this._networkId),
      'getChangeAddressShelley: isJormungandr',
    )
    const nextInternal = await this._internalChain.getNextUnused(
      jormunApi.filterUsedAddresses,
    )
    return {
      address: nextInternal,
      addressing: {
        account: CONFIG.NUMBERS.ACCOUNT_INDEX,
        change: CONFIG.NUMBERS.CHAIN_DERIVATIONS.INTERNAL,
        index: this._internalChain.getIndexOfAddress(nextInternal),
      },
    }
  }

  async getTxsBodiesForUTXOs(
    request: TxBodiesRequest,
  ): Promise<TxBodiesResponse> {
    const getTxsBodiesForUTXOsFn = isJormungandr(this._networkId)
      ? api.getTxsBodiesForUTXOs
      : jormunApi.getTxsBodiesForUTXOs
    return await getTxsBodiesForUTXOsFn(request)
  }

  async getAllUtxosForKey(utxos: Array<RawUtxo>) {
    assert.assert(
      isJormungandr(this._networkId),
      'getAllUtxosForKey: isJormungandr',
    )
    return await filterAddressesByStakingKey(
      await this.getStakingKey(),
      this.asAddressedUtxo(utxos),
    )
  }

  getAddressingInfo(address: string) {
    const chains = [
      ['Internal', this._internalChain],
      ['External', this._externalChain],
    ]
    let addressInfo = null
    chains.forEach(([type, chain]) => {
      if (chain.isMyAddress(address)) {
        addressInfo = {
          account: CONFIG.NUMBERS.ACCOUNT_INDEX,
          change: ADDRESS_TYPE_TO_CHANGE[type],
          index: chain.getIndexOfAddress(address),
        }
      }
    })
    return addressInfo
  }

  asAddressedUtxo(utxos: Array<RawUtxo>) {
    const addressedUtxos = utxos.map((utxo) => {
      const addressInfo = this.getAddressingInfo(utxo.receiver)
      if (addressInfo == null) {
        throw new Error(`Address not found for utxo: ${utxo.receiver}`)
      }
      return {
        ...utxo,
        addressing: addressInfo,
      }
    })
    return addressedUtxos
  }

  async prepareDelegationTx(
    poolData: PoolData,
    valueInAccount: number,
    utxos: Array<RawUtxo>,
  ): Promise<DelegationTxData> {
    assert.assert(
      isJormungandr(this._networkId),
      'prepareDelegationTx: isJormungandr',
    )
    const stakingKey = await this.getStakingKey()
    const changeAddr = await this.getChangeAddressShelley()
    const addressedUtxos = this.asAddressedUtxo(utxos)

    const resp = await createDelegationTx(
      poolData,
      valueInAccount,
      addressedUtxos,
      stakingKey,
      changeAddr,
    )
    return resp
  }

  async signDelegationTx(
    unsignedTx: V3UnsignedTxAddressedUtxoData,
    decryptedMasterKey: string,
  ): Promise<V3SignedTx> {
    assert.assert(
      isJormungandr(this._networkId),
      'signDelegationTx: isJormungandr',
    )
    Logger.debug('wallet::signDelegationTx::unsignedTx ', unsignedTx)
    const masterKey = await Bip32PrivateKey.from_bytes(
      Buffer.from(decryptedMasterKey, 'hex'),
    )
    const accountPvrKey = await (await (await masterKey.derive(
      CONFIG.NUMBERS.WALLET_TYPE_PURPOSE.CIP1852,
    )).derive(CONFIG.NUMBERS.COIN_TYPES.CARDANO)).derive(
      0 + CONFIG.NUMBERS.HARD_DERIVATION_START,
    )

    // get staking key as PrivateKey
    const stakingKey = await (await (await accountPvrKey.derive(
      CONFIG.NUMBERS.CHAIN_DERIVATIONS.CHIMERIC_ACCOUNT,
    )).derive(CONFIG.NUMBERS.STAKING_KEY_INDEX)).to_raw_key()

    return await signDelegationTx(unsignedTx, accountPvrKey, stakingKey)
  }

  async fetchUTXOs() {
    const fetchFn = isJormungandr(this._networkId)
      ? jormunApi.bulkFetchUTXOsForAddresses
      : api.bulkFetchUTXOsForAddresses
    return await fetchFn([...this.internalAddresses, ...this.externalAddresses])
  }

  async fetchAccountState() {
    if (this._chimericAccountAddress == null) {
      throw new Error('fetchAccountState:: _chimericAccountAddress = null')
    }
    return await jormunApi.fetchAccountState([this._chimericAccountAddress])
  }

  async fetchPoolInfo(pool: PoolInfoRequest) {
    assert.assert(
      isJormungandr(this._networkId),
      'fetchPoolInfo:: isJormungandr',
    )
    return await jormunApi.getPoolInfo(pool)
  }

  toJSON() {
    return {
      lastGeneratedAddressIndex: this._state.lastGeneratedAddressIndex,
      chimericAccountAddress: this._chimericAccountAddress,
      version: this._version,
      internalChain: this._internalChain.toJSON(),
      externalChain: this._externalChain.toJSON(),
      transactionCache: this._transactionCache.toJSON(),
      networkId: this._networkId,
      isHW: this._isHW,
      hwDeviceInfo: this._hwDeviceInfo,
      isEasyConfirmationEnabled: this._isEasyConfirmationEnabled,
    }
  }
}

export class WalletClosed extends ExtendableError {}
export class SystemAuthDisabled extends ExtendableError {}
export class KeysAreInvalid extends ExtendableError {}

class WalletManager {
  _wallet: ?Wallet = null
  _id: string = ''
  _subscribers: Array<() => any> = []
  _syncErrorSubscribers: Array<(err: any) => any> = []
  _closePromise: ?Promise<any> = null
  _closeReject: ?(Error) => void = null

  _wallets = {}

  constructor() {
    this._backgroundSync()
  }

  async _listWallets() {
    const keys = await storage.keys('/wallet/')
    const result = await Promise.all(
      keys.map((key) => storage.read(`/wallet/${key}`)),
    )

    Logger.debug('result::_listWallets', result)

    return result
  }

  async initialize() {
    const wallets = await this._listWallets()
    this._wallets = _.fromPairs(wallets.map((w) => [w.id, w]))
  }

  getWallets() {
    return this._wallets
  }

  abortWhenWalletCloses<T>(promise: Promise<T>): Promise<T> {
    assert.assert(this._closePromise, 'should have closePromise')
    /* :: if (!this._closePromise) throw 'assert' */
    return Promise.race([this._closePromise, promise])
  }

  // Note(ppershing): needs 'this' to be bound
  _notify = () => {
    // TODO(ppershing): do this in next tick?
    this._subscribers.forEach((handler) => handler())
  }

  _notifySyncError = (error: any) => {
    this._syncErrorSubscribers.forEach((handler) => handler(error))
  }

  // Note(ppershing): no need to abortWhenWalletCloses here
  // Note(v-almonacid): if sync fails because of a chain rollback, we just wait
  // for the next sync round (tx cache should be wiped out in between)
  async _backgroundSync() {
    try {
      if (this._wallet) {
        const wallet = this._wallet
        await wallet.tryDoFullSync()
        await this._saveState(wallet)
      }
      this._notifySyncError(null)
    } catch (e) {
      this._notifySyncError(e)
    } finally {
      setTimeout(() => this._backgroundSync(), CONFIG.HISTORY_REFRESH_TIME)
    }
  }

  subscribe(handler: () => any) {
    this._subscribers.push(handler)
  }

  subscribeBackgroundSyncError(handler: (err: any) => any) {
    this._syncErrorSubscribers.push(handler)
  }

  /* ========== getters =============
   * these properties are passed on to redux's State in
   * actions/history.js::mirrorTxHistory
   */

  get isInitialized() {
    return this._wallet
  }

  get transactions() {
    if (!this._wallet) return {}
    return this._wallet.transactions
  }

  get internalAddresses() {
    if (!this._wallet) return []
    return this._wallet.internalAddresses
  }

  get externalAddresses() {
    if (!this._wallet) return []
    return this._wallet.externalAddresses
  }

  get isEasyConfirmationEnabled() {
    if (!this._wallet) return {}
    return this._wallet._isEasyConfirmationEnabled
  }

  get confirmationCounts() {
    if (!this._wallet) return {}
    return this._wallet.confirmationCounts
  }

  get numReceiveAddresses() {
    if (!this._wallet) return 0
    return this._wallet.numReceiveAddresses
  }

  get canGenerateNewReceiveAddress() {
    if (!this._wallet) return false
    return this._wallet.canGenerateNewReceiveAddress()
  }

  get isUsedAddressIndex() {
    if (!this._wallet) return {}
    return this._wallet.isUsedAddressIndex
  }

  get networkId() {
    if (!this._wallet) return NETWORK_REGISTRY.UNDEFINED
    return this._wallet._networkId
  }

  get isJormungandr() {
    if (!this._wallet) return false
    return isJormungandr(this._wallet._networkId)
  }

  get isHW() {
    if (!this._wallet) return false
    return this._wallet._isHW
  }

  get hwDeviceInfo() {
    if (!this._wallet) return {}
    return this._wallet._hwDeviceInfo
  }

  get version() {
    if (!this._wallet) return null
    return this._wallet._version
  }

  async generateNewUiReceiveAddressIfNeeded() {
    if (!this._wallet) return
    await this.abortWhenWalletCloses(
      Promise.resolve(this._wallet.generateNewUiReceiveAddressIfNeeded()),
    )
  }

  generateNewUiReceiveAddress() {
    if (!this._wallet) return false
    const wallet = this._wallet

    const didGenerateNew = wallet.generateNewUiReceiveAddress()
    if (didGenerateNew) {
      // Note: save is runaway
      this._saveState(wallet)
    }
    return didGenerateNew
  }

  async cleanupInvalidKeys() {
    if (!this._wallet) throw new WalletClosed()
    const wallet = this._wallet

    try {
      await KeyStore.deleteData(wallet._id, 'BIOMETRICS')
      await KeyStore.deleteData(wallet._id, 'SYSTEM_PIN')
    } catch (error) {
      const isDeviceSecure = await isSystemAuthSupported()
      // On android 8.0 we are able to delete keys
      // after re-enabling Lock screen
      if (
        error.code === KeyStore.REJECTIONS.KEY_NOT_DELETED &&
        !isDeviceSecure
      ) {
        throw new SystemAuthDisabled()
      } else {
        // We cannot delete keys directly on android 8.1, but it is possible
        // after we replace them
        await KeyStore.storeData(wallet._id, 'BIOMETRICS', 'DUMMY_VALUE')
        await KeyStore.storeData(wallet._id, 'SYSTEM_PIN', 'DUMMY_VALUE')

        await KeyStore.deleteData(wallet._id, 'BIOMETRICS')
        await KeyStore.deleteData(wallet._id, 'SYSTEM_PIN')
      }
    }

    await this._updateMetadata(wallet._id, {
      isEasyConfirmationEnabled: false,
    })
    wallet._isEasyConfirmationEnabled = false
  }

  async ensureKeysValidity() {
    if (!this._wallet) throw new WalletClosed()
    const wallet = this._wallet

    const canBiometricsBeUsed = await canBiometricEncryptionBeEnabled()
    const isKeyValid = await KeyStore.isKeyValid(wallet._id, 'BIOMETRICS')

    if (!isKeyValid || !canBiometricsBeUsed) {
      throw new KeysAreInvalid()
    }
  }

  async doFullSync() {
    // TODO(ppershing): this should "quit" early if we change wallet
    if (!this._wallet) return
    const wallet = this._wallet
    await this.abortWhenWalletCloses(wallet.doFullSync())
    // Note: save is runaway
    // TODO(ppershing): should we save in case wallet is closed mid-sync?
    this._saveState(wallet)
    return
  }

  async prepareTransaction(
    utxos: Array<RawUtxo>,
    address: string,
    amount: BigNumber,
  ) {
    if (!this._wallet) throw new WalletClosed()
    return await this.abortWhenWalletCloses(
      this._wallet.prepareTransaction(utxos, address, amount),
    )
  }

  /**
   * Common API calls
   */

  async signTx(transactionData: PreparedTransactionData, decryptedKey: string) {
    if (!this._wallet) throw new WalletClosed()
    return await this.abortWhenWalletCloses(
      this._wallet.signTx(transactionData, decryptedKey),
    )
  }

  async submitTransaction(signedTx: string) {
    if (!this._wallet) throw new WalletClosed()
    return await this.abortWhenWalletCloses(
      this._wallet.submitTransaction(signedTx),
    )
  }

  async getTxsBodiesForUTXOs(request: TxBodiesRequest) {
    if (!this._wallet) throw new WalletClosed()
    return await this.abortWhenWalletCloses(
      this._wallet.getTxsBodiesForUTXOs(request),
    )
  }

  async getAllUtxosForKey(utxos: Array<RawUtxo>) {
    if (!this._wallet) throw new WalletClosed()
    return await this._wallet.getAllUtxosForKey(utxos)
  }

  getAddressingInfo(address: string) {
    if (!this._wallet) throw new WalletClosed()
    return this._wallet.getAddressingInfo(address)
  }

  asAddressedUtxo(utxos: Array<RawUtxo>) {
    if (!this._wallet) throw new WalletClosed()
    return this._wallet.asAddressedUtxo(utxos)
  }

  async prepareDelegationTx(
    poolData: PoolData,
    valueInAccount: number,
    utxos: Array<RawUtxo>,
  ) {
    if (!this._wallet) throw new WalletClosed()
    return await this.abortWhenWalletCloses(
      this._wallet.prepareDelegationTx(poolData, valueInAccount, utxos),
    )
  }

  async signDelegationTx(
    unsignedTx: V3UnsignedTxAddressedUtxoData,
    decryptedMasterKey: string,
  ) {
    if (!this._wallet) throw new WalletClosed()
    return await this._wallet.signDelegationTx(unsignedTx, decryptedMasterKey)
  }

  async fetchUTXOs() {
    if (!this._wallet) throw new WalletClosed()
    return await this.abortWhenWalletCloses(this._wallet.fetchUTXOs())
  }

  async fetchAccountState() {
    if (this._wallet == null) throw new WalletClosed()
    return await this.abortWhenWalletCloses(this._wallet.fetchAccountState())
  }

  async fetchPoolInfo(pool: PoolInfoRequest) {
    if (this._wallet == null) throw new WalletClosed()
    return await this._wallet.fetchPoolInfo(pool)
  }

  async saveWallet(
    id: string,
    name: string,
    wallet: Wallet,
    networkId: NetworkId,
  ) {
    this._id = id
    this._wallets = {
      ...this._wallets,
      [id]: {id, name, networkId, isEasyConfirmationEnabled: false},
    }

    this._wallet = wallet
    await this._saveState(wallet)
    wallet.subscribe(this._notify)
    await storage.write(`/wallet/${id}`, this._wallets[id])
    this._closePromise = new Promise((resolve, reject) => {
      this._closeReject = reject
    })
    this._notify()

    Logger.debug('WalletManager::saveWallet::wallet', wallet)

    return wallet
  }

  async createWallet(
    name: string,
    mnemonic: string,
    password: string,
    networkId: NetworkId,
  ): Promise<Wallet> {
    const wallet = new Wallet()
    const id = await wallet._create(mnemonic, password, networkId)

    return this.saveWallet(id, name, wallet, networkId)
  }

  async createWalletWithBip44Account(
    name: string,
    bip44AccountPublic: string,
    networkId: NetworkId,
    hwDeviceInfo: ?HWDeviceInfo,
  ) {
    const wallet = new Wallet()
    const id = await wallet._createWithBip44Account(
      bip44AccountPublic,
      networkId,
      hwDeviceInfo,
    )
    Logger.debug('creating wallet...', wallet)

    return this.saveWallet(id, name, wallet, networkId)
  }

  async openWallet(id: string): Promise<Wallet> {
    assert.preconditionCheck(!!id, 'openWallet:: !!id')
    const wallet = new Wallet()
    const data = await storage.read(`/wallet/${id}/data`)
    Logger.debug('openWallet::data', data)

    if (!data) throw new Error('Cannot read saved data')

    await wallet._restore(data)
    wallet._id = id
    this._wallet = wallet
    this._id = id

    wallet.subscribe(this._notify)
    this._closePromise = new Promise((resolve, reject) => {
      this._closeReject = reject
    })
    this._notify()

    if (wallet._isEasyConfirmationEnabled) {
      await this.ensureKeysValidity()
    }

    return wallet
  }

  async save() {
    if (!this._wallet) return
    await this._saveState(this._wallet)
  }

  async _saveState(wallet: Wallet) {
    assert.assert(wallet._id, 'saveState:: wallet._id')
    /* :: if (!this._wallet) throw 'assert' */
    const data = wallet.toJSON()
    await storage.write(`/wallet/${wallet._id}/data`, data)
  }

  async listWallets() {
    const keys = await storage.keys('/wallet/')
    const result = await Promise.all(
      keys.map((key) => storage.read(`/wallet/${key}`)),
    )
    return result
  }

  async deleteEncryptedKey(encryptionMethod: EncryptionMethod) {
    if (!this._wallet) {
      throw new Error('Empty wallet')
    }

    await KeyStore.deleteData(this._id, encryptionMethod)
  }

  async disableEasyConfirmation() {
    if (!this._wallet) {
      throw new Error('Empty wallet')
    }

    await this._updateMetadata(this._wallet._id, {
      isEasyConfirmationEnabled: false,
    })

    await this.deleteEncryptedKey('BIOMETRICS')
    await this.deleteEncryptedKey('SYSTEM_PIN')

    // $FlowFixMe
    this._wallet._isEasyConfirmationEnabled = false
    this._notify()
  }

  async enableEasyConfirmation(masterPassword: string, intl: any) {
    if (!this._wallet) throw new WalletClosed()
    const wallet = this._wallet

    await wallet.enableEasyConfirmation(masterPassword, intl)

    await this._updateMetadata(wallet._id, {
      isEasyConfirmationEnabled: true,
    })
    await this._saveState(wallet)
    this._notify()
  }

  async changePassword(masterPassword: string, newPassword: string, intl: any) {
    if (!this._wallet) throw new WalletClosed()

    await this._wallet.changePassword(masterPassword, newPassword, intl)
  }

  canBiometricsSignInBeDisabled() {
    if (!this._wallets) {
      throw new Error('Wallet list is not initialized')
    }

    return ObjectValues(this._wallets).every(
      (wallet) => !wallet.isEasyConfirmationEnabled,
    )
  }

  closeWallet(): Promise<void> {
    if (!this._wallet) return Promise.resolve()
    assert.assert(this._closeReject, 'close: should have _closeReject')
    /* :: if (!this._closeReject) throw 'assert' */
    // Abort all async interactions with the wallet
    // const reject = this._closeReject
    this._closePromise = null
    this._closeReject = null
    this._wallet = null
    this._id = ''
    this._notify()
    // need to reject in next microtask otherwise
    // closeWallet would throw if some rejection
    // handler does not catch
    return Promise.resolve().then(() => {
      // TODO: Check why Shelley path crash when this is active
      //  and figure out why this is actually necessary
      // reject(new WalletClosed())
    })
  }

  async removeCurrentWallet() {
    if (!this._wallet) return
    const id = this._id

    if (this.isEasyConfirmationEnabled) {
      await this.deleteEncryptedKey('BIOMETRICS')
      await this.deleteEncryptedKey('SYSTEM_PIN')
    }
    await this.deleteEncryptedKey('MASTER_PASSWORD')

    this.closeWallet()
    await storage.remove(`/wallet/${id}/data`)
    await storage.remove(`/wallet/${id}`)

    this._wallets = _.omit(this._wallets, id)
  }

  get walletName() {
    if (!this._id) return ''
    return this._wallets[this._id].name
  }

  // TODO(ppershing): how should we deal with race conditions?
  async _updateMetadata(id, newMeta) {
    assert.assert(this._wallets[id], '_updateWalletInfo id')
    const merged = {
      ...this._wallets[id],
      ...newMeta,
    }
    await storage.write(`/wallet/${id}`, merged)
    this._wallets = {
      ...this._wallets,
      [id]: merged,
    }
  }

  async rename(newName: string) {
    if (!this._id) throw new WalletClosed()
    const id = this._id

    await this._updateMetadata(id, {name: newName})

    this._notify()
  }

  async checkForFlawedWallets(): Promise<boolean> {
    const mnemonics = [CONFIG.DEBUG.MNEMONIC1, CONFIG.DEBUG.MNEMONIC2]
    let affected = false
    for (const mnemonic of mnemonics) {
      Logger.debug('WalletManager::checkForFlawedWallets mnemonic:', mnemonic)
      let flawedAddresses
      if (this.isJormungandr) {
        const flawedAddressesBech32 = await jormungandrUtil.getGroupAddressesFromMnemonics(
          mnemonic,
          'External',
          [0],
        )
        flawedAddresses = await Promise.all(
          flawedAddressesBech32.map(async (addr) => {
            return Buffer.from(
              await (await Address.from_string(addr)).as_bytes(),
            ).toString('hex')
          }),
        )
      } else {
        flawedAddresses = await util.getAddressesFromMnemonics(
          mnemonic,
          'External',
          [0],
        )
      }
      if (this._wallet == null) throw new WalletClosed()
      const externalChain = this._wallet._externalChain
      Logger.debug(
        'WalletManager::checkForFlawedWallets wallet addresses [0]:',
        externalChain.addresses[0],
      )
      Logger.debug(
        'WalletManager::checkForFlawedWallets flawedAddresses [0]:',
        flawedAddresses,
      )
      if (externalChain.isMyAddress(flawedAddresses[0])) {
        Logger.debug('WalletManager::checkForFlawedWallets: address match')
        affected = true
        return affected
      }
    }
    Logger.debug('WalletManager::checkForFlawedWallets:: no match')
    return affected
  }
}

export default new WalletManager()
