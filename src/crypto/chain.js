// @flow
import _ from 'lodash'
import type {Moment} from 'moment'

import {CONFIG, NUMBERS} from '../config'
import assert from '../utils/assert'
import {defaultMemoize} from 'reselect'
import {Logger} from '../utils/logging'
import * as util from './byron/util'
import * as shelleyUtil from './shelley/util'
import {
  Bip32PublicKey,
  // PublicKey,
} from 'react-native-chain-libs'

import type {Dict} from '../state'
import type {CryptoAccount} from './byron/util'
import type {AddressType} from './commonUtils'

export type AddressBlock = [number, Moment, Array<string>]

export class AddressGenerator {
  account: CryptoAccount
  type: AddressType

  constructor(account: CryptoAccount, type: AddressType) {
    this.account = account
    this.type = type
  }

  generate(idxs: Array<number>): Promise<Array<string>> {
    return util.getAddresses(this.account, this.type, idxs)
  }

  toJSON() {
    return {
      account: this.account,
      type: this.type,
    }
  }

  static fromJSON(data: any) {
    const {account, type} = data
    return new AddressGenerator(account, type)
  }
}

export class ShelleyAddressGenerator {
  addressChain: Bip32PublicKey
  // stakingKey: PublicKey
  // for now, need to store accountKey instead of stakingKey because the latter
  // is PublicKey instance and from_bech32() is currently mising from the
  // bindings. This means we cannot restore the wallet
  accountPublic: Bip32PublicKey
  type: AddressType

  constructor(
    addressChain: Bip32PublicKey,
    type: AddressType,
    // stakingKey: PublicKey,
    accountPublic: Bip32PublicKey,
  ) {
    this.addressChain = addressChain
    // this.stakingKey = stakingKey
    this.accountPublic = accountPublic
    this.type = type
  }

  async generate(idxs: Array<number>): Promise<Array<string>> {
    const stakingKey = await (await (await this.accountPublic.derive(
      NUMBERS.CHAIN_DERIVATIONS.CHIMERIC_ACCOUNT,
    )).derive(NUMBERS.STAKING_KEY_INDEX)).to_raw_key()

    return shelleyUtil.getGroupAddresses(this.addressChain, stakingKey, idxs)
  }

  async toJSON() {
    return {
      addressChainBech32: await this.addressChain.to_bech32(),
      // stakingKeyBech32: await this.stakingKey.to_bech32(), // to_bech32 not impl yet
      accountPublicBech32: await this.accountPublic.to_bech32(),
      type: this.type,
    }
  }

  static async fromJSON(data: any) {
    const {addressChainBech32, accountPublicBech32, type} = data
    const addressChain = await Bip32PublicKey.from_bech32(addressChainBech32)
    // const stakingKey = await Bip32PublicKey.from_bech32(stakingKeyBech32)
    const accountPublic = await Bip32PublicKey.from_bech32(accountPublicBech32)
    return new ShelleyAddressGenerator(addressChain, accountPublic, type)
  }
}

type AsyncAddressFilter = (
  addresses: Array<string>,
  networkConfig?: any,
) => Promise<Array<string>>

type Addresses = Array<string>

const _addressToIdxSelector = (addresses: Array<string>) =>
  _.fromPairs(addresses.map((addr, i) => [addr, i]))

export class AddressChain {
  _addresses: Addresses = []
  _addressGenerator: AddressGenerator | ShelleyAddressGenerator
  _blockSize: number
  _gapLimit: number
  _isInitialized: boolean = false
  _subscriptions: Array<(Addresses) => mixed> = []
  _addressToIdxSelector: (Addresses) => Dict<number> = defaultMemoize(
    _addressToIdxSelector,
  )

  constructor(
    addressGenerator: AddressGenerator,
    blockSize: number = CONFIG.WALLET.DISCOVERY_BLOCK_SIZE,
    gapLimit: number = CONFIG.WALLET.DISCOVERY_GAP_SIZE,
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

  static fromJSON(data: any) {
    const {gapLimit, blockSize, addresses, addressGenerator} = data
    const chain = new AddressChain(
      AddressGenerator.fromJSON(addressGenerator),
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

  async sync(
    filterFn: AsyncAddressFilter,
    networkConfig: any = CONFIG.CARDANO,
  ) {
    let keepSyncing = true
    while (keepSyncing) {
      keepSyncing = await this._syncStep(filterFn, networkConfig)
    }
  }

  async _syncStep(
    filterFn: AsyncAddressFilter,
    networkConfig: any = CONFIG.CARDANO,
  ) {
    this._selfCheck()
    const block = this._getLastBlock()
    const used = await filterFn(block, networkConfig)

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
}
