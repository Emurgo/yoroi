/* eslint-disable @typescript-eslint/no-explicit-any */
import {BigNumber} from 'bignumber.js'
import cryptoRandomString from 'crypto-random-string'
import ExtendableError from 'es6-error'
import _ from 'lodash'
import DeviceInfo from 'react-native-device-info'
import uuid from 'uuid'

import {encryptWithPassword} from '../../Catalyst/catalystCipher'
import LocalizableError from '../../i18n/LocalizableError'
import * as api from '../../legacy/api'
import assert from '../../legacy/assert'
import {ADDRESS_TYPE_TO_CHANGE, generateWalletRootKey} from '../../legacy/commonUtils'
import {
  CONFIG,
  getCardanoBaseConfig,
  getDefaultAssetByNetworkId,
  getWalletConfigById,
  isByron,
  isHaskellShelley,
} from '../../legacy/config'
import {CardanoError, InvalidState} from '../../legacy/errors'
import type {HWDeviceInfo} from '../../legacy/ledgerUtils'
import {signTxWithLedger} from '../../legacy/ledgerUtils'
import {Logger} from '../../legacy/logging'
import type {CardanoHaskellShelleyNetwork} from '../../legacy/networks'
import {isHaskellShelleyNetwork, PROVIDERS} from '../../legacy/networks'
import type {WalletMeta} from '../../legacy/state'
import storageLegacy from '../../legacy/storage'
import {deriveRewardAddressHex} from '../../legacy/utils'
import {
  Cardano,
  CardanoMobile,
  CardanoTypes,
  generatePrivateKeyForCatalyst,
  legacyWalletChecksum,
  NoOutputsError,
  NotEnoughMoneyToSendError,
  RegistrationStatus,
  walletChecksum,
} from '../cardano'
import {DefaultAsset, SendTokenList, Token, YoroiSignedTx, YoroiUnsignedTx} from '../types'
import type {
  AccountStateResponse,
  AddressedUtxo,
  BackendConfig,
  CurrencySymbol,
  FundInfoResponse,
  PoolInfoRequest,
  RawUtxo,
  TipStatusResponse,
  TokenInfoRequest,
  TxBodiesRequest,
  TxBodiesResponse,
  TxStatusRequest,
  TxStatusResponse,
} from '../types/other'
import {NETWORK_REGISTRY} from '../types/other'
import {genTimeToSlot} from '../utils/timeUtils'
import {versionCompare} from '../utils/versioning'
import Wallet, {WalletJSON} from '../Wallet'
import {AddressChain, AddressGenerator} from './chain'
import {filterAddressesByStakingKey, getDelegationStatus} from './shelley/delegationUtils'
import {TransactionCache} from './shelley/transactionCache'
import {yoroiSignedTx} from './signedTx'
import {NetworkId, WalletImplementationId, WalletInterface, YoroiProvider} from './types'
import {yoroiUnsignedTx} from './unsignedTx'

export default ShelleyWallet
export class ShelleyWallet extends Wallet implements WalletInterface {
  storage: typeof storageLegacy
  // =================== create =================== //
  constructor(storage: typeof storageLegacy) {
    super()
    this.storage = storage
  }

  save() {
    return this.storage.write(`/wallet/${this.id}/data`, this.toJSON())
  }

  async _initialize(
    networkId: NetworkId,
    implementationId: WalletImplementationId,
    accountPubKeyHex: string,
    hwDeviceInfo: null | HWDeviceInfo,
    readOnly: boolean,
    provider?: null | YoroiProvider,
  ) {
    if (!this.id) throw new Error('Invalid wallet creation state')
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
    this.notify({type: 'initialize'})

    this.isInitialized = true

    return this.id
  }

  async create(
    mnemonic: string,
    newPassword: string,
    networkId: NetworkId,
    implementationId: WalletImplementationId,
    provider?: null | YoroiProvider,
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
    const masterKey: string = Buffer.from(await masterKeyPtr.asBytes()).toString('hex')
    await this.encryptAndSaveMasterKey('MASTER_PASSWORD', masterKey, newPassword)
    const purpose = isByron(implementationId)
      ? CONFIG.NUMBERS.WALLET_TYPE_PURPOSE.BIP44
      : CONFIG.NUMBERS.WALLET_TYPE_PURPOSE.CIP1852

    const accountKey = await (
      await (await masterKeyPtr.derive(purpose)).derive(CONFIG.NUMBERS.COIN_TYPES.CARDANO)
    ).derive(CONFIG.NUMBERS.ACCOUNT_INDEX + CONFIG.NUMBERS.HARD_DERIVATION_START)
    const accountPubKey = await accountKey.toPublic()
    const accountPubKeyHex: string = Buffer.from(await accountPubKey.asBytes()).toString('hex')

    return this._initialize(
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
    hwDeviceInfo: null | HWDeviceInfo,
    readOnly: boolean,
  ) {
    Logger.info(`create wallet with account pub key (networkId=${String(networkId)})`)
    Logger.debug('account pub key', accountPublicKey)
    this.id = uuid.v4()
    assert.assert(!this.isInitialized, 'createWallet: !isInitialized')
    return this._initialize(networkId, implementationId, accountPublicKey, hwDeviceInfo, readOnly)
  }

  // =================== persistence =================== //

  async _runMigrations(data: WalletJSON, walletMeta: WalletMeta): Promise<void> {
    /**
     * New versions of Yoroi may involve changes in the data structure used to
     * store the wallet state. Hence, we need to check whether data migrations
     * are needed every time we open a wallet.
     * In some cases, we can determine that some data field needs to be
     * re-accommodated to a new format just by inspecting the data structure in
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

    if (this.networkId == null) throw new Error('Invalid wallet: networkId')

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
      if (!this.networkId) throw new Error('invalid state')
      assert.assert(isHaskellShelleyNetwork(this.networkId), 'invalid networkId')
      if (this.walletImplementationId == null) throw new Error('Invalid wallet: walletImplementationId')
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
      throw new InvalidState((e as Error).message)
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

  async sync() {
    await this.doFullSync()
    this.save()
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
    if (this.walletImplementationId == null) throw new Error('Invalid wallet: walletImplementationId')

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
    if (!this.internalChain) throw new Error('invalid wallet state')
    const candidateAddresses = this.internalChain.addresses
    const unseen = candidateAddresses.filter((addr) => !this.isUsedAddress(addr))
    assert.assert(unseen.length > 0, 'Cannot find change address')
    const changeAddress = _.first(unseen)
    if (!changeAddress) throw new Error('invalid wallet state')

    return changeAddress
  }

  async _getAddressedChangeAddress(): Promise<{address: string; addressing: CardanoTypes.Addressing}> {
    const changeAddr = this.getChangeAddress()
    const addressing = this.getAddressing(changeAddr)

    return {
      address: changeAddr,
      addressing,
    }
  }

  async getStakingKey() {
    if (this.walletImplementationId == null) throw new Error('Invalid wallet: walletImplementationId')

    assert.assert(isHaskellShelley(this.walletImplementationId), 'cannot get staking key from a byron-era wallet')
    if (!this.publicKeyHex) throw new Error('invalid wallet state')
    const accountPubKey = await CardanoMobile.Bip32PublicKey.fromBytes(Buffer.from(this.publicKeyHex, 'hex'))
    const stakingKey = await accountPubKey
      .derive(CONFIG.NUMBERS.CHAIN_DERIVATIONS.CHIMERIC_ACCOUNT)
      .then((key) => key.derive(CONFIG.NUMBERS.STAKING_KEY_INDEX))
      .then((key) => key.toRawKey())

    Logger.info(`getStakingKey: ${Buffer.from(await stakingKey.asBytes()).toString('hex')}`)
    return stakingKey
  }

  getStakingKeyPath(): Array<number> {
    if (this.walletImplementationId == null) throw new Error('Invalid wallet: walletImplementationId')

    assert.assert(isHaskellShelley(this.walletImplementationId), 'cannot get staking key from a byron-era wallet')
    return [
      CONFIG.NUMBERS.WALLET_TYPE_PURPOSE.CIP1852,
      CONFIG.NUMBERS.COIN_TYPES.CARDANO,
      CONFIG.NUMBERS.ACCOUNT_INDEX + CONFIG.NUMBERS.HARD_DERIVATION_START,
      CONFIG.NUMBERS.CHAIN_DERIVATIONS.CHIMERIC_ACCOUNT,
      CONFIG.NUMBERS.STAKING_KEY_INDEX,
    ]
  }

  async getRewardAddress() {
    if (this.walletImplementationId == null) throw new Error('Invalid wallet: walletImplementationId')

    assert.assert(isHaskellShelley(this.walletImplementationId), 'cannot get reward address from a byron-era wallet')
    const stakingKey = await this.getStakingKey()
    const credential = await CardanoMobile.StakeCredential.fromKeyhash(await stakingKey.hash())
    const rewardAddr = await CardanoMobile.RewardAddress.new(Number.parseInt(this._getChainNetworkId(), 10), credential)
    return rewardAddr.toAddress()
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
    return filterAddressesByStakingKey(
      await CardanoMobile.StakeCredential.fromKeyhash(await (await this.getStakingKey()).hash()),
      this.asLegacyAddressedUtxo(utxos),
      false,
    )
  }

  getAddressing(address: string) {
    const purpose = this._getPurpose()
    if (!this.internalChain) throw new Error('invalid wallet state')
    if (!this.externalChain) throw new Error('invalid wallet state')

    if (this.internalChain.isMyAddress(address)) {
      return {
        path: [
          purpose,
          CONFIG.NUMBERS.COIN_TYPES.CARDANO,
          CONFIG.NUMBERS.ACCOUNT_INDEX + CONFIG.NUMBERS.HARD_DERIVATION_START,
          ADDRESS_TYPE_TO_CHANGE['Internal'],
          this.internalChain.getIndexOfAddress(address),
        ],
        startLevel: CONFIG.NUMBERS.BIP44_DERIVATION_LEVELS.PURPOSE,
      }
    }

    if (this.externalChain.isMyAddress(address)) {
      return {
        path: [
          purpose,
          CONFIG.NUMBERS.COIN_TYPES.CARDANO,
          CONFIG.NUMBERS.ACCOUNT_INDEX + CONFIG.NUMBERS.HARD_DERIVATION_START,
          ADDRESS_TYPE_TO_CHANGE['External'],
          this.externalChain.getIndexOfAddress(address),
        ],
        startLevel: CONFIG.NUMBERS.BIP44_DERIVATION_LEVELS.PURPOSE,
      }
    }

    throw new Error(`Missing address info for: ${address} `)
  }

  asAddressedUtxo(utxos: Array<RawUtxo>) {
    const addressedUtxos = utxos.map((utxo: RawUtxo): CardanoTypes.CardanoAddressedUtxo => {
      const addressing = this.getAddressing(utxo.receiver)

      return {
        addressing,
        txIndex: utxo.tx_index,
        txHash: utxo.tx_hash,
        amount: utxo.amount,
        receiver: utxo.receiver,
        utxoId: utxo.utxo_id,
        assets: utxo.assets,
      }
    })

    return addressedUtxos
  }

  asLegacyAddressedUtxo(utxos: Array<RawUtxo>) {
    const addressedUtxos = utxos.map((utxo: RawUtxo): AddressedUtxo => {
      const addressing = this.getAddressing(utxo.receiver)

      return {
        ...utxo,
        addressing,
      }
    })

    return addressedUtxos
  }

  getDelegationStatus() {
    if (!this.transactionCache) throw new Error('invalid wallet state')
    if (this.rewardAddressHex == null) throw new Error('reward address is null')
    const certsForKey = this.transactionCache.perRewardAddressCertificates[this.rewardAddressHex]
    return Promise.resolve(getDelegationStatus(this.rewardAddressHex, certsForKey))
  }

  // =================== tx building =================== //

  async createUnsignedTx(
    utxos: Array<RawUtxo>,
    receiver: string,
    tokens: SendTokenList,
    defaultToken: Token,
    auxiliaryData?: Array<CardanoTypes.TxMetadata>,
  ) {
    const timeToSlotFn = genTimeToSlot(getCardanoBaseConfig(this._getNetworkConfig()))
    const time = await this.checkServerStatus()
      .then(({serverTime}) => serverTime || Date.now())
      .catch(() => Date.now())

    const absSlotNumber = new BigNumber(timeToSlotFn({time}).slot)
    const changeAddr = await this._getAddressedChangeAddress()
    const addressedUtxos = this.asAddressedUtxo(utxos)
    const networkConfig = this._getNetworkConfig()

    try {
      const unsignedTx = await Cardano.createUnsignedTx(
        absSlotNumber,
        addressedUtxos,
        receiver,
        changeAddr,
        tokens as any,
        {
          keyDeposit: networkConfig.KEY_DEPOSIT,
          linearFee: {
            coefficient: networkConfig.LINEAR_FEE.COEFFICIENT,
            constant: networkConfig.LINEAR_FEE.CONSTANT,
          },
          minimumUtxoVal: networkConfig.MINIMUM_UTXO_VAL,
          poolDeposit: networkConfig.POOL_DEPOSIT,
          networkId: networkConfig.NETWORK_ID,
        },
        defaultToken,
        {metadata: auxiliaryData},
      )

      return yoroiUnsignedTx({unsignedTx, networkConfig: this._getNetworkConfig(), addressedUtxos})
    } catch (e) {
      if (e instanceof NotEnoughMoneyToSendError || e instanceof NoOutputsError) throw e
      Logger.error(`shelley::createUnsignedTx:: ${(e as Error).message}`, e)
      throw new CardanoError((e as Error).message)
    }
  }

  async signTx(unsignedTx: YoroiUnsignedTx, decryptedMasterKey: string) {
    const masterKey = await CardanoMobile.Bip32PrivateKey.fromBytes(Buffer.from(decryptedMasterKey, 'hex'))
    const accountPrivateKey = await masterKey
      .derive(this._getPurpose())
      .then((key) => key.derive(CONFIG.NUMBERS.COIN_TYPES.CARDANO))
      .then((key) => key.derive(0 + CONFIG.NUMBERS.HARD_DERIVATION_START))
    const accountPrivateKeyHex = await accountPrivateKey.asBytes().then(toHex)
    const stakingPrivateKey = await accountPrivateKey
      .derive(CONFIG.NUMBERS.CHAIN_DERIVATIONS.CHIMERIC_ACCOUNT)
      .then((key) => key.derive(CONFIG.NUMBERS.STAKING_KEY_INDEX))
      .then((key) => key.toRawKey())
    const stakingKeys =
      unsignedTx.staking.delegations ||
      unsignedTx.staking.registrations ||
      unsignedTx.staking.deregistrations ||
      unsignedTx.staking.withdrawals
        ? [stakingPrivateKey]
        : undefined

    const signedTx = await unsignedTx.unsignedTx.sign(
      CONFIG.NUMBERS.BIP44_DERIVATION_LEVELS.ACCOUNT,
      accountPrivateKeyHex,
      new Set<string>(),
      stakingKeys,
    )

    return yoroiSignedTx({
      unsignedTx,
      signedTx,
    })
  }

  async createDelegationTx(
    poolId: string | undefined,
    delegatedAmount: BigNumber,
    utxos: Array<RawUtxo>,
    defaultAsset: DefaultAsset,
  ) {
    const timeToSlotFn = genTimeToSlot(getCardanoBaseConfig(this._getNetworkConfig()))
    const time = await this.checkServerStatus()
      .then(({serverTime}) => serverTime || Date.now())
      .catch(() => Date.now())

    const absSlotNumber = new BigNumber(timeToSlotFn({time}).slot)
    const changeAddr = await this._getAddressedChangeAddress()
    const addressedUtxos = this.asAddressedUtxo(utxos)
    const registrationStatus = (await this.getDelegationStatus()).isRegistered
    const stakingKey = await this.getStakingKey()
    const delegationType = registrationStatus ? RegistrationStatus.DelegateOnly : RegistrationStatus.RegisterAndDelegate
    const networkConfig = this._getNetworkConfig()
    const delegatedAmountMT = {
      values: [{identifier: '', amount: delegatedAmount, networkId: networkConfig.NETWORK_ID}],
      defaults: defaultAsset,
    }

    const unsignedTx = await Cardano.createUnsignedDelegationTx(
      absSlotNumber,
      addressedUtxos,
      stakingKey,
      delegationType,
      poolId || null,
      changeAddr,
      delegatedAmountMT,
      defaultAsset,
      {},
      {
        keyDeposit: networkConfig.KEY_DEPOSIT,
        linearFee: {
          constant: networkConfig.LINEAR_FEE.CONSTANT,
          coefficient: networkConfig.LINEAR_FEE.COEFFICIENT,
        },
        minimumUtxoVal: networkConfig.MINIMUM_UTXO_VAL,
        poolDeposit: networkConfig.POOL_DEPOSIT,
        networkId: networkConfig.NETWORK_ID,
      },
    )

    return yoroiUnsignedTx({
      unsignedTx,
      networkConfig,
      addressedUtxos,
    })
  }

  async createVotingRegTx() {
    Logger.debug('ShelleyWallet::createVotingRegTx called')
    if (!this.networkId) throw new Error('invalid wallet')
    const utxos = this.fetchUTXOs()

    const bytes = await generatePrivateKeyForCatalyst()
      .then((key) => key.toRawKey())
      .then((key) => key.asBytes())
    const pin = cryptoRandomString({length: 4, type: 'numeric'})
    const password = Buffer.from(pin.split('').map(Number))
    const catalystKeyEncrypted = await encryptWithPassword(password, bytes)
    const catalystKeyHex = Buffer.from(bytes).toString('hex')

    try {
      const timeToSlotFn = genTimeToSlot(getCardanoBaseConfig(this._getNetworkConfig()))
      const time = await this.checkServerStatus()
        .then(({serverTime}) => serverTime || Date.now())
        .catch(() => Date.now())

      const absSlotNumber = new BigNumber(timeToSlotFn({time}).slot)
      const defaultToken = getDefaultAssetByNetworkId(this.networkId)
      const votingPublicKey = await Promise.resolve(Buffer.from(catalystKeyHex, 'hex'))
        .then((bytes) => CardanoMobile.PrivateKey.fromExtendedBytes(bytes))
        .then((key) => key.toPublic())
      const stakingKeyPath = this.getStakingKeyPath()
      const stakingPublicKey = await this.getStakingKey()
      const changeAddr = await this._getAddressedChangeAddress()
      const networkConfig = this._getNetworkConfig()
      const config = {
        keyDeposit: networkConfig.KEY_DEPOSIT,
        linearFee: {
          coefficient: networkConfig.LINEAR_FEE.COEFFICIENT,
          constant: networkConfig.LINEAR_FEE.CONSTANT,
        },
        minimumUtxoVal: networkConfig.MINIMUM_UTXO_VAL,
        poolDeposit: networkConfig.POOL_DEPOSIT,
        networkId: networkConfig.NETWORK_ID,
      }
      const txOptions = {}
      const nonce = absSlotNumber.toNumber()
      const chainNetworkConfig = Number.parseInt(this._getChainNetworkId(), 10)

      const addressedUtxos = this.asAddressedUtxo(await utxos)

      const unsignedTx = await Cardano.createUnsignedVotingTx(
        absSlotNumber,
        defaultToken,
        votingPublicKey,
        stakingKeyPath,
        stakingPublicKey,
        addressedUtxos,
        changeAddr,
        config,
        txOptions,
        nonce,
        chainNetworkConfig,
      )

      const votingRegistration: {
        votingPublicKey: string
        stakingPublicKey: string
        rewardAddress: string
        nonce: number
      } = {
        votingPublicKey: await votingPublicKey.toBech32(),
        stakingPublicKey: await stakingPublicKey.toBech32(),
        rewardAddress: await this.getRewardAddress().then((address) => address.toBech32()),
        nonce,
      }

      return {
        votingKeyEncrypted: catalystKeyEncrypted,
        votingRegTx: await yoroiUnsignedTx({
          unsignedTx,
          networkConfig,
          votingRegistration,
          addressedUtxos,
        }),
      }
    } catch (e) {
      if (e instanceof LocalizableError || e instanceof ExtendableError) throw e
      Logger.error(`shelley::createVotingRegTx:: ${(e as Error).message}`, e)
      throw new CardanoError((e as Error).message)
    }
  }

  async createWithdrawalTx(
    utxos: Array<RawUtxo>,
    defaultAsset: DefaultAsset,
    shouldDeregister: boolean,
  ): Promise<YoroiUnsignedTx> {
    if (this.rewardAddressHex == null) throw new Error('reward address is null')
    const timeToSlotFn = genTimeToSlot(getCardanoBaseConfig(this._getNetworkConfig()))

    const time = await this.checkServerStatus()
      .then(({serverTime}) => serverTime || Date.now())
      .catch(() => Date.now())

    const absSlotNumber = new BigNumber(timeToSlotFn({time}).slot)
    const changeAddr = await this._getAddressedChangeAddress()
    const addressedUtxos = this.asAddressedUtxo(utxos)
    const accountState = await api.getAccountState(
      {addresses: [this.rewardAddressHex]},
      this._getNetworkConfig().BACKEND,
    )
    const withdrawalTx = await Cardano.createUnsignedWithdrawalTx(
      accountState,
      defaultAsset,
      absSlotNumber,
      addressedUtxos,
      [
        {
          addressing: this._getRewardAddressAddressing(),
          rewardAddress: this.rewardAddressHex,
          shouldDeregister,
        },
      ],
      changeAddr,
      {
        linearFee: {
          coefficient: this._getNetworkConfig().LINEAR_FEE.COEFFICIENT,
          constant: this._getNetworkConfig().LINEAR_FEE.CONSTANT,
        },
        minimumUtxoVal: this._getNetworkConfig().MINIMUM_UTXO_VAL,
        poolDeposit: this._getNetworkConfig().POOL_DEPOSIT,
        keyDeposit: this._getNetworkConfig().KEY_DEPOSIT,
        networkId: this._getNetworkConfig().NETWORK_ID,
      },
      {metadata: undefined},
    )

    return yoroiUnsignedTx({
      unsignedTx: withdrawalTx,
      networkConfig: this._getNetworkConfig(),
      addressedUtxos,
    })
  }

  async signTxWithLedger(unsignedTx: YoroiUnsignedTx, useUSB: boolean): Promise<YoroiSignedTx> {
    if (!this.hwDeviceInfo) throw new Error('Invalid wallet state')
    if (!this.publicKeyHex) throw new Error('Invalid wallet state')
    if (!this.walletImplementationId) throw new Error('Invalid wallet state')

    const ledgerPayload = await Cardano.buildLedgerPayload(
      unsignedTx.unsignedTx,
      Number.parseInt(this._getChainNetworkId(), 10),
      (this._getBaseNetworkConfig() as any).PROTOCOL_MAGIC,
      this.getStakingKeyPath(),
    )

    const signedLedgerTx = await signTxWithLedger(ledgerPayload, this.hwDeviceInfo, useUSB)
    const signedTx = await Cardano.buildLedgerSignedTx(
      unsignedTx.unsignedTx,
      signedLedgerTx,
      this._getPurpose(),
      this.publicKeyHex,
    )

    return yoroiSignedTx({
      unsignedTx,
      signedTx,
    })
  }

  // =================== backend API =================== //

  async checkServerStatus() {
    return api.checkServerStatus(this._getBackendConfig())
  }

  async getBestBlock() {
    return api.getBestBlock(this._getBackendConfig())
  }

  async submitTransaction(signedTx: string) {
    const response: any = await api.submitTransaction(signedTx, this._getBackendConfig())
    Logger.info(response)
    return response as any
  }

  async getTxsBodiesForUTXOs(request: TxBodiesRequest): Promise<TxBodiesResponse> {
    return api.getTxsBodiesForUTXOs(request, this._getBackendConfig())
  }

  async fetchUTXOs() {
    return api.bulkFetchUTXOsForAddresses(
      [...this.internalAddresses, ...this.externalAddresses],
      this._getBackendConfig(),
    )
  }

  async fetchAccountState(): Promise<AccountStateResponse> {
    if (this.rewardAddressHex == null) throw new Error('reward address is null')
    return api.bulkGetAccountState([this.rewardAddressHex], this._getBackendConfig())
  }

  async fetchPoolInfo(request: PoolInfoRequest) {
    return api.getPoolInfo(request, this._getBackendConfig())
  }

  fetchTokenInfo(request: TokenInfoRequest) {
    return api.getTokenInfo(request, this._getBackendConfig())
  }

  async fetchFundInfo(): Promise<FundInfoResponse> {
    return api.getFundInfo(this._getBackendConfig(), this._getNetworkConfig().IS_MAINNET)
  }

  async fetchTxStatus(request: TxStatusRequest): Promise<TxStatusResponse> {
    return api.fetchTxStatus(request, this._getBackendConfig())
  }

  async fetchTipStatus(): Promise<TipStatusResponse> {
    return api.getTipStatus(this._getBackendConfig())
  }

  async fetchCurrentPrice(symbol: CurrencySymbol): Promise<number> {
    return api.fetchCurrentPrice(symbol, this._getBackendConfig())
  }
}

const toHex = (bytes: Uint8Array) => Buffer.from(bytes).toString('hex')
