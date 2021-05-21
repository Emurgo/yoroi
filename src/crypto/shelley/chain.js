// @flow

/**
 * Shelley- & Byron-compatible address generator
 */

import _ from 'lodash'
import type {Moment} from 'moment'
import {
  BaseAddress,
  Bip32PublicKey,
  StakeCredential,
  RewardAddress,
} from '@emurgo/react-native-haskell-shelley'

import {CONFIG, isByron, isHaskellShelley} from '../../config/config'
import {getNetworkConfigById} from '../../config/networks'
import assert from '../../utils/assert'
import {defaultMemoize} from 'reselect'
import {Logger} from '../../utils/logging'
import * as util from '../byron/util'
import {ADDRESS_TYPE_TO_CHANGE} from '../commonUtils'

import type {CryptoAccount} from '../byron/util'
import type {AddressType} from '../commonUtils'
import type {WalletImplementationId, NetworkId} from '../../config/types'

export type AddressBlock = [number, Moment, Array<string>]

export class AddressGenerator {
  accountPubKeyHex: string
  type: AddressType
  walletImplementationId: WalletImplementationId
  networkId: NetworkId

  _accountPubKeyPtr: Bip32PublicKey
  _rewardAddressHex: string

  constructor(
    accountPubKeyHex: string,
    type: AddressType,
    walletImplementationId: WalletImplementationId,
    networkId: NetworkId,
  ) {
    this.accountPubKeyHex = accountPubKeyHex
    this.type = type
    this.walletImplementationId = walletImplementationId
    this.networkId = networkId
  }

  get byronAccount(): CryptoAccount {
    assert.assert(
      isByron(this.walletImplementationId),
      'chain::get::byronAccount: not a byron wallet',
    )
    return {
      derivation_scheme: 'V2',
      root_cached_key: this.accountPubKeyHex,
    }
  }

  async getRewardAddressHex() {
    if (!isHaskellShelley(this.walletImplementationId)) {
      return null
    }
    let chainNetworkId = CONFIG.NETWORKS.HASKELL_SHELLEY.CHAIN_NETWORK_ID
    const config = getNetworkConfigById(this.networkId)
    if (config.CHAIN_NETWORK_ID != null) {
      chainNetworkId = config.CHAIN_NETWORK_ID
    }
    if (this._rewardAddressHex != null) return this._rewardAddressHex
    // cache account public key
    if (this._accountPubKeyPtr == null) {
      this._accountPubKeyPtr = await Bip32PublicKey.from_bytes(
        Buffer.from(this.accountPubKeyHex, 'hex'),
      )
    }
    const stakingKey = await (await (await this._accountPubKeyPtr.derive(
      CONFIG.NUMBERS.CHAIN_DERIVATIONS.CHIMERIC_ACCOUNT,
    )).derive(CONFIG.NUMBERS.STAKING_KEY_INDEX)).to_raw_key()

    // cache reward address
    const credential = await StakeCredential.from_keyhash(
      await stakingKey.hash(),
    )
    const rewardAddr = await RewardAddress.new(
      parseInt(chainNetworkId, 10),
      credential,
    )
    const rewardAddrAsAddr = await rewardAddr.to_address()
    this._rewardAddressHex = Buffer.from(
      await rewardAddrAsAddr.to_bytes(),
      'hex',
    ).toString('hex')
    return this._rewardAddressHex
  }

  async generate(idxs: Array<number>): Promise<Array<string>> {
    if (isHaskellShelley(this.walletImplementationId)) {
      // assume mainnet by default
      let chainNetworkId = CONFIG.NETWORKS.HASKELL_SHELLEY.CHAIN_NETWORK_ID
      const config = getNetworkConfigById(this.networkId)
      if (config.CHAIN_NETWORK_ID != null) {
        chainNetworkId = config.CHAIN_NETWORK_ID
      }
      // cache account public key
      if (this._accountPubKeyPtr == null) {
        this._accountPubKeyPtr = await Bip32PublicKey.from_bytes(
          Buffer.from(this.accountPubKeyHex, 'hex'),
        )
      }
      const chainKey = await this._accountPubKeyPtr.derive(
        ADDRESS_TYPE_TO_CHANGE[this.type],
      )
      const stakingKey = await (await (await this._accountPubKeyPtr.derive(
        CONFIG.NUMBERS.CHAIN_DERIVATIONS.CHIMERIC_ACCOUNT,
      )).derive(CONFIG.NUMBERS.STAKING_KEY_INDEX)).to_raw_key()

      return await Promise.all(
        idxs.map(async (idx) => {
          const addrKey = await (await chainKey.derive(idx)).to_raw_key()
          const addr = await BaseAddress.new(
            parseInt(chainNetworkId, 10),
            await StakeCredential.from_keyhash(await addrKey.hash()),
            await StakeCredential.from_keyhash(await stakingKey.hash()),
          )
          return await (await addr.to_address()).to_bech32()
        }),
      )
    }

    return await util.getAddresses(this.byronAccount, this.type, idxs)
  }

  toJSON() {
    return {
      accountPubKeyHex: this.accountPubKeyHex,
      walletImplementationId: this.walletImplementationId,
      type: this.type,
    }
  }

  // note: byron-era wallets (ie. wallets created before the shelley
  // hardfork), stored the account-level publick key as a CryptoAccount object.
  // From v3.0.2 on, we simply store it as a plain hex string)
  static fromJSON(data: any, networkId: NetworkId) {
    const {accountPubKeyHex, type, walletImplementationId} = data

    let _accountPubKeyHex
    if (accountPubKeyHex == null) {
      // this should be a wallet created in Byron
      const {account} = data
      if (account?.root_cached_key != null) {
        // byron-era wallet
        _accountPubKeyHex = account.root_cached_key
      } else {
        throw new Error('cannot retrieve account public key.')
      }
    } else {
      // shelley-era wallet
      _accountPubKeyHex = accountPubKeyHex
    }

    let _walletImplementationId
    if (walletImplementationId == null) {
      _walletImplementationId =
        CONFIG.WALLETS.HASKELL_BYRON.WALLET_IMPLEMENTATION_ID
    } else {
      _walletImplementationId = walletImplementationId
    }
    return new AddressGenerator(
      _accountPubKeyHex,
      type,
      _walletImplementationId,
      networkId,
    )
  }
}

type AsyncAddressFilter = (addresses: Array<string>) => Promise<Array<string>>

type Addresses = Array<string>

const _addressToIdxSelector = (addresses: Array<string>) =>
  _.fromPairs(addresses.map((addr, i) => [addr, i]))

export class AddressChain {
  _addresses: Addresses = []
  _addressGenerator: AddressGenerator
  _blockSize: number
  _gapLimit: number
  _isInitialized: boolean = false
  _subscriptions: Array<(Addresses) => mixed> = []
  _addressToIdxSelector: (Addresses) => Dict<number> = defaultMemoize(
    _addressToIdxSelector,
  )

  constructor(
    addressGenerator: AddressGenerator,
    blockSize: number = CONFIG.WALLETS.HASKELL_SHELLEY.DISCOVERY_BLOCK_SIZE,
    gapLimit: number = CONFIG.WALLETS.HASKELL_SHELLEY.DISCOVERY_GAP_SIZE,
  ) {
    assert.assert(blockSize > gapLimit, 'Block size needs to be > gap limit')

    this._addressGenerator = addressGenerator
    this._blockSize = blockSize
    this._gapLimit = gapLimit
  }

  toJSON() {
    return {
      gapLimit: this._gapLimit,
      blockSize: this._blockSize,
      addresses: this._addresses,
      addressGenerator: this._addressGenerator.toJSON(),
    }
  }

  static fromJSON(data: any, networkId: NetworkId) {
    const {gapLimit, blockSize, addresses, addressGenerator} = data
    const chain = new AddressChain(
      AddressGenerator.fromJSON(addressGenerator, networkId),
      blockSize,
      gapLimit,
    )
    // is initialized && addresses
    chain._extendAddresses(addresses)
    chain._isInitialized = true
    chain._selfCheck()
    return chain
  }

  get addresses() {
    return this._addresses
  }

  get addressToIdxMap() {
    return this._addressToIdxSelector(this.addresses)
  }

  get publicKey() {
    return this._addressGenerator.accountPubKeyHex
  }

  async getRewardAddressHex() {
    return await this._addressGenerator.getRewardAddressHex()
  }

  addSubscriberToNewAddresses(subscriber: (Addresses) => mixed) {
    this._subscriptions.push(subscriber)
  }

  _extendAddresses(newAddresses: Array<string>) {
    assert.assert(
      _.intersection(this._addresses, newAddresses).length === 0,
      'extendAddresses received an existing address',
    )
    this._addresses = [...this._addresses, ...newAddresses]
    this._subscriptions.map((handler) => handler(newAddresses))
  }

  async _discoverNewBlock() {
    const addresses = this.addresses
    const start = this.size()
    const idxs = _.range(start, start + this._blockSize)

    const newAddresses = await this._addressGenerator.generate(idxs)

    if (this.addresses !== addresses) {
      Logger.warn('Concurrent modification to addresses')
    } else {
      this._extendAddresses(newAddresses)
    }
  }

  _getLastBlock() {
    this._selfCheck()
    const block = _.takeRight(this.addresses, this._blockSize)
    assert.assert(
      block.length === this._blockSize,
      'AddressChain::_getLastBlock(): block length',
    )
    return block
  }

  async initialize() {
    assert.assert(
      !this._isInitialized,
      'AddressChain::initialize(): !isInitialized',
    )
    await this._discoverNewBlock()
    assert.assert(
      !this._isInitialized,
      'AddressChain::initialized(): Concurrent modification',
    )
    this._isInitialized = true
  }

  _selfCheck() {
    assert.assert(
      this._isInitialized,
      'AddressChain::_selfCheck(): isInitialized',
    )
    assert.assert(
      this._addresses.length % this._blockSize === 0,
      'AddressChain::_selfCheck(): lengths',
    )
  }

  // TODO: consider removing the filterFn parameter (since it's called from
  // a generic wallet class). Add filterFn as class member and pass it in constructor?
  async sync(filterFn: AsyncAddressFilter) {
    let keepSyncing = true
    while (keepSyncing) {
      keepSyncing = await this._syncStep(filterFn)
    }
  }

  async _syncStep(filterFn: AsyncAddressFilter) {
    this._selfCheck()
    const block = this._getLastBlock()
    const used = await filterFn(block)

    // Index relative to the start of the block
    // It is okay to "overshoot" with -1 here
    const lastUsedIdx = used.length > 0 ? block.indexOf(_.last(used)) : -1

    const needsNewBlock = lastUsedIdx + this._gapLimit >= this._blockSize

    if (needsNewBlock) {
      await this._discoverNewBlock()
      return true
    } else {
      return false
    }
  }

  size() {
    return this._addresses.length
  }

  isMyAddress(address: string) {
    return this.addressToIdxMap[address] != null
  }

  getIndexOfAddress(address: string): number {
    assert.assert(
      this.isMyAddress(address),
      'getIndexOfAddress:: is not my address',
    )
    const idx = this.addressToIdxMap[address]
    return idx
  }

  getBlocks() {
    return _.chunk(this.addresses, this._blockSize)
  }

  // note(v-almonacid): this is an alternative to the method
  // wallet::getLastUsedIndex, which currently only works in byron environment
  async getLastUsedIndex(filterFn: AsyncAddressFilter) {
    await this.sync(filterFn)
    const totalGenerated = this.addresses.length
    const block = this._getLastBlock()
    const used = await filterFn(block)
    const lastUsedRelIdx = used.length > 0 ? block.indexOf(_.last(used)) : -1
    return totalGenerated > this._blockSize
      ? totalGenerated - this._blockSize + lastUsedRelIdx
      : lastUsedRelIdx
  }

  async getNextUnused(filterFn: AsyncAddressFilter) {
    const lastUsedIdx = await this.getLastUsedIndex(filterFn)
    return (await this._addressGenerator.generate([lastUsedIdx + 1]))[0]
  }
}
