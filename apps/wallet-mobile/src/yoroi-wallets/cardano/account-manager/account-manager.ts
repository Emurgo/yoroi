import {parseSafe} from '@yoroi/common'
import {App, Wallet} from '@yoroi/types'
import assert from 'assert'
import _ from 'lodash'
import {defaultMemoize} from 'reselect'

import {cardanoConfig} from '../../../features/WalletManager/common/adapters/cardano/cardano-config'
import {derivationConfig} from '../../../features/WalletManager/common/derivation-config'
import {logger} from '../../../kernel/logger/logger'
import {CardanoMobile} from '../../wallets'
import * as legacyApi from '../api/api'
import {CardanoTypes} from '../types'

// NOTE: needs full refactor
export class AddressGenerator {
  accountPubKeyHex: string
  role: number
  implementation: Wallet.Implementation
  chainId: number

  _accountPubKeyPtr: undefined | CardanoTypes.Bip32PublicKey
  _rewardAddressHex: undefined | string

  constructor(accountPubKeyHex: string, role: number, implementation: Wallet.Implementation, chainId: number) {
    this.accountPubKeyHex = accountPubKeyHex
    this.role = role
    this.implementation = implementation
    this.chainId = chainId
  }

  async getRewardAddressHex() {
    const config = cardanoConfig.implementations[this.implementation]
    if (!config.features.staking) return null
    const staking = config.features.staking

    if (this._rewardAddressHex != null) return this._rewardAddressHex

    // cache account public key
    if (this._accountPubKeyPtr == null) {
      this._accountPubKeyPtr = await CardanoMobile.Bip32PublicKey.fromBytes(Buffer.from(this.accountPubKeyHex, 'hex'))
    }

    const stakingRawKey = await this._accountPubKeyPtr
      .derive(staking.derivation.role)
      .then((withRole) => withRole.derive(staking.derivation.index))
      .then((withIndex) => withIndex.toRawKey())
    const stakingKeyHash = await stakingRawKey.hash()

    const credential = await CardanoMobile.Credential.fromKeyhash(stakingKeyHash)
    const rewardAddr = await CardanoMobile.RewardAddress.new(this.chainId, credential)
    const rewardAddrAsAddr = await rewardAddr.toAddress()
    const rewardAddrBytes = await rewardAddrAsAddr.toBytes()

    this._rewardAddressHex = Buffer.from(rewardAddrBytes).toString('hex')
    return this._rewardAddressHex
  }

  async generate(indexes: Array<number>): Promise<Array<string>> {
    const config = cardanoConfig.implementations[this.implementation]

    if (!config.features.staking) {
      return getBIP44Addresses(this.accountPubKeyHex, this.role, indexes)
    } else {
      // cache account public key
      if (this._accountPubKeyPtr == null) {
        this._accountPubKeyPtr = await CardanoMobile.Bip32PublicKey.fromBytes(Buffer.from(this.accountPubKeyHex, 'hex'))
      }

      const staking = config.features.staking
      const stakingCredential = await this._accountPubKeyPtr
        .derive(staking.derivation.role)
        .then((withRole) => withRole.derive(staking.derivation.index))
        .then((withIndex) => withIndex.toRawKey())
        .then((rawKey) => rawKey.hash())
        .then((keyHash) => CardanoMobile.Credential.fromKeyhash(keyHash))

      const withType = await this._accountPubKeyPtr.derive(this.role)
      return Promise.all(
        indexes.map(async (index) => {
          const addressCredential = await withType
            .derive(index)
            .then((withIndex) => withIndex.toRawKey())
            .then((rawKey) => rawKey.hash())
            .then((keyHash) => CardanoMobile.Credential.fromKeyhash(keyHash))

          const baseAddressBech32 = await CardanoMobile.BaseAddress.new(
            this.chainId,
            addressCredential,
            stakingCredential,
          )
            .then((base) => base.toAddress())
            .then((address) => address.toBech32(undefined))

          return baseAddressBech32
        }),
      )
    }
  }

  toJSON(): AddressGeneratorJSON {
    return {
      accountPubKeyHex: this.accountPubKeyHex,
      implementation: this.implementation,
      role: this.role,
    }
  }

  static fromJSON(data: AddressGeneratorJSON, chainId: number) {
    const {role, implementation, accountPubKeyHex} = data

    return new AddressGenerator(accountPubKeyHex, role, implementation, chainId)
  }
}

const _addressToIdxSelector = (addresses: Array<string>) => _.fromPairs(addresses.map((addr, i) => [addr, i]))

export class AddressChain {
  _addresses: Addresses = []
  _addressGenerator: AddressGenerator
  _blockSize: number
  _gapLimit: number
  _isInitialized = false
  _subscriptions: Array<(addresses: Addresses) => unknown> = []
  _addressToIdxSelector: (addresses: Addresses) => Record<string, number> = defaultMemoize(_addressToIdxSelector)
  #lastUsedIndex: number
  #lastUsedIndexVisual: number

  constructor(
    addressGenerator: AddressGenerator,
    blockSize = 50,
    gapLimit = 20,
    lastUsedIndex = 0,
    lastUsedIndexVisual = lastUsedIndex,
  ) {
    assert(blockSize > gapLimit, 'Block size needs to be > gap limit')

    this._addressGenerator = addressGenerator
    this._blockSize = blockSize
    this._gapLimit = gapLimit
    this.#lastUsedIndex = lastUsedIndex
    this.#lastUsedIndexVisual = lastUsedIndexVisual
  }

  toJSON(): AddressChainJSON {
    return {
      gapLimit: this._gapLimit,
      blockSize: this._blockSize,
      addresses: this._addresses,
      lastUsedIndex: this.#lastUsedIndex,
      lastUsedIndexVirtual: this.#lastUsedIndexVisual,
      addressGenerator: this._addressGenerator.toJSON(),
    }
  }

  get info() {
    return {
      lastUsedIndex: this.#lastUsedIndex,
      lastUsedIndexVisual: this.#lastUsedIndexVisual,
      canIncrease: this.#lastUsedIndexVisual - this.#lastUsedIndex < this._gapLimit,
    } as const
  }

  increaseVisualIndex() {
    if (this.#lastUsedIndexVisual - this.#lastUsedIndex > this._gapLimit) return
    this.#lastUsedIndexVisual += 1
  }

  static fromJSON(data: AddressChainJSON, chainId: number) {
    const {gapLimit, blockSize, addresses, addressGenerator, lastUsedIndex, lastUsedIndexVirtual} = data
    const chain = new AddressChain(
      AddressGenerator.fromJSON(addressGenerator, chainId),
      blockSize,
      gapLimit,
      lastUsedIndex,
      lastUsedIndexVirtual,
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

  addSubscriberToNewAddresses(subscriber: (addresses: Addresses) => unknown) {
    this._subscriptions.push(subscriber)
  }

  _extendAddresses(newAddresses: Array<string>) {
    assert(_.intersection(this._addresses, newAddresses).length === 0, 'extendAddresses received an existing address')
    this._addresses = [...this._addresses, ...newAddresses]
    this._subscriptions.forEach((handler) => handler(newAddresses))
  }

  async _discoverNewBlock() {
    const addresses = this.addresses
    const start = this.size()
    const idxs = _.range(start, start + this._blockSize)

    const newAddresses = await this._addressGenerator.generate(idxs)

    if (this.addresses !== addresses) {
      logger.warn('AddressChain: discoverNewBlock concurrent modification to addresses')
    } else {
      this._extendAddresses(newAddresses)
    }
  }

  _getLastBlock() {
    this._selfCheck()
    const block = _.takeRight(this.addresses, this._blockSize)
    assert(block.length === this._blockSize, 'AddressChain::_getLastBlock(): block length')
    return block
  }

  async initialize() {
    if (this._isInitialized) return
    await this._discoverNewBlock()
    this._isInitialized = true
  }

  _selfCheck() {
    assert(this._isInitialized, 'AddressChain::_selfCheck(): isInitialized')
    assert(this._addresses.length % this._blockSize === 0, 'AddressChain::_selfCheck(): lengths')
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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const lastUsedIdx = used.length > 0 ? block.indexOf(_.last(used)!) : -1
    const lastUsedAddress = lastUsedIdx > 0 ? used[lastUsedIdx] : null
    const lastUsedRealIndex = lastUsedAddress != null ? this.addresses.indexOf(lastUsedAddress) : 0

    if (lastUsedRealIndex > this.#lastUsedIndex) this.#lastUsedIndex = lastUsedRealIndex
    if (lastUsedRealIndex > this.#lastUsedIndexVisual) this.#lastUsedIndexVisual = lastUsedRealIndex

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
    assert(this.isMyAddress(address), 'getIndexOfAddress:: is not my address')
    const idx = this.addressToIdxMap[address]
    return idx
  }

  getBlocks() {
    return _.chunk(this.addresses, this._blockSize)
  }
}

export const getBIP44Addresses = async (
  accountPubKeyHex: string,
  role: number,
  indexes: Array<number>,
): Promise<Array<string>> => {
  const protocolMagic = 764824073
  const addresses: Array<string> = []

  const withRole = await CardanoMobile.Bip32PublicKey.fromBytes(Buffer.from(accountPubKeyHex, 'hex')).then((pubKey) =>
    pubKey.derive(role),
  )

  for (const index of indexes) {
    const byronAddrBs58 = await withRole
      .derive(index)
      .then((withIndex) => CardanoMobile.ByronAddress.icarusFromKey(withIndex, protocolMagic))
      .then((addr) => addr.toBase58())
    addresses.push(byronAddrBs58)
  }

  return addresses
}

const storageKey = 'addresses'
const initialAddressesPerRequest = 50
export const accountManagerMaker = async ({
  chainId,
  implementation,
  addressesPerRequest = initialAddressesPerRequest,
  accountPubKeyHex,
  storage,
  baseApiUrl,
}: {
  chainId: number
  addressesPerRequest?: number
  implementation: Wallet.Implementation
  accountPubKeyHex: string
  storage: App.Storage
  baseApiUrl: string
}): Promise<AccountManager> => {
  const config = cardanoConfig.implementations[implementation]

  const addresses = await storage.getItem(storageKey, parseAccountJSON)

  const internalChain =
    addresses?.internalChain != null
      ? AddressChain.fromJSON(addresses.internalChain, chainId)
      : new AddressChain(
          new AddressGenerator(accountPubKeyHex, config.derivations.base.roles.internal, implementation, chainId),
          addressesPerRequest,
          derivationConfig.gapLimit,
        )

  const externalChain =
    addresses?.externalChain != null
      ? AddressChain.fromJSON(addresses.externalChain, chainId)
      : new AddressChain(
          new AddressGenerator(accountPubKeyHex, config.derivations.base.roles.external, implementation, chainId),
          addressesPerRequest,
          derivationConfig.gapLimit,
        )

  await internalChain.initialize()
  await externalChain.initialize()

  const save = async () => {
    await storage.setItem(storageKey, {
      internalChain: internalChain.toJSON(),
      externalChain: externalChain.toJSON(),
    })
  }

  const clear = async () => {
    await storage.removeItem(storageKey)
  }

  // TODO: API should be injected
  const discoverAddresses = async () => {
    const addressesBeforeRequest = internalChain.addresses.length + externalChain.addresses.length
    const filterFn = (addrs: Addresses) => legacyApi.filterUsedAddresses(addrs, baseApiUrl)
    await Promise.all([internalChain.sync(filterFn), externalChain.sync(filterFn)])
    const addressesAfterRequest = internalChain.addresses.length + externalChain.addresses.length
    const hasAddedNewAddress = addressesAfterRequest !== addressesBeforeRequest
    if (hasAddedNewAddress) await save()
  }

  const getAddressesInBlocks = (rewardAddressHex: string) => {
    const internalAddresses = internalChain.getBlocks()
    const externalAddresses = externalChain.getBlocks()

    if (rewardAddressHex != '') return [...internalAddresses, ...externalAddresses, [rewardAddressHex]]

    return [...internalAddresses, ...externalAddresses]
  }

  return {
    internalChain,
    externalChain,

    discoverAddresses,
    getAddressesInBlocks,

    save,
    clear,
  }
}

export type AccountManager = {
  internalChain: AddressChain
  externalChain: AddressChain
  discoverAddresses: () => Promise<void>
  getAddressesInBlocks: (rewardAddressHex: string) => string[][]
  save: () => Promise<void>
  clear: () => Promise<void>
}

type AccountJSON = {
  internalChain: AddressChainJSON
  externalChain: AddressChainJSON
}

export type AddressChainJSON = {
  gapLimit: number
  blockSize: number
  lastUsedIndex: number
  lastUsedIndexVirtual: number
  addresses: Addresses
  addressGenerator: AddressGeneratorJSON
}

export type AddressGeneratorJSON = {
  accountPubKeyHex: string
  implementation: Wallet.Implementation
  role: number
}

type AsyncAddressFilter = (addresses: Array<string>) => Promise<Array<string>>

export type Addresses = Array<string>

const parseAccountJSON = (data: unknown) => {
  const parsed = parseSafe(data)
  return isAccountJSON(parsed) ? parsed : undefined
}

const isAccountJSON = (data: unknown): data is AccountJSON => {
  const candidate = data as AccountJSON
  return !!candidate && typeof candidate === 'object' && keys.every((key) => key in candidate)
}

const keys: Array<keyof AccountJSON> = ['internalChain', 'externalChain']
