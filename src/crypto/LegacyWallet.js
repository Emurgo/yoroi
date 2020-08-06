// @flow
import _ from 'lodash'
import {BigNumber} from 'bignumber.js'
import uuid from 'uuid'
import {
  Address,
  AddressDiscrimination,
  Bip32PublicKey,
  Bip32PrivateKey,
} from 'react-native-chain-libs'
import DeviceInfo from 'react-native-device-info'

import Wallet from './Wallet'
import {WalletInterface} from './WalletInterface'
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
import * as jormunApi from './../api/jormungandr/api'
import {CONFIG} from '../config/config'
import {NETWORK_REGISTRY} from '../config/types'
import {isJormungandr} from '../config/networks'
import assert from '../utils/assert'
import {Logger} from '../utils/logging'
import {InvalidState} from './errors'
import {TransactionCache} from './transactionCache'

import type {
  RawUtxo,
  PoolInfoRequest,
  TxBodiesRequest,
  TxBodiesResponse,
} from '../api/types'
import type {
  AddressedUtxo,
  TransactionInput,
  PreparedTransactionData,
  V3SignedTx,
  V3UnsignedTxAddressedUtxoData,
} from './types'
import type {CryptoAccount} from './byron/util'
import type {HWDeviceInfo} from './byron/ledgerUtils'
import type {DelegationTxData, PoolData} from './jormungandr/delegationUtils'
import type {NetworkId} from '../config/types'

export default class LegacyWallet extends Wallet implements WalletInterface {
  // =================== create =================== //

  async _initialize(
    networkId: NetworkId,
    account: CryptoAccount | string,
    chimericAccountAddr: ?string,
    hwDeviceInfo: ?HWDeviceInfo,
  ) {
    this.networkId = networkId

    this.isHW = hwDeviceInfo != null

    this.hwDeviceInfo = hwDeviceInfo

    this.transactionCache = new TransactionCache()

    // initialize address chains
    this.internalChain = new AddressChain(
      new AddressGenerator(account, 'Internal', isJormungandr(networkId)),
    )
    this.externalChain = new AddressChain(
      new AddressGenerator(account, 'External', isJormungandr(networkId)),
    )

    this.chimericAccountAddress = chimericAccountAddr

    this.version = DeviceInfo.getVersion()

    // Create at least one address in each block
    await this.internalChain.initialize()
    await this.externalChain.initialize()

    this.setupSubscriptions()
    this.notify()

    this.isInitialized = true
    return this.id
  }

  async create(mnemonic: string, newPassword: string, networkId: NetworkId) {
    Logger.info(`create wallet (networkId=${String(networkId)})`)
    this.id = uuid.v4()
    assert.assert(!this.isInitialized, 'createWallet: !isInitialized')
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

  async createWithBip44Account(
    accountPublicKey: string,
    networkId: NetworkId,
    hwDeviceInfo: ?HWDeviceInfo,
  ) {
    Logger.info(
      `create wallet with account pub key (networkId=${String(networkId)})`,
    )
    Logger.debug('account pub key', accountPublicKey)
    this.id = uuid.v4()
    assert.assert(!this.isInitialized, 'createWallet: !isInitialized')
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

  // =================== persistence =================== //

  toJSON() {
    return {
      lastGeneratedAddressIndex: this.state.lastGeneratedAddressIndex,
      chimericAccountAddress: this.chimericAccountAddress,
      version: this.version,
      internalChain: this.internalChain.toJSON(),
      externalChain: this.externalChain.toJSON(),
      transactionCache: this.transactionCache.toJSON(),
      networkId: this.networkId,
      isHW: this.isHW,
      hwDeviceInfo: this.hwDeviceInfo,
      isEasyConfirmationEnabled: this.isEasyConfirmationEnabled,
    }
  }

  async _integrityCheck(data): Promise<void> {
    try {
      if (isJormungandr(this.networkId)) {
        const accountHex = this.internalChain._addressGenerator.account
        if (!(typeof accountHex === 'string' || accountHex instanceof String)) {
          throw new Error('wallet::_integrityCheck: invalid account')
        }
        // note(v-almonacid): renamed accountAddress by chimericAccountAddress
        // for more clarity, so this check step is needed
        if (this.chimericAccountAddress == null) {
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
          this.chimericAccountAddress = await retrieveChimericAddr(data)
        }
      }
      if (this.networkId === NETWORK_REGISTRY.UNDEFINED) {
        // prettier-ignore
        this.networkId =
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

  async restore(data: any): Promise<void> {
    Logger.info('restore wallet')
    assert.assert(!this.isInitialized, 'restoreWallet: !isInitialized')
    this.state = {
      lastGeneratedAddressIndex: data.lastGeneratedAddressIndex,
    }
    this.networkId =
      data.networkId != null ? data.networkId : NETWORK_REGISTRY.UNDEFINED
    this.isHW = data.isHW != null ? data.isHW : false
    this.hwDeviceInfo = data.hwDeviceInfo
    // note(v-almonacid): chimericAccountAddr can be null. _integrityCheck is
    // required for versions <= 2.1.0
    this.chimericAccountAddress = data.chimericAccountAddress
    this.version = data.version
    this.internalChain = AddressChain.fromJSON(data.internalChain)
    this.externalChain = AddressChain.fromJSON(data.externalChain)
    this.transactionCache = TransactionCache.fromJSON(data.transactionCache)
    this.isEasyConfirmationEnabled = data.isEasyConfirmationEnabled

    await this._integrityCheck(data)

    // subscriptions
    this.setupSubscriptions()

    this.isInitialized = true
  }

  // =================== tx building =================== //

  // this uses legacy addressing scheme
  _transformUtxoToInput(utxo: RawUtxo): TransactionInput {
    const chains = [
      ['Internal', this.internalChain],
      ['External', this.externalChain],
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
    const candidateAddresses = this.internalChain.addresses
    const unseen = candidateAddresses.filter(
      (addr) => !this.isUsedAddress(addr),
    )
    assert.assert(unseen.length > 0, 'Cannot find change address')
    return _.first(unseen)
  }

  async getAllUtxosForKey(utxos: Array<RawUtxo>) {
    assert.assert(
      isJormungandr(this.networkId),
      'getAllUtxosForKey: isJormungandr',
    )
    return await filterAddressesByStakingKey(
      await this._getStakingKey(),
      this.asAddressedUtxo(utxos),
    )
  }

  getAddressingInfo(address: string) {
    const chains = [
      ['Internal', this.internalChain],
      ['External', this.externalChain],
    ]
    let addressInfo = null
    chains.forEach(([type, chain]) => {
      if (chain.isMyAddress(address)) {
        addressInfo = {
          path: [
            CONFIG.NUMBERS.ACCOUNT_INDEX,
            ADDRESS_TYPE_TO_CHANGE[type],
            chain.getIndexOfAddress(address),
          ],
          startLevel: CONFIG.NUMBERS.BIP44_DERIVATION_LEVELS.ACCOUNT,
        }
      }
    })
    return addressInfo
  }

  asAddressedUtxo(utxos: Array<RawUtxo>): Array<AddressedUtxo> {
    const addressedUtxos = utxos.map(
      (utxo: RawUtxo): AddressedUtxo => {
        const addressInfo = this.getAddressingInfo(utxo.receiver)
        if (addressInfo == null) {
          throw new Error(`Address not found for utxo: ${utxo.receiver}`)
        }
        return {
          ...utxo,
          addressing: addressInfo,
        }
      },
    )
    return addressedUtxos
  }

  async prepareTransaction(
    utxos: Array<RawUtxo>,
    receiverAddress: string,
    amount: BigNumber,
  ): Promise<PreparedTransactionData> {
    const inputs = utxos.map((utxo) => this._transformUtxoToInput(utxo))

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

  async _getStakingKey() {
    assert.assert(isJormungandr(this.networkId), 'getStakingKey: isJormungandr')
    // TODO: save account public key as class member to avoid fetching
    // from internal chain?
    const accountHex = this.internalChain._addressGenerator.account
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

  async _getChangeAddressShelley() {
    assert.assert(
      isJormungandr(this.networkId),
      'getChangeAddressShelley: isJormungandr',
    )
    const nextInternal = await this.internalChain.getNextUnused(
      jormunApi.filterUsedAddresses,
    )
    return {
      address: nextInternal,
      addressing: {
        path: [
          CONFIG.NUMBERS.ACCOUNT_INDEX,
          CONFIG.NUMBERS.CHAIN_DERIVATIONS.INTERNAL,
          this.internalChain.getIndexOfAddress(nextInternal),
        ],
        startLevel: CONFIG.NUMBERS.BIP44_DERIVATION_LEVELS.ACCOUNT,
      },
    }
  }

  async prepareDelegationTx(
    poolData: PoolData,
    valueInAccount: number,
    utxos: Array<RawUtxo>,
  ): Promise<DelegationTxData> {
    assert.assert(
      isJormungandr(this.networkId),
      'prepareDelegationTx: isJormungandr',
    )
    const stakingKey = await this._getStakingKey()
    const changeAddr = await this._getChangeAddressShelley()
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
      isJormungandr(this.networkId),
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

  // =================== backend API =================== //

  async submitTransaction(signedTx: string) {
    const submitTxFn = isJormungandr(this.networkId)
      ? jormunApi.submitTransaction
      : api.submitTransaction
    const response = await submitTxFn(signedTx)
    Logger.info(response)
    return response
  }

  async getTxsBodiesForUTXOs(
    request: TxBodiesRequest,
  ): Promise<TxBodiesResponse> {
    const getTxsBodiesForUTXOsFn = isJormungandr(this.networkId)
      ? api.getTxsBodiesForUTXOs
      : jormunApi.getTxsBodiesForUTXOs
    return await getTxsBodiesForUTXOsFn(request)
  }

  async fetchUTXOs() {
    const fetchFn = isJormungandr(this.networkId)
      ? jormunApi.bulkFetchUTXOsForAddresses
      : api.bulkFetchUTXOsForAddresses
    return await fetchFn([...this.internalAddresses, ...this.externalAddresses])
  }

  async fetchAccountState() {
    if (this.chimericAccountAddress == null) {
      throw new Error('fetchAccountState:: _chimericAccountAddress = null')
    }
    return await jormunApi.fetchAccountState([this.chimericAccountAddress])
  }

  async fetchPoolInfo(pool: PoolInfoRequest) {
    assert.assert(
      isJormungandr(this.networkId),
      'fetchPoolInfo:: isJormungandr',
    )
    return await jormunApi.getPoolInfo(pool)
  }
}
