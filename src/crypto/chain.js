// @flow
import _ from 'lodash'
import type {Moment} from 'moment'

import {CONFIG} from '../config'
import assert from '../utils/assert'
import {defaultMemoize} from 'reselect'
import {Logger} from '../utils/logging'
import * as util from './util'

import type {Dict} from '../state'
import type {CryptoAccount, AddressType} from './util'

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

type AsyncAddressFilter = (addresses: Array<string>) => Promise<Array<string>>

type Addresses = Array<string>

const _addressToIdxSelector = (addresses: Array<string>) =>
  _.fromPairs(addresses.map((addr, i) => [addr, i]))

export class AddressChain {
  _addresses: Addresses = []
  _addressGenerator: AddressGenerator
  _addressRequestSize: number
  _gapLimit: number
  _isInitialized: boolean = false
  _subscriptions: Array<(Addresses) => mixed> = []
  _addressToIdxSelector: (Addresses) => Dict<number> = defaultMemoize(
    _addressToIdxSelector,
  )

  constructor(
    addressGenerator: AddressGenerator,
    addressRequestSize: number = CONFIG.WALLET.ADDRESS_REQUEST_SIZE,
    gapLimit: number = CONFIG.WALLET.DISCOVERY_GAP_SIZE,
  ) {
    assert.assert(addressRequestSize > gapLimit, 'addressRequestSize needs to be > gap limit')

    this._addressGenerator = addressGenerator
    this._addressRequestSize = addressRequestSize
    this._gapLimit = gapLimit
  }

  toJSON() {
    return {
      gapLimit: this._gapLimit,
      addressRequestSize: this._addressRequestSize,
      addresses: this._addresses,
      addressGenerator: this._addressGenerator.toJSON(),
    }
  }

  static fromJSON(data: any) {
    const {gapLimit, addressRequestSize, addresses, addressGenerator} = data
    const chain = new AddressChain(
      AddressGenerator.fromJSON(addressGenerator),
      addressRequestSize,
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

  async _generateNewAddressChunk() {
    const addresses = this.addresses
    const start = this.size()
    const idxs = _.range(start, start + this._addressRequestSize)

    const newAddresses = await this._addressGenerator.generate(idxs)

    if (this.addresses !== addresses) {
      Logger.warn('Concurrent modification to addresses')
    } else {
      this._extendAddresses(newAddresses)
    }
  }

  _getLastestAddreessChunk() {
    this._selfCheck()
    const chunk = _.takeRight(this.addresses, this._addressRequestSize)
    assert.assert(
      chunk.length === this._addressRequestSize,
      'AddressChain::_getLastestAddreessChunk(): chunk length',
    )
    return chunk
  }

  async initialize() {
    assert.assert(
      !this._isInitialized,
      'AddressChain::initialize(): !isInitialized',
    )
    await this._generateNewAddressChunk()
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
      this._addresses.length % this._addressRequestSize === 0,
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
    const chunk = this._getLastestAddreessChunk()
    const used = await filterFn(chunk)

    // Index relative to the start of the chunk
    // It is okay to "overshoot" with -1 here
    const lastUsedIdx = used.length > 0 ? chunk.indexOf(_.last(used)) : -1

    const needsNewAddresses = lastUsedIdx + this._gapLimit >= this._addressRequestSize

    if (needsNewAddresses) {
      await this._generateNewAddressChunk()
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

  getAddressChunks() {
    return _.chunk(this.addresses, this._addressRequestSize)
  }
}
