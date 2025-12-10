import {cardanoConfig, derivationConfig} from '@yoroi/blockchains'
import {getLogger, parseSafe} from '@yoroi/common'
import {
  Address,
  App,
  Branded,
  KeyHash,
  PublicKeyHex,
  Wallet,
} from '@yoroi/types'

import _ from 'lodash'
import {defaultMemoize} from 'reselect'

import * as legacyApi from '../api/api'
import {CardanoTypes} from '../types'
import {CardanoMobile} from '../wrappedCsl'

export type AddressGenerator = {
  readonly accountPubKeyHex: string
  readonly role: number
  readonly implementation: Wallet.Implementation
  readonly chainId: number
  getRewardAddressHex(): string | null
  generate(indexes: Array<number>): Address[]
  toJSON(): AddressGeneratorJSON
}

export function createAddressGenerator(
  accountPubKeyHex: string,
  role: number,
  implementation: Wallet.Implementation,
  chainId: number,
): AddressGenerator {
  let cachedAccountPubKeyPtr: CardanoTypes.Bip32PublicKey | undefined
  let cachedRewardAddressHex: string | undefined

  const getAccountPubKeyPtr = () => {
    if (cachedAccountPubKeyPtr == null) {
      cachedAccountPubKeyPtr = CardanoMobile.Bip32PublicKey.fromBytes(
        Buffer.from(accountPubKeyHex, 'hex'),
      )
    }
    return cachedAccountPubKeyPtr
  }

  return {
    accountPubKeyHex,
    role,
    implementation,
    chainId,

    getRewardAddressHex() {
      const config = cardanoConfig.implementations[implementation]
      if (!config.features.staking) return null
      const staking = config.features.staking

      if (cachedRewardAddressHex != null) return cachedRewardAddressHex

      const accountPubKeyPtr = getAccountPubKeyPtr()
      const stakingRawKey = accountPubKeyPtr
        .derive(staking.derivation.role)
        .derive(staking.derivation.index)
        .toRawKey()
      const stakingKeyHash = stakingRawKey.hash()

      const credential = CardanoMobile.Credential.fromKeyhash(stakingKeyHash)
      const rewardAddr = CardanoMobile.RewardAddress.new(chainId, credential)
      const rewardAddrAsAddr = rewardAddr.toAddress()
      const rewardAddrBytes = rewardAddrAsAddr.toBytes()

      cachedRewardAddressHex = Buffer.from(rewardAddrBytes).toString('hex')
      return cachedRewardAddressHex
    },

    generate(indexes: Array<number>): Address[] {
      const config = cardanoConfig.implementations[implementation]

      if (!config.features.staking) {
        return getBIP44Addresses(accountPubKeyHex, role, indexes)
      } else {
        const accountPubKeyPtr = getAccountPubKeyPtr()
        const staking = config.features.staking
        const stakingCredential = CardanoMobile.Credential.fromKeyhash(
          accountPubKeyPtr
            .derive(staking.derivation.role)
            .derive(staking.derivation.index)
            .toRawKey()
            .hash(),
        )

        const withType = accountPubKeyPtr.derive(role)
        return indexes.map((index) => {
          const addressCredential = CardanoMobile.Credential.fromKeyhash(
            withType.derive(index).toRawKey().hash(),
          )

          const baseAddressBech32 = CardanoMobile.BaseAddress.new(
            chainId,
            addressCredential,
            stakingCredential,
          )
            .toAddress()
            .toBech32(undefined)

          return Branded.asAddress(baseAddressBech32)
        })
      }
    },

    toJSON(): AddressGeneratorJSON {
      return {
        accountPubKeyHex,
        implementation,
        role,
      }
    },
  }
}

export function addressGeneratorFromJSON(
  data: AddressGeneratorJSON,
  chainId: number,
): AddressGenerator {
  const {role, implementation, accountPubKeyHex} = data
  return createAddressGenerator(accountPubKeyHex, role, implementation, chainId)
}

const _addressToIdxSelector = (addresses: Address[]) =>
  _.fromPairs(addresses.map((addr, i) => [addr, i]))

export type AddressChain = {
  readonly addressGenerator: AddressGenerator
  readonly blockSize: number
  readonly gapLimit: number
  readonly addresses: Address[]
  readonly info: {
    lastUsedIndex: number
    lastUsedIndexVisual: number
    canIncrease: boolean
  }
  readonly addressToIdxMap: Record<string, number>
  toJSON(): AddressChainJSON
  increaseVisualIndex(): void
  addSubscriberToNewAddresses(
    subscriber: (addresses: Address[]) => unknown,
  ): void
  initialize(): void
  sync(filterFn: AsyncAddressFilter): Promise<void>
  size(): number
  isMyAddress(address: Address | string): boolean
  getIndexOfAddress(address: Address | string): number
  getBlocks(): Address[][]
}

export function createAddressChain(
  addressGenerator: AddressGenerator,
  blockSize = 50,
  gapLimit = 40,
  lastUsedIndex = 0,
  lastUsedIndexVisual = lastUsedIndex,
  initialAddresses?: Address[],
): AddressChain {
  let addresses: Address[] = initialAddresses ?? []
  let isInitialized = initialAddresses != null && initialAddresses.length > 0
  const subscriptions: Array<(addresses: Address[]) => unknown> = []
  const addressToIdxSelector = defaultMemoize(_addressToIdxSelector)
  let currentLastUsedIndex = lastUsedIndex
  let currentLastUsedIndexVisual = lastUsedIndexVisual

  const extendAddresses = (newAddresses: Address[]) => {
    addresses = [...addresses, ...newAddresses]
    subscriptions.forEach((handler) => handler(newAddresses))
  }

  const discoverNewBlock = () => {
    const currentAddresses = addresses
    const start = addresses.length
    const idxs = _.range(start, start + blockSize)

    const newAddresses = addressGenerator.generate(idxs)

    if (addresses !== currentAddresses) {
      getLogger().warn(
        'AddressChain: discoverNewBlock concurrent modification to addresses',
      )
    } else {
      extendAddresses(newAddresses)
    }
  }

  const getLastBlock = () => {
    return _.takeRight(addresses, blockSize)
  }

  return {
    addressGenerator,
    blockSize,
    gapLimit,
    get addresses() {
      return addresses
    },
    get info() {
      return {
        lastUsedIndex: currentLastUsedIndex,
        lastUsedIndexVisual: currentLastUsedIndexVisual,
        canIncrease:
          currentLastUsedIndexVisual - currentLastUsedIndex < gapLimit,
      } as const
    },
    get addressToIdxMap() {
      return addressToIdxSelector(addresses)
    },

    toJSON(): AddressChainJSON {
      return {
        gapLimit,
        blockSize,
        addresses: addresses.map((addr) => addr as string),
        lastUsedIndex: currentLastUsedIndex,
        lastUsedIndexVirtual: currentLastUsedIndexVisual,
        addressGenerator: addressGenerator.toJSON(),
      }
    },

    increaseVisualIndex() {
      if (currentLastUsedIndexVisual - currentLastUsedIndex > gapLimit) return
      currentLastUsedIndexVisual += 1
    },

    addSubscriberToNewAddresses(subscriber: (addresses: Address[]) => unknown) {
      subscriptions.push(subscriber)
    },

    initialize() {
      if (isInitialized) return
      discoverNewBlock()
      isInitialized = true
    },

    async sync(filterFn: AsyncAddressFilter) {
      let keepSyncing = true
      while (keepSyncing) {
        const block = getLastBlock()
        const used = await filterFn(block)

        const lastUsedIdx = used.length > 0 ? block.indexOf(_.last(used)!) : -1
        const lastUsedAddress = lastUsedIdx > 0 ? used[lastUsedIdx] : null
        const lastUsedRealIndex =
          lastUsedAddress != null ? addresses.indexOf(lastUsedAddress) : 0

        if (lastUsedRealIndex > currentLastUsedIndex)
          currentLastUsedIndex = lastUsedRealIndex
        if (lastUsedRealIndex > currentLastUsedIndexVisual)
          currentLastUsedIndexVisual = lastUsedRealIndex

        const needsNewBlock = lastUsedIdx + gapLimit >= blockSize

        if (needsNewBlock) {
          discoverNewBlock()
          keepSyncing = true
        } else {
          keepSyncing = false
        }
      }
    },

    size() {
      return addresses.length
    },

    isMyAddress(address: Address | string) {
      const addr =
        typeof address === 'string' ? Branded.asAddress(address) : address
      return addressToIdxSelector(addresses)[addr] != null
    },

    getIndexOfAddress(address: Address | string) {
      const addr =
        typeof address === 'string' ? Branded.asAddress(address) : address
      const idx = addressToIdxSelector(addresses)[addr]
      return idx ?? -1
    },

    getBlocks() {
      return _.chunk(addresses, blockSize)
    },
  }
}

export function addressChainFromJSON(
  data: AddressChainJSON,
  chainId: number,
): AddressChain {
  const {
    gapLimit,
    blockSize,
    addresses: addressStrings,
    addressGenerator,
    lastUsedIndex,
    lastUsedIndexVirtual,
  } = data
  // Convert string[] from JSON to Address[]
  const addressArray = addressStrings.map((addr) => Branded.asAddress(addr))
  const chain = createAddressChain(
    addressGeneratorFromJSON(addressGenerator, chainId),
    blockSize,
    gapLimit,
    lastUsedIndex,
    lastUsedIndexVirtual,
    addressArray, // Pass initial addresses
  )
  // Mark as initialized since we have addresses from JSON
  chain.initialize()
  return chain
}

// Keep static method for backward compatibility
export const AddressChain = {
  fromJSON: addressChainFromJSON,
}

const getBIP44Addresses = (
  accountPubKeyHex: string,
  role: number,
  indexes: Array<number>,
): Address[] => {
  const protocolMagic = 764824073
  const addresses: Address[] = []

  const withRole = CardanoMobile.Bip32PublicKey.fromBytes(
    Buffer.from(accountPubKeyHex, 'hex'),
  ).derive(role)

  for (const index of indexes) {
    const byronAddrBs58 = CardanoMobile.ByronAddress.icarusFromKey(
      withRole.derive(index),
      protocolMagic,
    ).toBase58()
    addresses.push(Branded.asAddress(byronAddrBs58))
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
  walletContext,
}: {
  chainId: number
  addressesPerRequest?: number
  implementation: Wallet.Implementation
  accountPubKeyHex: string
  storage: App.Storage
  baseApiUrl: string
  walletContext?: {
    walletId: string
    publicKeyHex?: PublicKeyHex
    accountPubKeyHex?: PublicKeyHex
    paymentKeyHashes: KeyHash[]
    rewardAddresses: Address[]
  }
}): Promise<AccountManager> => {
  const config = cardanoConfig.implementations[implementation]

  const addresses = await storage.getItem(storageKey, parseAccountJSON)

  const internalChain =
    addresses?.internalChain != null
      ? AddressChain.fromJSON(addresses.internalChain, chainId)
      : createAddressChain(
          createAddressGenerator(
            accountPubKeyHex,
            config.derivations.base.roles.internal,
            implementation,
            chainId,
          ),
          addressesPerRequest,
          derivationConfig.gapLimit,
        )

  const externalChain =
    addresses?.externalChain != null
      ? AddressChain.fromJSON(addresses.externalChain, chainId)
      : createAddressChain(
          createAddressGenerator(
            accountPubKeyHex,
            config.derivations.base.roles.external,
            implementation,
            chainId,
          ),
          addressesPerRequest,
          derivationConfig.gapLimit,
        )

  internalChain.initialize()
  externalChain.initialize()

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
  const discoverAddresses = async (context?: {
    walletId: string
    publicKeyHex?: string
    accountPubKeyHex?: string
    paymentKeyHashes: string[]
    rewardAddresses: string[]
  }) => {
    const addressesBeforeRequest =
      internalChain.addresses.length + externalChain.addresses.length
    // Use provided context or fall back to the one from construction
    const effectiveContextRaw = context || walletContext
    const effectiveContext = effectiveContextRaw
      ? {
          ...effectiveContextRaw,
          publicKeyHex: effectiveContextRaw.publicKeyHex
            ? typeof effectiveContextRaw.publicKeyHex === 'string'
              ? Branded.asPublicKeyHex(effectiveContextRaw.publicKeyHex)
              : effectiveContextRaw.publicKeyHex
            : undefined,
          accountPubKeyHex: effectiveContextRaw.accountPubKeyHex
            ? typeof effectiveContextRaw.accountPubKeyHex === 'string'
              ? Branded.asPublicKeyHex(effectiveContextRaw.accountPubKeyHex)
              : effectiveContextRaw.accountPubKeyHex
            : undefined,
          paymentKeyHashes: effectiveContextRaw.paymentKeyHashes.map((hash) =>
            typeof hash === 'string' ? Branded.asKeyHash(hash) : hash,
          ),
          rewardAddresses: effectiveContextRaw.rewardAddresses.map((addr) =>
            typeof addr === 'string' ? Branded.asAddress(addr) : addr,
          ),
        }
      : undefined
    const filterFn = (addrs: Address[]) =>
      legacyApi.filterUsedAddresses(addrs, baseApiUrl, effectiveContext)
    await Promise.all([
      internalChain.sync(filterFn),
      externalChain.sync(filterFn),
    ])
    const addressesAfterRequest =
      internalChain.addresses.length + externalChain.addresses.length
    const hasAddedNewAddress = addressesAfterRequest !== addressesBeforeRequest
    if (hasAddedNewAddress) await save()
  }

  const getAddressesInBlocks = (rewardAddressHex: string) => {
    const internalAddresses = internalChain.getBlocks()
    const externalAddresses = externalChain.getBlocks()

    if (rewardAddressHex != '')
      return [
        ...internalAddresses,
        ...externalAddresses,
        [Branded.asAddress(rewardAddressHex)],
      ]

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
  discoverAddresses: (walletContext?: {
    walletId: string
    publicKeyHex?: string
    accountPubKeyHex?: string
    paymentKeyHashes: string[]
    rewardAddresses: string[]
  }) => Promise<void>
  getAddressesInBlocks: (rewardAddressHex: string) => Address[][]
  save: () => Promise<void>
  clear: () => Promise<void>
}

type AccountJSON = {
  internalChain: AddressChainJSON
  externalChain: AddressChainJSON
}

type AddressChainJSON = {
  gapLimit: number
  blockSize: number
  lastUsedIndex: number
  lastUsedIndexVirtual: number
  addresses: string[] // JSON stores as string[], converted to Address[] on deserialization
  addressGenerator: AddressGeneratorJSON
}

type AddressGeneratorJSON = {
  accountPubKeyHex: string
  implementation: Wallet.Implementation
  role: number
}

type AsyncAddressFilter = (addresses: Address[]) => Promise<Address[]>

const parseAccountJSON = (data: unknown) => {
  const parsed = parseSafe(data)
  return isAccountJSON(parsed) ? parsed : undefined
}

const isAccountJSON = (data: unknown): data is AccountJSON => {
  const candidate = data as AccountJSON
  return (
    !!candidate &&
    typeof candidate === 'object' &&
    keys.every((key) => key in candidate)
  )
}

const keys: Array<keyof AccountJSON> = ['internalChain', 'externalChain']
