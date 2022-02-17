// @flow

// implements Shelley-era wallets. Also supports legacy Byron wallets

import type {SignTransactionResponse} from '@cardano-foundation/ledgerjs-hw-app-cardano'
import {TxAuxiliaryDataSupplementType} from '@cardano-foundation/ledgerjs-hw-app-cardano'
import {legacyWalletChecksum, walletChecksum} from '@emurgo/cip4-js'
import {
  Address,
  AuxiliaryData,
  BigNum,
  Bip32PrivateKey,
  Bip32PublicKey,
  /* eslint-disable camelcase */
  hash_transaction,
  LinearFee,
  make_vkey_witness,
  PrivateKey,
  /* eslint-enable camelcase */
  PublicKey,
  RewardAddress,
  StakeCredential,
  Transaction,
  TransactionBuilder,
} from '@emurgo/react-native-haskell-shelley'
import {BigNumber} from 'bignumber.js'
import ExtendableError from 'es6-error'
import _ from 'lodash'
import DeviceInfo from 'react-native-device-info'
import uuid from 'uuid'

import * as api from '../../api/shelley/api'
import type {
  AccountStateResponse,
  FundInfoResponse,
  PoolInfoRequest,
  PoolInfoResponse,
  RawUtxo,
  TokenInfoRequest,
  TokenInfoResponse,
  TxBodiesRequest,
  TxBodiesResponse,
} from '../../api/types'
import {CONFIG, getCardanoBaseConfig, getWalletConfigById, isByron, isHaskellShelley} from '../../config/config'
import type {CardanoHaskellShelleyNetwork} from '../../config/networks'
import {isHaskellShelleyNetwork, PROVIDERS} from '../../config/networks'
import type {BackendConfig, NetworkId, WalletImplementationId, YoroiProvider} from '../../config/types'
import {NETWORK_REGISTRY} from '../../config/types'
import LocalizableError from '../../i18n/LocalizableError'
import type {WalletMeta} from '../../state'
import type {DefaultAsset} from '../../types/HistoryTransaction'
import assert from '../../utils/assert'
import {Logger} from '../../utils/logging'
import {genTimeToSlot} from '../../utils/timeUtils'
import {versionCompare} from '../../utils/versioning'
import {ADDRESS_TYPE_TO_CHANGE, generateWalletRootKey} from '../commonUtils'
import {CardanoError, InvalidState} from '../errors'
import {ISignRequest} from '../ISignRequest'
import type {DefaultTokenEntry} from '../MultiToken'
import {MultiToken} from '../MultiToken'
import type {HWDeviceInfo} from '../shelley/ledgerUtils'
import Wallet, {type WalletJSON} from '../Wallet'
import {WalletInterface} from '../WalletInterface'
import type {AddressedUtxo, Addressing, SendTokenList, SignedTx} from './../types'
import * as catalystUtils from './catalystUtils'
import {AddressChain, AddressGenerator} from './chain'
import {
  createDelegationTx,
  createWithdrawalTx,
  filterAddressesByStakingKey,
  getDelegationStatus,
} from './delegationUtils'
import {HaskellShelleyTxSignRequest} from './HaskellShelleyTxSignRequest'
import {buildSignedTransaction, createLedgerSignTxPayload, signTxWithLedger} from './ledgerUtils'
import type {JSONMetadata} from './metadataUtils'
import {createAuxiliaryData} from './metadataUtils'
import {TransactionCache} from './transactionCache'
import {newAdaUnsignedTx, signTransaction} from './transactions'
import {createUnsignedTx as utilsCreateUnsignedTx} from './transactionUtils'
import {deriveRewardAddressHex, normalizeToAddress, toHexOrBase58} from './utils'

export default class ShelleyWallet extends Wallet implements WalletInterface {
  // =================== create =================== //

  async _initialize(
    networkId: NetworkId,
    implementationId: WalletImplementationId,
    accountPubKeyHex: string,
    hwDeviceInfo: ?HWDeviceInfo,
    readOnly: boolean,
    provider: ?YoroiProvider,
  ) {
    this.networkId = networkId

    this.walletImplementationId = implementationId

    this.isHW = hwDeviceInfo != null

    this.hwDeviceInfo = hwDeviceInfo

    this.isReadOnly = readOnly

    this.provider = provider

    this.transactionCache = new TransactionCache()

    // initialize address chains
    const _walletConfig = getWalletConfigById(implementationId)
    this.internalChain = new AddressChain(
      new AddressGenerator(accountPubKeyHex, 'Internal', implementationId, networkId),
      _walletConfig.DISCOVERY_BLOCK_SIZE,
      _walletConfig.DISCOVERY_GAP_SIZE,
    )
    this.externalChain = new AddressChain(
      new AddressGenerator(accountPubKeyHex, 'External', implementationId, networkId),
      _walletConfig.DISCOVERY_BLOCK_SIZE,
      _walletConfig.DISCOVERY_GAP_SIZE,
    )

    this.rewardAddressHex = await deriveRewardAddressHex(accountPubKeyHex, networkId)

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
    provider: ?YoroiProvider,
  ) {
    Logger.info(`create wallet (networkId=${String(networkId)})`)
    Logger.info(`create wallet (implementationId=${String(implementationId)})`)
    Logger.info(`create wallet (provider=${String(provider)})`)
    this.id = uuid.v4()
    assert.assert(!this.isInitialized, 'ShelleyWallet::create: !isInitialized')
    assert.assert(isHaskellShelleyNetwork(networkId), 'ShelleyWallet::create: invalid networkId')
    assert.assert(
      isByron(implementationId) || isHaskellShelley(implementationId),
      'ShelleyWallet::create: invalid walletImplementationId',
    )
    const masterKeyPtr = await generateWalletRootKey(mnemonic)
    const masterKey: string = Buffer.from(await masterKeyPtr.as_bytes()).toString('hex')
    await this.encryptAndSaveMasterKey('MASTER_PASSWORD', masterKey, newPassword)
    const purpose = isByron(implementationId)
      ? CONFIG.NUMBERS.WALLET_TYPE_PURPOSE.BIP44
      : CONFIG.NUMBERS.WALLET_TYPE_PURPOSE.CIP1852

    const accountKey = await (
      await (await masterKeyPtr.derive(purpose)).derive(CONFIG.NUMBERS.COIN_TYPES.CARDANO)
    ).derive(CONFIG.NUMBERS.ACCOUNT_INDEX + CONFIG.NUMBERS.HARD_DERIVATION_START)
    const accountPubKey = await accountKey.to_public()
    const accountPubKeyHex: string = Buffer.from(await accountPubKey.as_bytes()).toString('hex')

    return await this._initialize(
      networkId,
      implementationId,
      accountPubKeyHex,
      null, // this is not a HW
      false, // not a read-only wallet
      provider,
    )
  }

  async createWithBip44Account(
    accountPublicKey: string,
    networkId: NetworkId,
    implementationId: WalletImplementationId,
    hwDeviceInfo: ?HWDeviceInfo,
    readOnly: boolean,
  ) {
    Logger.info(`create wallet with account pub key (networkId=${String(networkId)})`)
    Logger.debug('account pub key', accountPublicKey)
    this.id = uuid.v4()
    assert.assert(!this.isInitialized, 'createWallet: !isInitialized')
    return await this._initialize(networkId, implementationId, accountPublicKey, hwDeviceInfo, readOnly)
  }

  // =================== persistence =================== //

  async _runMigrations(data: WalletJSON, walletMeta: WalletMeta): Promise<void> {
    /**
     * New versions of Yoroi may involve changes in the data structure used to
     * store the wallet state. Hence, we need to check whether data migrations
     * are needed every time we open a wallet.
     * In some cases, we can determine that some data field needs to be
     * re-accomodated to a new format just by inspecting the data structure in
     * storage. In other cases, we may use the explicit version number, though
     * it should only be available for versions >= 4.1.0
     */

    // recall: Prior to v4.1.0, `version` corresponded to the version on which
    // the wallet was created/restored.
    const lastSeenVersion = data.version

    this.state = {
      lastGeneratedAddressIndex: data.lastGeneratedAddressIndex,
    }

    // can be null for versions < 3.0.0
    this.networkId = data.networkId != null ? data.networkId : walletMeta.networkId
    // can be null for versions < 3.0.2
    this.walletImplementationId =
      data.walletImplementationId != null ? data.walletImplementationId : walletMeta.walletImplementationId

    this.isHW = data.isHW ?? false
    this.hwDeviceInfo = data.hwDeviceInfo
    this.isReadOnly = data.isReadOnly ?? false
    this.provider = data.provider

    if (!this.checksum) {
      this.checksum = walletMeta.checksum
    }

    this.version = DeviceInfo.getVersion()
    if (this.version !== lastSeenVersion) {
      Logger.debug(`updated version from ${lastSeenVersion} to ${this.version}`)
    }

    this.internalChain = AddressChain.fromJSON(data.internalChain, this.networkId)
    this.externalChain = AddressChain.fromJSON(data.externalChain, this.networkId)
    // can be null for versions < 3.0.2, in which case we can just retrieve
    // from address generator
    this.publicKeyHex = data.publicKeyHex != null ? data.publicKeyHex : this.internalChain.publicKey
    this.rewardAddressHex = await deriveRewardAddressHex(this.publicKeyHex, this.networkId)
    this.transactionCache = TransactionCache.fromJSON(data.transactionCache)
    this.isEasyConfirmationEnabled = data.isEasyConfirmationEnabled

    let shouldResync = false
    if (lastSeenVersion == null) {
      shouldResync = true
    } else {
      try {
        if (versionCompare(lastSeenVersion, '4.1.0') === -1) {
          // force resync for versions < 4.1.0 due to server sync issue
          // this also covers versions < 4.0 (prior to Mary HF), which also
          // need a resync because of the new fields introduced in the tx format
          shouldResync = true
        }
      } catch (e) {
        Logger.warn('runMigrations: some migrations might have not been applied', e)
      }
    }

    if (shouldResync) {
      this.transactionCache.resetState()
      Logger.info('runMigrations: the transaction cache has been reset')
    }
  }

  _integrityCheck(): void {
    try {
      if (this.networkId === NETWORK_REGISTRY.BYRON_MAINNET) {
        this.networkId = NETWORK_REGISTRY.HASKELL_SHELLEY
      }
      assert.assert(isHaskellShelleyNetwork(this.networkId), 'invalid networkId')
      assert.assert(
        isByron(this.walletImplementationId) || isHaskellShelley(this.walletImplementationId),
        'invalid walletImplementationId',
      )
      if (isHaskellShelley(this.walletImplementationId)) {
        assert.assert(this.rewardAddressHex != null, 'reward address is null')
      }
      if (this.isHW) {
        assert.assert(this.hwDeviceInfo != null, 'no device info for hardware wallet')
      }
    } catch (e) {
      Logger.error('wallet::_integrityCheck', e)
      throw new InvalidState(e.message)
    }
  }

  // TODO(v-almonacid): move to parent class?
  async restore(data: WalletJSON, walletMeta: WalletMeta) {
    Logger.info('restore wallet', walletMeta.name)
    assert.assert(!this.isInitialized, 'restoreWallet: !isInitialized')

    await this._runMigrations(data, walletMeta)

    this._integrityCheck()

    // subscriptions
    this.setupSubscriptions()

    this.isInitialized = true
  }

  // =================== utils =================== //

  _getNetworkConfig(): CardanoHaskellShelleyNetwork {
    switch (this.networkId) {
      case PROVIDERS.HASKELL_SHELLEY.NETWORK_ID:
        if (this.provider === 'emurgo-alonzo') {
          return PROVIDERS.ALONZO_MAINNET
        }
        return PROVIDERS.HASKELL_SHELLEY
      case PROVIDERS.HASKELL_SHELLEY_TESTNET.NETWORK_ID:
        if (this.provider === 'emurgo-alonzo') {
          return PROVIDERS.ALONZO_TESTNET
        }
        return PROVIDERS.HASKELL_SHELLEY_TESTNET
      default:
        throw new Error('network id is not valid')
    }
  }

  _getBaseNetworkConfig() {
    return this._getNetworkConfig().BASE_CONFIG.reduce((acc, next) => Object.assign(acc, next), {})
  }

  _getBackendConfig(): BackendConfig {
    return this._getNetworkConfig().BACKEND
  }

  _getPurpose(): number {
    if (isByron(this.walletImplementationId)) {
      return CONFIG.NUMBERS.WALLET_TYPE_PURPOSE.BIP44
    } else if (isHaskellShelley(this.walletImplementationId)) {
      return CONFIG.NUMBERS.WALLET_TYPE_PURPOSE.CIP1852
    } else {
      throw new Error('ShelleyWallet::_getPurpose: invalid wallet impl. id')
    }
  }

  _getChainNetworkId(): string {
    return this._getNetworkConfig().CHAIN_NETWORK_ID
  }

  // returns the address in bech32 (Shelley) or base58 (Byron) format
  getChangeAddress(): string {
    const candidateAddresses = this.internalChain.addresses
    const unseen = candidateAddresses.filter((addr) => !this.isUsedAddress(addr))
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

  async getStakingKey(): Promise<PublicKey> {
    assert.assert(isHaskellShelley(this.walletImplementationId), 'cannot get staking key from a byron-era wallet')
    const accountPubKey = await Bip32PublicKey.from_bytes(Buffer.from(this.publicKeyHex, 'hex'))
    const stakingKey = await (
      await (
        await accountPubKey.derive(CONFIG.NUMBERS.CHAIN_DERIVATIONS.CHIMERIC_ACCOUNT)
      ).derive(CONFIG.NUMBERS.STAKING_KEY_INDEX)
    ).to_raw_key()
    Logger.info(`getStakingKey: ${Buffer.from(await stakingKey.as_bytes()).toString('hex')}`)
    return stakingKey
  }

  getStakingKeyPath(): Array<number> {
    assert.assert(isHaskellShelley(this.walletImplementationId), 'cannot get staking key from a byron-era wallet')
    return [
      CONFIG.NUMBERS.WALLET_TYPE_PURPOSE.CIP1852,
      CONFIG.NUMBERS.COIN_TYPES.CARDANO,
      CONFIG.NUMBERS.ACCOUNT_INDEX + CONFIG.NUMBERS.HARD_DERIVATION_START,
      CONFIG.NUMBERS.CHAIN_DERIVATIONS.CHIMERIC_ACCOUNT,
      CONFIG.NUMBERS.STAKING_KEY_INDEX,
    ]
  }

  async getRewardAddress(): Promise<Address> {
    assert.assert(isHaskellShelley(this.walletImplementationId), 'cannot get reward address from a byron-era wallet')
    const stakingKey = await this.getStakingKey()
    const credential = await StakeCredential.from_keyhash(await stakingKey.hash())
    const rewardAddr = await RewardAddress.new(Number.parseInt(this._getChainNetworkId(), 10), credential)
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
      await StakeCredential.from_keyhash(await (await this.getStakingKey()).hash()),
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
    const certsForKey = this.transactionCache.perRewardAddressCertificates[this.rewardAddressHex]
    return Promise.resolve(getDelegationStatus(this.rewardAddressHex, certsForKey))
  }

  // =================== tx building =================== //

  async createUnsignedTx<TransactionBuilder>(
    utxos: Array<RawUtxo>,
    receiver: string,
    tokens: SendTokenList,
    defaultToken: DefaultTokenEntry,
    serverTime: Date | void,
    auxiliaryData: Array<JSONMetadata> | void,
  ): Promise<ISignRequest<TransactionBuilder>> {
    const timeToSlotFn = genTimeToSlot(getCardanoBaseConfig(this._getNetworkConfig()))
    const time = serverTime !== undefined ? serverTime : new Date()
    const absSlotNumber = new BigNumber(timeToSlotFn({time}).slot)
    const changeAddr = await this._getAddressedChangeAddress()
    const addressedUtxos = this.asAddressedUtxo(utxos)

    const auxiliary = auxiliaryData !== undefined ? await createAuxiliaryData(auxiliaryData) : undefined
    return await utilsCreateUnsignedTx({
      changeAddr,
      absSlotNumber,
      receiver,
      addressedUtxos,
      defaultToken,
      tokens,
      auxiliaryData: auxiliary,
      networkConfig: this._getNetworkConfig(),
    })
  }

  async signTx<TransactionBuilder>(
    signRequest: ISignRequest<TransactionBuilder>,
    decryptedMasterKey: string,
  ): Promise<SignedTx> {
    const masterKey = await Bip32PrivateKey.from_bytes(Buffer.from(decryptedMasterKey, 'hex'))
    const accountPvrKey: Bip32PrivateKey = await (
      await (await masterKey.derive(this._getPurpose())).derive(CONFIG.NUMBERS.COIN_TYPES.CARDANO)
    ).derive(0 + CONFIG.NUMBERS.HARD_DERIVATION_START)
    const wits = new Set()

    if (!(signRequest instanceof HaskellShelleyTxSignRequest)) {
      throw new Error('expected instance of HaskellShelleyTxSignRequest')
    }

    if (signRequest.neededStakingKeyHashes.neededHashes.size !== 0) {
      // this is a delegation tx and we need to provide the staking key
      assert.assert(isHaskellShelley(this.walletImplementationId), 'cannot get reward address from a byron-era wallet')
      const txBuilder = signRequest.unsignedTx

      const stakingKey = await (
        await (
          await accountPvrKey.derive(CONFIG.NUMBERS.CHAIN_DERIVATIONS.CHIMERIC_ACCOUNT)
        ).derive(CONFIG.NUMBERS.STAKING_KEY_INDEX)
      ).to_raw_key()

      wits.add(
        Buffer.from(
          await (await make_vkey_witness(await hash_transaction(await txBuilder.build()), stakingKey)).to_bytes(),
        ).toString('hex'),
      )
    }

    const signedTx: Transaction = await signTransaction(
      signRequest.senderUtxos,
      signRequest.unsignedTx,
      CONFIG.NUMBERS.BIP44_DERIVATION_LEVELS.ACCOUNT,
      accountPvrKey,
      wits,
      signRequest.auxiliary(),
    )
    const id = Buffer.from(await (await hash_transaction(await signedTx.body())).to_bytes()).toString('hex')
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
    defaultAsset: DefaultAsset,
    serverTime: Date | void,
  ): Promise<{|
    signRequest: ISignRequest<TransactionBuilder>,
    totalAmountToDelegate: MultiToken,
  |}> {
    const timeToSlotFn = genTimeToSlot(getCardanoBaseConfig(this._getNetworkConfig()))
    const time = serverTime !== undefined ? serverTime : new Date()
    const absSlotNumber = new BigNumber(timeToSlotFn({time}).slot)
    const changeAddr = await this._getAddressedChangeAddress()
    const addressedUtxos = this.asAddressedUtxo(utxos)
    const registrationStatus = (await this.getDelegationStatus()).isRegistered
    const stakingKey = await this.getStakingKey()
    const networkConfig = this._getNetworkConfig()
    const resp = await createDelegationTx({
      absSlotNumber,
      registrationStatus,
      poolRequest,
      valueInAccount,
      addressedUtxos,
      stakingKey,
      changeAddr,
      defaultAsset,
      networkConfig,
    })
    return resp
  }

  async createVotingRegTx(
    utxos: Array<RawUtxo>,
    catalystKey: string,
    decryptedKey: string | void,
    serverTime: Date | void,
  ): Promise<ISignRequest<TransactionBuilder>> {
    Logger.debug('ShelleyWallet::createVotingRegTx called')
    try {
      const timeToSlotFn = await genTimeToSlot(getCardanoBaseConfig(this._getNetworkConfig()))
      const time = serverTime !== undefined ? serverTime : new Date()
      const absSlotNumber = new BigNumber(timeToSlotFn({time}).slot)

      const changeAddr = await this._getAddressedChangeAddress()
      const addressedUtxos = this.asAddressedUtxo(utxos)

      let signer: (Uint8Array) => Promise<string> | void
      if (decryptedKey !== undefined) {
        assert.assert(typeof decryptedKey === 'string', 'ShelleyWallet:createVotingRegTx: decryptedKey')
        const masterKey = await Bip32PrivateKey.from_bytes(Buffer.from(decryptedKey, 'hex'))

        const accountPvrKey: Bip32PrivateKey = await (
          await (await masterKey.derive(this._getPurpose())).derive(CONFIG.NUMBERS.COIN_TYPES.CARDANO)
        ).derive(0 + CONFIG.NUMBERS.HARD_DERIVATION_START)

        const stakePrivateKey: PrivateKey = await (
          await (
            await accountPvrKey.derive(CONFIG.NUMBERS.CHAIN_DERIVATIONS.CHIMERIC_ACCOUNT)
          ).derive(CONFIG.NUMBERS.STAKING_KEY_INDEX)
        ).to_raw_key()

        signer = async (hashedMetadata) => {
          return await (await stakePrivateKey.sign(hashedMetadata)).to_hex()
        }
      } else {
        assert.assert(this.isHW, 'ShelleyWallet::createVotingRegTx: should be a HW wallet')
        signer = (_hashedMetadata) => Promise.resolve('0'.repeat(64 * 2))
      }

      const catalystPublicKey = await (
        await PrivateKey.from_extended_bytes(Buffer.from(catalystKey, 'hex'))
      ).to_public()
      const votingPublicKey = Buffer.from(await catalystPublicKey.as_bytes()).toString('hex')

      const stakePublicKey = await this.getStakingKey()
      const rewardAddress = await this.getRewardAddress()

      let nonce
      if (CONFIG.DEBUG.PREFILL_FORMS) {
        if (!__DEV__) throw new Error('using debug data in non-dev env')
        nonce = CONFIG.DEBUG.CATALYST_NONCE
      } else {
        nonce = absSlotNumber.toNumber()
      }

      const auxiliaryData = await catalystUtils.auxiliaryDataWithRegistrationMetadata({
        stakePublicKey,
        catalystPublicKey,
        rewardAddress,
        absSlotNumber: nonce,
        signer,
      })

      const config = this._getNetworkConfig()
      const protocolParams = {
        keyDeposit: await BigNum.from_str(config.KEY_DEPOSIT),
        linearFee: await LinearFee.new(
          await BigNum.from_str(config.LINEAR_FEE.COEFFICIENT),
          await BigNum.from_str(config.LINEAR_FEE.CONSTANT),
        ),
        coinsPerUtxoWord: await BigNum.from_str(config.COINS_PER_UTXO_WORD),
        poolDeposit: await BigNum.from_str(config.POOL_DEPOSIT),
        networkId: config.NETWORK_ID,
      }

      const unsignedTx = await newAdaUnsignedTx(
        [],
        {
          address: changeAddr.address,
          addressing: changeAddr.addressing,
        },
        addressedUtxos,
        absSlotNumber,
        protocolParams,
        [], // no delegations
        [], // no withdrawals
        false,
        auxiliaryData,
      )

      const signRequest = new HaskellShelleyTxSignRequest({
        senderUtxos: unsignedTx.senderUtxos,
        unsignedTx: unsignedTx.txBuilder,
        changeAddr: unsignedTx.changeAddr,
        auxiliaryData,
        networkSettingSnapshot: {
          NetworkId: config.NETWORK_ID,
          ChainNetworkId: Number.parseInt(config.CHAIN_NETWORK_ID, 10),
          KeyDeposit: new BigNumber(config.KEY_DEPOSIT),
          PoolDeposit: new BigNumber(config.POOL_DEPOSIT),
        },
        neededStakingKeyHashes: {
          neededHashes: new Set(),
          wits: new Set(),
        },
        ledgerNanoCatalystRegistrationTxSignData: this.isHW
          ? {
              votingPublicKey,
              stakingKeyPath: this.getStakingKeyPath(),
              stakingKey: Buffer.from(await stakePublicKey.as_bytes()).toString('hex'),
              rewardAddress: Buffer.from(await rewardAddress.to_bytes()).toString('hex'),
              nonce,
            }
          : undefined,
      })
      return signRequest
    } catch (e) {
      if (e instanceof LocalizableError || e instanceof ExtendableError) throw e
      Logger.error(`shelley::createVotingRegTx:: ${e.message}`, e)
      throw new CardanoError(e.message)
    }
  }

  async createWithdrawalTx(
    utxos: Array<RawUtxo>,
    shouldDeregister: boolean,
    serverTime: Date | void,
  ): Promise<ISignRequest<TransactionBuilder>> {
    const {rewardAddressHex} = this
    if (rewardAddressHex == null) throw new Error('reward address is null')
    const timeToSlotFn = genTimeToSlot(getCardanoBaseConfig(this._getNetworkConfig()))
    const time = serverTime !== undefined ? serverTime : new Date()
    const absSlotNumber = new BigNumber(timeToSlotFn({time}).slot)
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
      networkConfig: this._getNetworkConfig(),
    })
    return resp
  }

  async signTxWithLedger(request: ISignRequest<TransactionBuilder>, useUSB: boolean): Promise<SignedTx> {
    Logger.debug('ShelleyWallet::signTxWithLedger called')

    if (!(request instanceof HaskellShelleyTxSignRequest)) {
      throw new Error('expected instance of HaskellShelleyTxSignRequest')
    }

    const addressingInfo = {}
    for (const change of await request.changeAddr) {
      const addressing = isByron(this.walletImplementationId)
        ? this.getAddressingInfo(change.address)
        : this.getAddressingInfo(await (await Address.from_bytes(Buffer.from(change.address, 'hex'))).to_bech32())
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
      byronNetworkMagic: this._getBaseNetworkConfig().PROTOCOL_MAGIC,
      // to not confuse with wallet's network id
      chainNetworkId: Number.parseInt(this._getChainNetworkId(), 10),
      addressingMap,
    })

    Logger.debug('ShelleyWallet::signTxWithLedger::ledgerSignTxPayload:', JSON.stringify(ledgerSignTxPayload))
    if (this.hwDeviceInfo == null) {
      throw new Error('Device info is null.')
    }
    const ledgerSignTxResp: SignTransactionResponse = await signTxWithLedger(
      ledgerSignTxPayload,
      this.hwDeviceInfo,
      useUSB,
    )

    let auxiliaryData: AuxiliaryData
    if (request.ledgerNanoCatalystRegistrationTxSignData) {
      const {votingPublicKey, nonce} = request.ledgerNanoCatalystRegistrationTxSignData

      if (
        !ledgerSignTxResp.auxiliaryDataSupplement ||
        ledgerSignTxResp.auxiliaryDataSupplement.type !== TxAuxiliaryDataSupplementType.CATALYST_REGISTRATION
      ) {
        throw new Error('ShelleyWallet::signTxWithLedger unexpected Ledger sign transaction response')
      }
      const {catalystRegistrationSignatureHex} = ledgerSignTxResp.auxiliaryDataSupplement

      Logger.debug(
        'ShelleyWallet::signTxWithLedger::catalystRegistrationSignatureHex',
        catalystRegistrationSignatureHex,
      )

      Logger.debug(
        'ShelleyWallet::signTxWithLedger: Setting Catalyst registration metadata from HW sign data',
        request.ledgerNanoCatalystRegistrationTxSignData,
      )

      auxiliaryData = await catalystUtils.auxiliaryDataWithRegistrationMetadata({
        stakePublicKey: await this.getStakingKey(),
        catalystPublicKey: await PublicKey.from_bytes(Buffer.from(votingPublicKey, 'hex')),
        rewardAddress: await this.getRewardAddress(),
        absSlotNumber: nonce,
        signer: (_hashedMetadata) => {
          return Promise.resolve(catalystRegistrationSignatureHex)
        },
      })
      // We can verify that
      //  Buffer.from(
      //    blake2b(256 / 8).update(metadata.to_bytes()).digest('binary')
      //  ).toString('hex') ===
      // ledgerSignTxResp.auxiliaryDataSupplement.auxiliaryDataHashaHex
    } else {
      auxiliaryData = request.auxiliaryData
    }

    if (auxiliaryData) {
      await request.self().set_auxiliary_data(auxiliaryData)
    }

    const txBody = await request.self().build()

    const key = await Bip32PublicKey.from_bytes(Buffer.from(this.publicKeyHex, 'hex'))
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
      request.senderUtxos,
      ledgerSignTxResp.witnesses,
      {
        addressing,
        key,
      },
      auxiliaryData,
    )
    const id = Buffer.from(await (await hash_transaction(await signedTx.body())).to_bytes()).toString('hex')
    const encodedTx = await signedTx.to_bytes()
    Logger.debug('ShelleyWallet::signTxWithLedger::encodedTx', Buffer.from(encodedTx).toString('hex'))
    return {
      id,
      encodedTx,
    }
  }

  // =================== backend API =================== //

  async checkServerStatus() {
    return await api.checkServerStatus(this._getBackendConfig())
  }

  async getBestBlock() {
    return await api.getBestBlock(this._getBackendConfig())
  }

  async submitTransaction(signedTx: string) {
    const response = await api.submitTransaction(signedTx, this._getBackendConfig())
    Logger.info(response)
    return response
  }

  async getTxsBodiesForUTXOs(request: TxBodiesRequest): Promise<TxBodiesResponse> {
    return await api.getTxsBodiesForUTXOs(request, this._getBackendConfig())
  }

  async fetchUTXOs() {
    return await api.bulkFetchUTXOsForAddresses(
      [...this.internalAddresses, ...this.externalAddresses],
      this._getBackendConfig(),
    )
  }

  async fetchAccountState(): Promise<AccountStateResponse> {
    if (this.rewardAddressHex == null) throw new Error('reward address is null')
    return await api.bulkGetAccountState([this.rewardAddressHex], this._getBackendConfig())
  }

  async fetchPoolInfo(request: PoolInfoRequest): Promise<PoolInfoResponse> {
    return await api.getPoolInfo(request, this._getBackendConfig())
  }

  fetchTokenInfo(request: TokenInfoRequest): Promise<TokenInfoResponse> {
    return api.getTokenInfo(request, this._getBackendConfig())
  }

  async fetchFundInfo(): Promise<FundInfoResponse> {
    return await api.getFundInfo(this._getBackendConfig(), this._getNetworkConfig().IS_MAINNET)
  }
}
