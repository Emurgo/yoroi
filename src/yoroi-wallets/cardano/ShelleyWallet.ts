/* eslint-disable @typescript-eslint/no-explicit-any */
import type {SignTransactionResponse} from '@cardano-foundation/ledgerjs-hw-app-cardano'
import {TxAuxiliaryDataSupplementType} from '@cardano-foundation/ledgerjs-hw-app-cardano'
import {legacyWalletChecksum, walletChecksum} from '@emurgo/cip4-js'
import {BigNumber} from 'bignumber.js'
import ExtendableError from 'es6-error'
import _ from 'lodash'
import DeviceInfo from 'react-native-device-info'
import uuid from 'uuid'

import LocalizableError from '../../i18n/LocalizableError'
import * as api from '../../legacy/api'
import assert from '../../legacy/assert'
import {ADDRESS_TYPE_TO_CHANGE, generateWalletRootKey} from '../../legacy/commonUtils'
import {CONFIG, getCardanoBaseConfig, getWalletConfigById, isByron, isHaskellShelley} from '../../legacy/config'
import {CardanoError, InvalidState} from '../../legacy/errors'
import type {DefaultAsset} from '../../legacy/HistoryTransaction'
import type {HWDeviceInfo} from '../../legacy/ledgerUtils'
import {buildSignedTransaction, createLedgerSignTxPayload, signTxWithLedger} from '../../legacy/ledgerUtils'
import {Logger} from '../../legacy/logging'
import type {CardanoHaskellShelleyNetwork} from '../../legacy/networks'
import {isHaskellShelleyNetwork, PROVIDERS} from '../../legacy/networks'
import type {WalletMeta} from '../../legacy/state'
import type {BackendConfig} from '../../legacy/types'
import type {
  AccountStateResponse,
  FundInfoResponse,
  PoolInfoRequest,
  RawUtxo,
  TokenInfoRequest,
  TxBodiesRequest,
  TxBodiesResponse,
  TxStatusRequest,
  TxStatusResponse,
} from '../../legacy/types'
import type {AddressedUtxo, Addressing} from '../../legacy/types'
import {NETWORK_REGISTRY} from '../../legacy/types'
import {deriveRewardAddressHex, normalizeToAddress, toHexOrBase58} from '../../legacy/utils'
import {DefaultTokenEntry, SendTokenList} from '../../types'
import {genTimeToSlot} from '../utils/timeUtils'
import {versionCompare} from '../utils/versioning'
import Wallet, {WalletJSON} from '../Wallet'
import {
  Address,
  BigNum,
  Bip32PrivateKey,
  Bip32PublicKey,
  hashTransaction,
  LinearFee,
  makeVkeyWitness,
  PrivateKey,
  PublicKey,
  RewardAddress,
  StakeCredential,
} from '.'
import * as catalystUtils from './catalyst/catalystUtils'
import {AddressChain, AddressGenerator} from './chain'
import {HaskellShelleyTxSignRequest} from './HaskellShelleyTxSignRequest'
import type {JSONMetadata} from './metadataUtils'
import {createAuxiliaryData} from './metadataUtils'
import {MultiToken} from './MultiToken'
import {
  createDelegationTx,
  createWithdrawalTx,
  filterAddressesByStakingKey,
  getDelegationStatus,
} from './shelley/delegationUtils'
import {TransactionCache} from './shelley/transactionCache'
import {newAdaUnsignedTx, signTransaction} from './shelley/transactions'
import {createUnsignedTx as utilsCreateUnsignedTx} from './shelley/transactionUtils'
import {NetworkId, SignedTx, WalletImplementationId, WalletInterface, YoroiProvider} from './types'

export default ShelleyWallet
export class ShelleyWallet extends Wallet implements WalletInterface {
  // =================== create =================== //

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
    this.notify()

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
    hwDeviceInfo: null | HWDeviceInfo,
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

  // returns the address in hex (Shelley) or base58 (Byron) format
  async _getAddressedChangeAddress(): Promise<{address: string} & Addressing> {
    const changeAddr = this.getChangeAddress()
    const addressInfo = this.getAddressingInfo(changeAddr)
    if (addressInfo == null) {
      throw new Error("Couldn't get change addressing, should never happen")
    }
    const normAddr = await normalizeToAddress(changeAddr)
    return {
      address: await toHexOrBase58(normAddr as any),
      addressing: addressInfo as any,
    }
  }

  async getStakingKey() {
    if (this.walletImplementationId == null) throw new Error('Invalid wallet: walletImplementationId')

    assert.assert(isHaskellShelley(this.walletImplementationId), 'cannot get staking key from a byron-era wallet')
    if (!this.publicKeyHex) throw new Error('invalid wallet state')
    const accountPubKey = await Bip32PublicKey.fromBytes(Buffer.from(this.publicKeyHex, 'hex'))
    const stakingKey = await (
      await (
        await accountPubKey.derive(CONFIG.NUMBERS.CHAIN_DERIVATIONS.CHIMERIC_ACCOUNT)
      ).derive(CONFIG.NUMBERS.STAKING_KEY_INDEX)
    ).toRawKey()
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
    const credential = await StakeCredential.fromKeyhash(await stakingKey.hash())
    const rewardAddr = await RewardAddress.new(Number.parseInt(this._getChainNetworkId(), 10), credential)
    return await rewardAddr.toAddress()
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
      await StakeCredential.fromKeyhash(await (await this.getStakingKey()).hash()),
      this.asAddressedUtxo(utxos),
      false,
    )
  }

  getAddressingInfo(address: string) {
    const purpose = this._getPurpose()
    if (!this.internalChain) throw new Error('invalid wallet state')
    if (!this.externalChain) throw new Error('invalid wallet state')
    const chains = [['Internal', this.internalChain] as const, ['External', this.externalChain] as const]
    let addressInfo: unknown = null
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
        addressing: addressInfo as any,
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
    defaultToken: DefaultTokenEntry,
    serverTime: Date | void,
    auxiliaryData: Array<JSONMetadata> | void,
  ): Promise<HaskellShelleyTxSignRequest> {
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
      tokens: tokens as any,
      auxiliaryData: auxiliary,
      networkConfig: this._getNetworkConfig(),
    })
  }

  async signTx(signRequest: HaskellShelleyTxSignRequest, decryptedMasterKey: string): Promise<SignedTx> {
    const masterKey = await Bip32PrivateKey.fromBytes(Buffer.from(decryptedMasterKey, 'hex'))
    const accountPvrKey = await (
      await (await masterKey.derive(this._getPurpose())).derive(CONFIG.NUMBERS.COIN_TYPES.CARDANO)
    ).derive(0 + CONFIG.NUMBERS.HARD_DERIVATION_START)
    const wits = new Set<string>()

    if (!(signRequest instanceof HaskellShelleyTxSignRequest)) {
      throw new Error('expected instance of HaskellShelleyTxSignRequest')
    }

    if (signRequest.neededStakingKeyHashes.neededHashes.size !== 0) {
      if (this.walletImplementationId == null) throw new Error('Invalid wallet: walletImplementationId')

      // this is a delegation tx and we need to provide the staking key
      assert.assert(isHaskellShelley(this.walletImplementationId), 'cannot get reward address from a byron-era wallet')
      const txBuilder = signRequest.unsignedTx

      const stakingKey = await (
        await (
          await accountPvrKey.derive(CONFIG.NUMBERS.CHAIN_DERIVATIONS.CHIMERIC_ACCOUNT)
        ).derive(CONFIG.NUMBERS.STAKING_KEY_INDEX)
      ).toRawKey()

      wits.add(
        Buffer.from(
          await (await makeVkeyWitness(await hashTransaction(await txBuilder.build()), stakingKey)).toBytes(),
        ).toString('hex'),
      )
    }

    const signedTx = await signTransaction(
      signRequest.senderUtxos,
      signRequest.unsignedTx,
      CONFIG.NUMBERS.BIP44_DERIVATION_LEVELS.ACCOUNT,
      accountPvrKey,
      wits,
      signRequest.auxiliary(),
    )
    const id = Buffer.from(await (await hashTransaction(await signedTx.body())).toBytes()).toString('hex')
    const encodedTx = await signedTx.toBytes()
    const base64 = Buffer.from(encodedTx).toString('base64')
    return {
      id,
      encodedTx,
      base64,
    }
  }

  async createDelegationTx(
    poolRequest: void | string,
    valueInAccount: BigNumber,
    utxos: Array<RawUtxo>,
    defaultAsset: DefaultAsset,
    serverTime: Date | void,
  ): Promise<{
    signRequest: HaskellShelleyTxSignRequest
    totalAmountToDelegate: MultiToken
  }> {
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
  ) {
    Logger.debug('ShelleyWallet::createVotingRegTx called')
    try {
      const timeToSlotFn = await genTimeToSlot(getCardanoBaseConfig(this._getNetworkConfig()))
      const time = serverTime !== undefined ? serverTime : new Date()
      const absSlotNumber = new BigNumber(timeToSlotFn({time}).slot)

      const changeAddr = await this._getAddressedChangeAddress()
      const addressedUtxos = this.asAddressedUtxo(utxos)

      let signer: (arg: Uint8Array) => Promise<string>
      if (decryptedKey !== undefined) {
        assert.assert(typeof decryptedKey === 'string', 'ShelleyWallet:createVotingRegTx: decryptedKey')
        const masterKey = await Bip32PrivateKey.fromBytes(Buffer.from(decryptedKey, 'hex'))

        const accountPvrKey = await (
          await (await masterKey.derive(this._getPurpose())).derive(CONFIG.NUMBERS.COIN_TYPES.CARDANO)
        ).derive(0 + CONFIG.NUMBERS.HARD_DERIVATION_START)

        const stakePrivateKey = await (
          await (
            await accountPvrKey.derive(CONFIG.NUMBERS.CHAIN_DERIVATIONS.CHIMERIC_ACCOUNT)
          ).derive(CONFIG.NUMBERS.STAKING_KEY_INDEX)
        ).toRawKey()

        signer = async (hashedMetadata) => {
          return await (await stakePrivateKey.sign(hashedMetadata)).toHex()
        }
      } else {
        assert.assert(this.isHW, 'ShelleyWallet::createVotingRegTx: should be a HW wallet')
        signer = (_hashedMetadata) => Promise.resolve('0'.repeat(64 * 2))
      }

      const catalystPublicKey = await (await PrivateKey.fromExtendedBytes(Buffer.from(catalystKey, 'hex'))).toPublic()
      const votingPublicKey = Buffer.from(await catalystPublicKey.asBytes()).toString('hex')

      const stakePublicKey = await this.getStakingKey()
      const rewardAddress = await this.getRewardAddress()

      let nonce: number
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
        keyDeposit: await BigNum.fromStr(config.KEY_DEPOSIT),
        linearFee: await LinearFee.new(
          await BigNum.fromStr(config.LINEAR_FEE.COEFFICIENT),
          await BigNum.fromStr(config.LINEAR_FEE.CONSTANT),
        ),
        minimumUtxoVal: await BigNum.fromStr(config.MINIMUM_UTXO_VAL),
        poolDeposit: await BigNum.fromStr(config.POOL_DEPOSIT),
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
              stakingKey: Buffer.from(await stakePublicKey.asBytes()).toString('hex'),
              rewardAddress: Buffer.from(await rewardAddress.toBytes()).toString('hex'),
              nonce,
            }
          : undefined,
      })
      return signRequest
    } catch (e) {
      if (e instanceof LocalizableError || e instanceof ExtendableError) throw e
      Logger.error(`shelley::createVotingRegTx:: ${(e as Error).message}`, e)
      throw new CardanoError((e as Error).message)
    }
  }

  async createWithdrawalTx(
    utxos: Array<RawUtxo>,
    shouldDeregister: boolean,
    serverTime: Date | void,
  ): Promise<HaskellShelleyTxSignRequest> {
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

  async signTxWithLedger(request: HaskellShelleyTxSignRequest, useUSB: boolean): Promise<SignedTx> {
    Logger.debug('ShelleyWallet::signTxWithLedger called')

    if (!(request instanceof HaskellShelleyTxSignRequest)) {
      throw new Error('expected instance of HaskellShelleyTxSignRequest')
    }

    const addressingInfo = {}
    for (const change of await request.changeAddr) {
      if (this.walletImplementationId == null) throw new Error('Invalid wallet: walletImplementationId')

      const addressing = isByron(this.walletImplementationId)
        ? this.getAddressingInfo(change.address)
        : this.getAddressingInfo(await (await Address.fromBytes(Buffer.from(change.address, 'hex'))).toBech32())
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
      byronNetworkMagic: (this._getBaseNetworkConfig() as any).PROTOCOL_MAGIC,
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

    let auxiliaryData
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
        catalystPublicKey: await PublicKey.fromBytes(Buffer.from(votingPublicKey, 'hex')),
        rewardAddress: await this.getRewardAddress(),
        absSlotNumber: nonce,
        signer: (_hashedMetadata) => {
          return Promise.resolve(catalystRegistrationSignatureHex)
        },
      })
      // We can verify that
      //  Buffer.from(
      //    blake2b(256 / 8).update(metadata.toBytes()).digest('binary')
      //  ).toString('hex') ===
      // ledgerSignTxResp.auxiliaryDataSupplement.auxiliaryDataHashaHex
    } else {
      auxiliaryData = request.auxiliaryData
    }

    if (auxiliaryData) {
      await request.self().setAuxiliaryData(auxiliaryData)
    }

    const txBody = await request.self().build()

    if (!this.publicKeyHex) throw new Error('invalid wallet state')
    const key = await Bip32PublicKey.fromBytes(Buffer.from(this.publicKeyHex, 'hex'))
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
    const id = Buffer.from(await (await hashTransaction(await signedTx.body())).toBytes()).toString('hex')
    const encodedTx = await signedTx.toBytes()
    const base64 = Buffer.from(encodedTx).toString('base64')
    Logger.debug('ShelleyWallet::signTxWithLedger::encodedTx', Buffer.from(encodedTx).toString('hex'))
    return {
      id,
      encodedTx,
      base64,
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
    const response: any = await api.submitTransaction(signedTx, this._getBackendConfig())
    Logger.info(response)
    return response as any
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

  async fetchPoolInfo(request: PoolInfoRequest) {
    return await api.getPoolInfo(request, this._getBackendConfig())
  }

  fetchTokenInfo(request: TokenInfoRequest) {
    return api.getTokenInfo(request, this._getBackendConfig())
  }

  async fetchFundInfo(): Promise<FundInfoResponse> {
    return await api.getFundInfo(this._getBackendConfig(), this._getNetworkConfig().IS_MAINNET)
  }

  async fetchTxStatus(request: TxStatusRequest): Promise<TxStatusResponse> {
    return api.fetchTxStatus(request, this._getBackendConfig())
  }
}
