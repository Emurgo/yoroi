// @flow
import _ from 'lodash'
import type {Moment} from 'moment'

import {CONFIG} from '../config/config'
import {NUMBERS} from '../config/numbers'
import assert from '../utils/assert'
import {defaultMemoize} from 'reselect'
import {Logger} from '../utils/logging'
import * as util from './byron/util'
import * as jormunUtil from './jormungandr/util'
import {ADDRESS_TYPE_TO_CHANGE} from './commonUtils'
import {Address, Bip32PublicKey} from 'react-native-chain-libs'

import type {Dict} from '../state'
import type {CryptoAccount} from './byron/util'
import type {AddressType} from './commonUtils'

export type AddressBlock = [number, Moment, Array<string>]

export class AddressGenerator {
  account: CryptoAccount | string
  type: AddressType
  isJormungandr: boolean

  _shelleyAccount: Bip32PublicKey

  constructor(
    account: CryptoAccount | string,
    type: AddressType,
    isJormungandr?: boolean = false,
  ) {
    this.account = account
    this.type = type
    this.isJormungandr = isJormungandr
  }

  async generate(idxs: Array<number>): Promise<Array<string>> {
    if (this.isJormungandr) {
      // cache shelley account
      if (
        this._shelleyAccount == null &&
        (typeof this.account === 'string' || this.account instanceof String)
      ) {
        this._shelleyAccount = await Bip32PublicKey.from_bytes(
          Buffer.from(this.account, 'hex'),
        )
      }
      const addressChain = await this._shelleyAccount.derive(
        ADDRESS_TYPE_TO_CHANGE[this.type],
      )
      const stakingKey = await (await (await this._shelleyAccount.derive(
        NUMBERS.CHAIN_DERIVATIONS.CHIMERIC_ACCOUNT,
      )).derive(NUMBERS.STAKING_KEY_INDEX)).to_raw_key()
      const addrs = await jormunUtil.getGroupAddresses(
        addressChain,
        stakingKey,
        idxs,
      )
      // in contrast to Byron, for Shelley we return hex addresses
      return await Promise.all(
        addrs.map(async (addr) => {
          const obj = await Address.from_string(addr)
          return Buffer.from(await obj.as_bytes()).toString('hex')
        }),
      )
    } else if (
      !(typeof this.account === 'string' || this.account instanceof String)
    ) {
      return util.getAddresses(this.account, this.type, idxs)
    } else {
      throw new Error('AddressGenerator::generate: account is invalid')
    }
  }

  toJSON() {
    return {
      account: this.account,
      type: this.type,
      isJormungandr: this.isJormungandr,
    }
  }

  static fromJSON(data: any) {
    const {account, type, isJormungandr} = data
    if (isJormungandr == null) {
      if (data.isShelley != null) {
        return new AddressGenerator(account, type, data.isShelley)
      } else {
        throw new Error(
          "AddressGenerator::fromJSON: can't retrieve wallet type",
        )
      }
    }
    return new AddressGenerator(account, type, isJormungandr)
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
