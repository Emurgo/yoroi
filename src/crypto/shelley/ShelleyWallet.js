// @flow

// implements Shelley-era wallets. Also supports legacy Byron wallets

import _ from 'lodash'
import uuid from 'uuid'
import DeviceInfo from 'react-native-device-info'
import {
  Address,
  Bip32PrivateKey,
  Bip32PublicKey,
  /* eslint-disable camelcase */
  hash_transaction,
  make_vkey_witness,
  /* eslint-enable camelcase */
  PublicKey,
  RewardAddress,
  StakeCredential,
  Transaction,
  TransactionBuilder,
} from 'react-native-haskell-shelley'
import {BigNumber} from 'bignumber.js'
import {walletChecksum, legacyWalletChecksum} from '@emurgo/cip4-js'

import Wallet from '../Wallet'
import {WalletInterface} from '../WalletInterface'
import {ISignRequest} from '../ISignRequest'
import {HaskellShelleyTxSignRequest} from './HaskellShelleyTxSignRequest'
import {AddressChain, AddressGenerator} from './chain'
import * as byronUtil from '../byron/util'
import {ADDRESS_TYPE_TO_CHANGE} from '../commonUtils'
import * as api from '../../api/byron/api'
import {
  CONFIG,
  isByron,
  isHaskellShelley,
  getCardanoBaseConfig,
  getWalletConfigById,
} from '../../config/config'
import {NETWORK_REGISTRY} from '../../config/types'
import assert from '../../utils/assert'
import {Logger} from '../../utils/logging'
import {InvalidState} from '../errors'
import {TransactionCache} from './transactionCache'
import {signTransaction} from './transactions'
import {createUnsignedTx} from './transactionUtils'
import {genTimeToSlot} from '../../utils/timeUtils'
import {
  filterAddressesByStakingKey,
  getDelegationStatus,
  createWithdrawalTx,
  createDelegationTx,
} from './delegationUtils'
import {
  createLedgerSignTxPayload,
  signTxWithLedger,
  buildSignedTransaction,
} from './ledgerUtils'
import {
  normalizeToAddress,
  toHexOrBase58,
  deriveRewardAddressHex,
} from './utils'

import type {
  RawUtxo,
  TxBodiesRequest,
  TxBodiesResponse,
  PoolInfoRequest,
  PoolInfoResponse,
} from '../../api/types'
import type {
  Addressing,
  AddressedUtxo,
  BaseSignRequest,
  SignedTx,
} from './../types'
import type {HWDeviceInfo} from '../shelley/ledgerUtils'
import type {NetworkId, WalletImplementationId} from '../../config/types'
import type {WalletMeta} from '../../state'
import type {SignTransactionResponse} from '@cardano-foundation/ledgerjs-hw-app-cardano'

export default class ShelleyWallet extends Wallet implements WalletInterface {
  // =================== create =================== //

  async _initialize(
    networkId: NetworkId,
    implementationId: WalletImplementationId,
    accountPubKeyHex: string,
    hwDeviceInfo: ?HWDeviceInfo,
    readOnly: boolean,
  ) {
    this.networkId = networkId

    this.walletImplementationId = implementationId

    this.isHW = hwDeviceInfo != null

    this.hwDeviceInfo = hwDeviceInfo

    this.isReadOnly = readOnly

    this.transactionCache = new TransactionCache()

    // initialize address chains
    const _walletConfig = getWalletConfigById(implementationId)
    this.internalChain = new AddressChain(
      new AddressGenerator(accountPubKeyHex, 'Internal', implementationId),
      _walletConfig.DISCOVERY_BLOCK_SIZE,
      _walletConfig.DISCOVERY_GAP_SIZE,
    )
    this.externalChain = new AddressChain(
      new AddressGenerator(accountPubKeyHex, 'External', implementationId),
      _walletConfig.DISCOVERY_BLOCK_SIZE,
      _walletConfig.DISCOVERY_GAP_SIZE,
    )

    this.rewardAddressHex = await deriveRewardAddressHex(accountPubKeyHex)

    this.publicKeyHex = accountPubKeyHex

    this.version = DeviceInfo.getVersion()

    this.checksum = isByron(implementationId)
      ? legacyWalletChecksum(accountPubKeyHex)
      : walletChecksum(accountPubKeyHex)

    // Create at least one address in each block
    await this.internalChain.initialize()
    await this.externalChain.initialize()

    this.setupSubscriptions()
    this.notify()

    this.isInitialized = true
    return this.id
  }

  async create(
    mnemonic: string,
    newPassword: string,
    networkId: NetworkId,
    implementationId: WalletImplementationId,
  ) {
    Logger.info(`create wallet (networkId=${String(networkId)})`)
    Logger.info(`create wallet (implementationId=${String(implementationId)})`)
    this.id = uuid.v4()
    assert.assert(!this.isInitialized, 'createWallet: !isInitialized')
    assert.assert(
      isByron(implementationId) || isHaskellShelley(implementationId),
      'ShelleyWallet::create: invalid walletImplementationId',
    )
    const masterKey = await byronUtil.getMasterKeyFromMnemonic(mnemonic)
    await this.encryptAndSaveMasterKey(
      'MASTER_PASSWORD',
      masterKey,
      newPassword,
    )
    const purpose = isByron(implementationId)
      ? CONFIG.NUMBERS.WALLET_TYPE_PURPOSE.BIP44
      : CONFIG.NUMBERS.WALLET_TYPE_PURPOSE.CIP1852

    const masterKeyPtr = await Bip32PrivateKey.from_bytes(
      Buffer.from(masterKey, 'hex'),
    )
    const accountKey = await (
      await (await masterKeyPtr.derive(purpose)).derive(
        CONFIG.NUMBERS.COIN_TYPES.CARDANO,
      )
    ).derive(
      CONFIG.NUMBERS.ACCOUNT_INDEX + CONFIG.NUMBERS.HARD_DERIVATION_START,
    )
    const accountPubKey = await accountKey.to_public()
    const accountPubKeyHex = Buffer.from(
      await accountPubKey.as_bytes(),
    ).toString('hex')

    return await this._initialize(
      networkId,
      implementationId,
      accountPubKeyHex,
      null, // this is not a HW
      false, // not a read-only wallet
    )
  }

  async createWithBip44Account(
    accountPublicKey: string,
    networkId: NetworkId,
    implementationId: WalletImplementationId,
    hwDeviceInfo: ?HWDeviceInfo,
    readOnly: boolean,
  ) {
    Logger.info(
      `create wallet with account pub key (networkId=${String(networkId)})`,
    )
    Logger.debug('account pub key', accountPublicKey)
    this.id = uuid.v4()
    assert.assert(!this.isInitialized, 'createWallet: !isInitialized')
    return await this._initialize(
      networkId,
      implementationId,
      accountPublicKey,
      hwDeviceInfo,
      readOnly,
    )
  }

  // =================== persistence =================== //

  _integrityCheck(): void {
    try {
      if (this.networkId === NETWORK_REGISTRY.BYRON_MAINNET) {
        this.networkId = NETWORK_REGISTRY.HASKELL_SHELLEY
      }
      assert.assert(
        this.networkId === NETWORK_REGISTRY.HASKELL_SHELLEY,
        'invalid networkId',
      )
      assert.assert(
        isByron(this.walletImplementationId) ||
          isHaskellShelley(this.walletImplementationId),
        'invalid walletImplementationId',
      )
      if (isHaskellShelley(this.walletImplementationId)) {
        assert.assert(this.rewardAddressHex != null, 'reward address is null')
      }
      if (this.isHW) {
        assert.assert(
          this.hwDeviceInfo != null,
          'no device info for hardware wallet',
        )
      }
    } catch (e) {
      Logger.error('wallet::_integrityCheck', e)
      throw new InvalidState(e.message)
    }
  }

  // TODO(v-almonacid): move to parent class?
  async restore(data: any, walletMeta: WalletMeta) {
    Logger.info('restore wallet')
    assert.assert(!this.isInitialized, 'restoreWallet: !isInitialized')
    this.state = {
      lastGeneratedAddressIndex: data.lastGeneratedAddressIndex,
    }

    // can be null for versions < 3.0.0
    this.networkId =
      data.networkId != null ? data.networkId : walletMeta.networkId
    // can be null for versions < 3.0.2
    this.walletImplementationId =
      data.walletImplementationId != null
        ? data.walletImplementationId
        : walletMeta.walletImplementationId

    this.isHW = data.isHW ?? false
    this.hwDeviceInfo = data.hwDeviceInfo
    this.isReadOnly = data.isReadOnly ?? false
    this.version = data.version
    this.internalChain = AddressChain.fromJSON(data.internalChain)
    this.externalChain = AddressChain.fromJSON(data.externalChain)
    // can be null for versions < 3.0.2, in which case we can just retrieve
    // from address generator
    this.publicKeyHex =
      data.publicKeyHex != null
        ? data.publicKeyHex
        : this.internalChain.publicKey
    this.rewardAddressHex = await deriveRewardAddressHex(this.publicKeyHex)
    this.transactionCache = TransactionCache.fromJSON(data.transactionCache)
    this.isEasyConfirmationEnabled = data.isEasyConfirmationEnabled

    this._integrityCheck()

    // subscriptions
    this.setupSubscriptions()

    this.isInitialized = true
  }

  // =================== tx building =================== //

  _getPurpose(): number {
    if (isByron(this.walletImplementationId)) {
      return CONFIG.NUMBERS.WALLET_TYPE_PURPOSE.BIP44
    } else if (isHaskellShelley(this.walletImplementationId)) {
      return CONFIG.NUMBERS.WALLET_TYPE_PURPOSE.CIP1852
    } else {
      throw new Error('ShelleyWallet::_getPurpose: invalid wallet impl. id')
    }
  }

  // returns the address in bech32 (Shelley) or base58 (Byron) format
  getChangeAddress(): string {
    const candidateAddresses = this.internalChain.addresses
    const unseen = candidateAddresses.filter(
      (addr) => !this.isUsedAddress(addr),
    )
    assert.assert(unseen.length > 0, 'Cannot find change address')
    return _.first(unseen)
  }

  // returns the address in hex (Shelley) or base58 (Byron) format
  async _getAddressedChangeAddress(): Promise<{
    address: string,
    ...Addressing,
  }> {
    const changeAddr = this.getChangeAddress()
    const addressInfo = this.getAddressingInfo(changeAddr)
    if (addressInfo == null) {
      throw new Error("Couldn't get change addressing, should never happen")
    }
    const normAddr = await normalizeToAddress(changeAddr)
    return {
      address: await toHexOrBase58(normAddr),
      addressing: addressInfo,
    }
  }

  async getStakingKey(): PublicKey {
    assert.assert(
      isHaskellShelley(this.walletImplementationId),
      'cannot get staking key from a byron-era wallet',
    )
    const accountPubKey = await Bip32PublicKey.from_bytes(
      Buffer.from(this.publicKeyHex, 'hex'),
    )
    const stakingKey = await (
      await (
        await accountPubKey.derive(
          CONFIG.NUMBERS.CHAIN_DERIVATIONS.CHIMERIC_ACCOUNT,
        )
      ).derive(CONFIG.NUMBERS.STAKING_KEY_INDEX)
    ).to_raw_key()
    Logger.info(
      `getStakingKey: ${Buffer.from(await stakingKey.as_bytes()).toString(
        'hex',
      )}`,
    )
    return stakingKey
  }

  async getRewardAddress(): Address {
    assert.assert(
      isHaskellShelley(this.walletImplementationId),
      'cannot get reward address from a byron-era wallet',
    )
    const stakingKey = await this.getStakingKey()
    const credential = await StakeCredential.from_keyhash(
      await stakingKey.hash(),
    )
    const rewardAddr = await RewardAddress.new(
      Number.parseInt(CONFIG.NETWORKS.HASKELL_SHELLEY.CHAIN_NETWORK_ID, 10),
      credential,
    )
    return await rewardAddr.to_address()
  }

  _getRewardAddressAddressing() {
    return {
      path: [
        this._getPurpose(),
        CONFIG.NUMBERS.COIN_TYPES.CARDANO,
        CONFIG.NUMBERS.ACCOUNT_INDEX + CONFIG.NUMBERS.HARD_DERIVATION_START,
        CONFIG.NUMBERS.CHAIN_DERIVATIONS.CHIMERIC_ACCOUNT,
        CONFIG.NUMBERS.STAKING_KEY_INDEX,
      ],
      startLevel: CONFIG.NUMBERS.BIP44_DERIVATION_LEVELS.PURPOSE,
    }
  }

  async getAllUtxosForKey(utxos: Array<RawUtxo>) {
    return await filterAddressesByStakingKey(
      await StakeCredential.from_keyhash(
        await (await this.getStakingKey()).hash(),
      ),
      this.asAddressedUtxo(utxos),
      false,
    )
  }

  getAddressingInfo(address: string) {
    const purpose = this._getPurpose()
    const chains = [
      ['Internal', this.internalChain],
      ['External', this.externalChain],
    ]
    let addressInfo = null
    chains.forEach(([type, chain]) => {
      if (chain.isMyAddress(address)) {
        addressInfo = {
          path: [
            purpose,
            CONFIG.NUMBERS.COIN_TYPES.CARDANO,
            CONFIG.NUMBERS.ACCOUNT_INDEX + CONFIG.NUMBERS.HARD_DERIVATION_START,
            ADDRESS_TYPE_TO_CHANGE[type],
            chain.getIndexOfAddress(address),
          ],
          startLevel: CONFIG.NUMBERS.BIP44_DERIVATION_LEVELS.PURPOSE,
        }
      }
    })
    return addressInfo
  }

  asAddressedUtxo(utxos: Array<RawUtxo>): Array<AddressedUtxo> {
    const addressedUtxos = utxos.map((utxo: RawUtxo): AddressedUtxo => {
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

  getDelegationStatus() {
    if (this.rewardAddressHex == null) throw new Error('reward address is null')
    const certsForKey = this.transactionCache.perRewardAddressCertificates[
      this.rewardAddressHex
    ]
    return Promise.resolve(
      getDelegationStatus(this.rewardAddressHex, certsForKey),
    )
  }

  async createUnsignedTx<TransactionBuilder>(
    utxos: Array<RawUtxo>,
    receiver: string,
    amount: ?string,
    sendAll: boolean,
  ): Promise<ISignRequest<TransactionBuilder>> {
    const timeToSlotFn = await genTimeToSlot(getCardanoBaseConfig())
    const absSlotNumber = new BigNumber(timeToSlotFn({time: new Date()}).slot)
    const changeAddr = await this._getAddressedChangeAddress()
    const addressedUtxos = this.asAddressedUtxo(utxos)

    if (sendAll) {
      return await createUnsignedTx({
        changeAddr,
        absSlotNumber,
        receiver,
        addressedUtxos,
        shouldSendAll: true,
      })
    }
    if (amount == null) throw new Error('Amount is null')
    return await createUnsignedTx({
      changeAddr,
      absSlotNumber,
      receiver,
      addressedUtxos,
      amount,
    })
  }

  async signTx<TransactionBuilder>(
    signRequest: BaseSignRequest<TransactionBuilder>,
    decryptedMasterKey: string,
  ): Promise<SignedTx> {
    const masterKey = await Bip32PrivateKey.from_bytes(
      Buffer.from(decryptedMasterKey, 'hex'),
    )

    const accountPvrKey: Bip32PrivateKey = await (
      await (await masterKey.derive(this._getPurpose())).derive(
        CONFIG.NUMBERS.COIN_TYPES.CARDANO,
      )
    ).derive(0 + CONFIG.NUMBERS.HARD_DERIVATION_START)
    const signedTx: Transaction = await signTransaction(
      signRequest,
      CONFIG.NUMBERS.BIP44_DERIVATION_LEVELS.ACCOUNT,
      accountPvrKey,
      new Set(), // no staking key
      undefined,
    )
    const id = Buffer.from(
      await (await hash_transaction(await signedTx.body())).to_bytes(),
    ).toString('hex')
    const encodedTx = await signedTx.to_bytes()
    return {
      id,
      encodedTx,
    }
  }

  async createDelegationTx(
    poolRequest: void | string,
    valueInAccount: BigNumber,
    utxos: Array<RawUtxo>,
  ): Promise<{|
    signTxRequest: ISignRequest<TransactionBuilder>,
    totalAmountToDelegate: BigNumber,
  |}> {
    const timeToSlotFn = await genTimeToSlot(getCardanoBaseConfig())
    const absSlotNumber = new BigNumber(timeToSlotFn({time: new Date()}).slot)
    const changeAddr = await this._getAddressedChangeAddress()
    const addressedUtxos = this.asAddressedUtxo(utxos)
    const registrationStatus = (await this.getDelegationStatus()).isRegistered
    const stakingKey = await this.getStakingKey()
    const resp = await createDelegationTx({
      absSlotNumber,
      registrationStatus,
      poolRequest,
      valueInAccount,
      addressedUtxos,
      stakingKey,
      changeAddr,
    })
    return resp
  }

  // remove and just use signTx
  async signDelegationTx<T: TransactionBuilder>(
    signRequest: BaseSignRequest<T>,
    decryptedMasterKey: string,
  ): Promise<SignedTx> {
    assert.assert(
      isHaskellShelley(this.walletImplementationId),
      'cannot get reward address from a byron-era wallet',
    )
    const masterKey = await Bip32PrivateKey.from_bytes(
      Buffer.from(decryptedMasterKey, 'hex'),
    )
    const _purpose = CONFIG.NUMBERS.WALLET_TYPE_PURPOSE.CIP1852

    const accountPvrKey: Bip32PrivateKey = await (
      await (await masterKey.derive(_purpose)).derive(
        CONFIG.NUMBERS.COIN_TYPES.CARDANO,
      )
    ).derive(0 + CONFIG.NUMBERS.HARD_DERIVATION_START)

    const stakingKey = await (
      await (
        await accountPvrKey.derive(
          CONFIG.NUMBERS.CHAIN_DERIVATIONS.CHIMERIC_ACCOUNT,
        )
      ).derive(CONFIG.NUMBERS.STAKING_KEY_INDEX)
    ).to_raw_key()

    const wits = new Set()

    if (!(signRequest.unsignedTx instanceof TransactionBuilder)) {
      throw new Error('signDelegationTx::Invalid unsignedTx type')
    }
    const txBuilder = signRequest.unsignedTx

    // prettier-ignore
    wits.add(
      Buffer.from(
        await (await make_vkey_witness(
          await hash_transaction(
            await txBuilder.build(),
          ),
          stakingKey,
        )).to_bytes(),
      ).toString('hex'),
    )

    const signedTx: Transaction = await signTransaction(
      signRequest,
      CONFIG.NUMBERS.BIP44_DERIVATION_LEVELS.ACCOUNT,
      accountPvrKey,
      wits,
      undefined,
    )
    const id = Buffer.from(
      await (await hash_transaction(await signedTx.body())).to_bytes(),
    ).toString('hex')
    const encodedTx = await signedTx.to_bytes()
    return {
      id,
      encodedTx,
    }
  }

  async createWithdrawalTx(
    utxos: Array<RawUtxo>,
    shouldDeregister: boolean,
  ): Promise<ISignRequest<TransactionBuilder>> {
    const {rewardAddressHex} = this
    if (rewardAddressHex == null) throw new Error('reward address is null')
    const timeToSlotFn = await genTimeToSlot(getCardanoBaseConfig())
    const absSlotNumber = new BigNumber(timeToSlotFn({time: new Date()}).slot)
    const changeAddr = await this._getAddressedChangeAddress()
    const addressedUtxos = this.asAddressedUtxo(utxos)
    const resp = await createWithdrawalTx({
      absSlotNumber,
      getAccountState: api.getAccountState,
      addressedUtxos,
      withdrawals: [
        {
          addressing: this._getRewardAddressAddressing(),
          rewardAddress: rewardAddressHex,
          shouldDeregister,
        },
      ],
      changeAddr,
    })
    return resp
  }

  async signTxWithLedger(
    request: ISignRequest<TransactionBuilder>,
    useUSB: boolean,
  ): Promise<SignedTx> {
    Logger.debug('ShelleyWallet::signTxWithLedger called')

    if (!(request instanceof HaskellShelleyTxSignRequest)) {
      throw new Error('expected instance of HaskellShelleyTxSignRequest')
    }

    const addressingInfo = {}
    for (const change of await request.signRequest.changeAddr) {
      /* eslint-disable indent */
      const addressing = isByron(this.walletImplementationId)
        ? this.getAddressingInfo(change.address)
        : this.getAddressingInfo(
            await (
              await Address.from_bytes(Buffer.from(change.address, 'hex'))
            ).to_bech32(),
          )
      /* eslint-enable indent */
      if (addressing != null) addressingInfo[change.address] = addressing
    }

    const {rewardAddressHex} = this
    // add reward address to addressingMap
    if (rewardAddressHex != null) {
      addressingInfo[rewardAddressHex] = this._getRewardAddressAddressing()
    }

    const addressingMap = (address) => addressingInfo[address]

    const ledgerSignTxPayload = await createLedgerSignTxPayload({
      signRequest: request,
      byronNetworkMagic: CONFIG.NETWORKS.BYRON_MAINNET.PROTOCOL_MAGIC,
      networkId: Number.parseInt(
        CONFIG.NETWORKS.HASKELL_SHELLEY.CHAIN_NETWORK_ID,
        10,
      ),
      addressingMap,
    })

    Logger.debug(
      'ShelleyWallet::signTxWithLedger::ledgerSignTxPayload:',
      JSON.stringify(ledgerSignTxPayload),
    )
    if (this.hwDeviceInfo == null) {
      throw new Error('Device info is null.')
    }
    const ledgerSignTxResp: SignTransactionResponse = await signTxWithLedger(
      ledgerSignTxPayload,
      this.hwDeviceInfo,
      useUSB,
    )

    const txBody = await request.self().unsignedTx.build()

    const key = await Bip32PublicKey.from_bytes(
      Buffer.from(this.publicKeyHex, 'hex'),
    )
    const addressing = {
      path: [
        this._getPurpose(),
        CONFIG.NUMBERS.COIN_TYPES.CARDANO,
        CONFIG.NUMBERS.ACCOUNT_INDEX + CONFIG.NUMBERS.HARD_DERIVATION_START,
      ],
      startLevel: CONFIG.NUMBERS.BIP44_DERIVATION_LEVELS.PURPOSE,
    }

    const signedTx = await buildSignedTransaction(
      txBody,
      request.signRequest.senderUtxos,
      ledgerSignTxResp.witnesses,
      {
        addressing,
        key,
      },
      request.txMetadata(),
    )
    const id = Buffer.from(
      await (await hash_transaction(await signedTx.body())).to_bytes(),
    ).toString('hex')
    const encodedTx = await signedTx.to_bytes()
    return {
      id,
      encodedTx,
    }
  }

  // =================== backend API =================== //

  async getBestBlock() {
    return await api.getBestBlock()
  }

  async submitTransaction(signedTx: string) {
    const response = await api.submitTransaction(signedTx)
    Logger.info(response)
    return response
  }

  async getTxsBodiesForUTXOs(
    request: TxBodiesRequest,
  ): Promise<TxBodiesResponse> {
    return await api.getTxsBodiesForUTXOs(request)
  }

  async fetchUTXOs() {
    return await api.bulkFetchUTXOsForAddresses([
      ...this.internalAddresses,
      ...this.externalAddresses,
    ])
  }

  async fetchAccountState() {
    if (this.rewardAddressHex == null) throw new Error('reward address is null')
    return await api.bulkGetAccountState([this.rewardAddressHex])
  }

  async fetchPoolInfo(request: PoolInfoRequest): Promise<PoolInfoResponse> {
    return await api.getPoolInfo(request)
  }
}
