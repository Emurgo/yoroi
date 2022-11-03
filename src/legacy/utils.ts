/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import produce from 'immer'
import {get, isEmpty, set} from 'lodash'

import {delay} from '../legacy/promise'
import type {Path, SegmentReducer} from './reduxTypes'

const normalizeObjBeforeMap = (data: Array<Record<string, any>> | Record<string, any>): Array<Record<string, any>> =>
  Array.isArray(data) ? data : [data]

// obj handled as a single element of an array
export const mappingFn = (data: Array<Record<string, any>> | Record<string, any>, mapByProp: number | string = 'id') =>
  normalizeObjBeforeMap(data).reduce((obj, current: {[key in string | number]?: string | number}) => {
    obj[current[mapByProp] as any] = current
    return obj
  }, {})
export const mapArrayToId = (data: Array<Record<string, any>>, id: number | string, mapByProp?: string) => {
  const dict = {}
  dict[id] = mappingFn(data, mapByProp)
  return dict
}
export const mapObjToId = (data: Record<string, any>, id: number | string) => {
  const dict = {}
  dict[id] = data
  return dict
}
export const immutableSet = <S extends {}>(obj: S, path: Path | null | undefined, value: S): S =>
  path && path.length > 0
    ? produce((obj): void => {
        set(obj, path, value)
      })(obj) || value
    : value

/*
 * Forward reducer transform to a particular state path.
 * If the last path element does not exist, reducer will get undefined
 * so that you can use reduce(state=initialState(), payload) => ...
 *
 * Does not create new state if the value did not change
 */
export function forwardReducerTo<S extends {}, T>(
  reducer: SegmentReducer<S, T | undefined>,
  path: Path | null | undefined,
): (state: S, payload: T | void) => S {
  return (state: S, payload: T | void) => {
    const value: S = path ? get(state, path) : state
    const newValue = reducer(value, payload)
    return newValue !== value ? immutableSet(state, path, newValue) : state
  }
}

import {BigNumber} from 'bignumber.js'

import {CardanoMobile, CardanoTypes, DefaultTokenEntry, MultiToken} from '../yoroi-wallets'
import type {BaseAsset, NetworkId} from '../yoroi-wallets/types/other'
import type {RawUtxo} from '../yoroi-wallets/types/other'
import type {Addressing} from '../yoroi-wallets/types/other'
import {CONFIG} from './config'
import {getNetworkConfigById} from './networks'

const PRIMARY_ASSET_CONSTANTS = CONFIG.PRIMARY_ASSET_CONSTANTS

export const normalizeToAddress = async (addr: string) => {
  // in Shelley, addresses can be base16, bech32 or base58
  // in this function, we try parsing in all encodings possible
  // 1) Try converting from base58
  try {
    if (await CardanoMobile.ByronAddress.isValid(addr)) {
      return await (await CardanoMobile.ByronAddress.fromBase58(addr)).toAddress()
    }
  } catch (_e) {}

  // eslint-disable-line no-empty
  // 2) If already base16, simply return
  try {
    return await CardanoMobile.Address.fromBytes(Buffer.from(addr, 'hex'))
  } catch (_e) {}

  // eslint-disable-line no-empty
  // 3) Try converting from bech32
  try {
    return await CardanoMobile.Address.fromBech32(addr)
  } catch (_e) {}

  // eslint-disable-line no-empty
  return undefined
}

export const byronAddrToHex = async (base58Addr: string) => {
  return Buffer.from(await ((await CardanoMobile.ByronAddress.fromBase58(base58Addr)) as any).toBytes()).toString('hex')
}
// need to format shelley addresses as base16 but only legacy addresses as base58

export const toHexOrBase58 = async (address: CardanoTypes.Address) => {
  const asByron = await CardanoMobile.ByronAddress.fromAddress(address)

  if (!asByron.hasValue()) {
    return Buffer.from(await address.toBytes()).toString('hex')
  }

  return asByron.toBase58()
}

export const derivePublicByAddressing = async (request: {
  addressing: Addressing['addressing']
  startingFrom: {
    key: CardanoTypes.Bip32PublicKey
    level: number
  }
}) => {
  if (request.startingFrom.level + 1 < request.addressing.startLevel) {
    throw new Error('derivePublicByAddressing: keyLevel < startLevel')
  }

  let derivedKey = request.startingFrom.key

  for (
    let i = request.startingFrom.level - request.addressing.startLevel + 1;
    i < request.addressing.path.length;
    i++
  ) {
    derivedKey = await derivedKey.derive(request.addressing.path[i])
  }

  return derivedKey
}
export const derivePrivateByAddressing = async (request: {
  addressing: Addressing['addressing']
  startingFrom: {
    key: CardanoTypes.Bip32PrivateKey
    level: number
  }
}) => {
  if (request.startingFrom.level + 1 < request.addressing.startLevel) {
    throw new Error('derivePrivateByAddressing: keyLevel < startLevel')
  }

  let derivedKey = request.startingFrom.key

  for (
    let i = request.startingFrom.level - request.addressing.startLevel + 1;
    i < request.addressing.path.length;
    i++
  ) {
    derivedKey = await derivedKey.derive(request.addressing.path[i])
  }

  return derivedKey
}

export const verifyFromBip44Root = (request: Addressing['addressing']) => {
  const accountPosition = request.startLevel

  if (accountPosition !== CONFIG.NUMBERS.BIP44_DERIVATION_LEVELS.PURPOSE) {
    throw new Error('verifyFromBip44Root: addressing does not start from root')
  }

  const lastLevelSpecified = request.startLevel + request.path.length - 1

  if (lastLevelSpecified !== CONFIG.NUMBERS.BIP44_DERIVATION_LEVELS.ADDRESS) {
    throw new Error('verifyFromBip44Root: incorrect addressing size')
  }
}

export const deriveRewardAddressHex = async (accountPubKeyHex: string, networkId: NetworkId): Promise<string> => {
  const accountPubKeyPtr = await CardanoMobile.Bip32PublicKey.fromBytes(Buffer.from(accountPubKeyHex, 'hex'))
  const stakingKey = await (
    await (
      await accountPubKeyPtr.derive(CONFIG.NUMBERS.CHAIN_DERIVATIONS.CHIMERIC_ACCOUNT)
    ).derive(CONFIG.NUMBERS.STAKING_KEY_INDEX)
  ).toRawKey()
  const credential = await CardanoMobile.StakeCredential.fromKeyhash(await stakingKey.hash())
  let chainNetworkId = CONFIG.NETWORKS.HASKELL_SHELLEY.CHAIN_NETWORK_ID
  const config: any = getNetworkConfigById(networkId)

  if (config.CHAIN_NETWORK_ID != null) {
    chainNetworkId = config.CHAIN_NETWORK_ID
  }

  const rewardAddr = await CardanoMobile.RewardAddress.new(parseInt(chainNetworkId, 10), credential)
  const rewardAddrAsAddr = await rewardAddr.toAddress()
  return Buffer.from((await rewardAddrAsAddr.toBytes()) as any, 'hex').toString('hex')
}

/**
 * Multi-asset related
 */
export const cardanoAssetToIdentifier = async (policyId: CardanoTypes.ScriptHash, name: CardanoTypes.AssetName) => {
  // note: possible for name to be empty causing a trailing hyphen
  return `${Buffer.from(await policyId.toBytes()).toString('hex')}.${Buffer.from(await name.name()).toString('hex')}`
}

export const identifierToCardanoAsset = async (
  identifier: string,
): Promise<{
  policyId: CardanoTypes.ScriptHash
  name: CardanoTypes.AssetName
}> => {
  // recall: 'a.'.split() gives ['a', ''] as desired
  const parts = identifier.split('.')
  return {
    policyId: await CardanoMobile.ScriptHash.fromBytes(Buffer.from(parts[0], 'hex')),
    name: await CardanoMobile.AssetName.new(Buffer.from(parts[1], 'hex')),
  }
}

export const parseTokenList = async (
  assets: void | CardanoTypes.MultiAsset,
): Promise<
  Array<{
    assetId: string
    policyId: string
    name: string
    amount: string
  }>
> => {
  if (assets == null) return []
  const result: Array<any> = []
  const hashes = await assets.keys()

  for (let i = 0; i < (await hashes.len()); i++) {
    const policyId = await hashes.get(i)
    const assetsForPolicy = await assets.get(policyId)
    if (assetsForPolicy == null) continue
    const policies = await assetsForPolicy.keys()

    for (let j = 0; j < (await policies.len()); j++) {
      const assetName = await policies.get(j)
      const amount = await assetsForPolicy.get(assetName)
      if (amount == null) continue
      result.push({
        amount: await amount.toStr(),
        assetId: await cardanoAssetToIdentifier(policyId, assetName),
        policyId: Buffer.from(await policyId.toBytes()).toString('hex'),
        name: Buffer.from(await assetName.name()).toString('hex'),
      })
    }
  }

  return result
}

export const cardanoValueFromMultiToken = async (tokens: MultiToken) => {
  const value = await CardanoMobile.Value.new(
    await CardanoMobile.BigNum.fromStr(tokens.getDefaultEntry().amount.toString()),
  )
  // recall: primary asset counts towards size
  if (tokens.size() === 1) return value
  const assets = await CardanoMobile.MultiAsset.new()

  for (const entry of tokens.nonDefaultEntries()) {
    const {policyId, name} = await identifierToCardanoAsset(entry.identifier)
    const asset = await assets.get(policyId)
    const policyContent = asset.hasValue() ? asset : await CardanoMobile.Assets.new()

    await policyContent.insert(name, await CardanoMobile.BigNum.fromStr(entry.amount.toString()))
    // recall: we always have to insert since WASM returns copies of objects
    await assets.insert(policyId, policyContent)
  }

  if ((await assets.len()) > 0) {
    await value.setMultiasset(assets)
  }

  return value
}

export const multiTokenFromCardanoValue = async (value: CardanoTypes.Value, defaults: DefaultTokenEntry) => {
  const multiToken = new MultiToken([], defaults)
  multiToken.add({
    amount: new BigNumber(await (await value.coin()).toStr()),
    identifier: defaults.defaultIdentifier,
    networkId: defaults.defaultNetworkId,
  })

  for (const token of await parseTokenList(await value.multiasset())) {
    multiToken.add({
      amount: new BigNumber(token.amount),
      identifier: token.assetId,
      networkId: defaults.defaultNetworkId,
    })
  }

  return multiToken
}

export const cardanoValueFromRemoteFormat = async (utxo: RawUtxo) => {
  const value = await CardanoMobile.Value.new(await CardanoMobile.BigNum.fromStr(utxo.amount))
  if (utxo.assets.length === 0) return value
  const assets = await CardanoMobile.MultiAsset.new()

  for (const entry of utxo.assets) {
    const {policyId, name} = await identifierToCardanoAsset(entry.assetId)
    let policyContent = await assets.get(policyId)
    policyContent = policyContent.hasValue() ? policyContent : await CardanoMobile.Assets.new()
    await policyContent.insert(name, await CardanoMobile.BigNum.fromStr(entry.amount))
    // recall: we always have to insert since WASM returns copies of objects
    await assets.insert(policyId, policyContent)
  }

  if ((await assets.len()) > 0) {
    await value.setMultiasset(assets)
  }

  return value
}
// matches RawUtxo and a tx input/output
type RemoteValue = {
  readonly amount: string
  readonly assets?: ReadonlyArray<BaseAsset>
}

export const multiTokenFromRemote = (remoteValue: RemoteValue, networkId: number) => {
  const result = new MultiToken([], {
    defaultNetworkId: networkId,
    defaultIdentifier: PRIMARY_ASSET_CONSTANTS.CARDANO,
  })
  result.add({
    identifier: PRIMARY_ASSET_CONSTANTS.CARDANO,
    amount: new BigNumber(remoteValue.amount),
    networkId,
  })

  if (remoteValue.assets != null) {
    for (const token of remoteValue.assets) {
      result.add({
        identifier: token.assetId,
        amount: new BigNumber(token.amount),
        networkId,
      })
    }
  }

  return result
}

// Ignores any concurrent calls to this function
// and instead instantly resolves with null
export const ignoreConcurrentAsync = <T, R>(
  handler: (t: T) => Promise<R>,
  additionalDelay?: number,
): ((t: T) => Promise<R | void>) => {
  let _inProgress = false

  return async (...args) => {
    if (_inProgress) return null
    _inProgress = true

    try {
      return (await handler(...args)) as any
    } finally {
      // note: don't await on purpose
      delay(additionalDelay || 0).then(() => {
        _inProgress = false
      })
    }
  }
}

// Turns handler working like this: handler = (props) => (...args) => result
// Into  handler working like this: handler = (props, ...args) => result
const curry =
  (fn) =>
  (arg, ...rest) =>
    fn(arg)(...rest)

// Turns handler working like this: handler = (props, ...args) => result
// Into  handler working like this: handler = (props) => (...args) => result
const uncurry =
  (fn) =>
  (arg) =>
  (...rest) =>
    fn(arg, ...rest)

// For use in withHandlers.
// Warning: This keeps one concurrent instance
// *per component declaration* (e.g. multiple
// component instances share the limit)
export const ignoreConcurrentAsyncHandler = <Props, T, R>(
  handler: (props: Props) => (t: T) => Promise<R>,
  additionalDelay?: number,
): ((props: Props) => (t: T) => Promise<R | void>) => {
  return uncurry(ignoreConcurrentAsync(curry(handler), additionalDelay))
}

/**
 * Wrapper function to lodash.isEmpty that
 * returns true if the string is empty.
 * The lodash.isEmpty function doesn't have the typescript's safeguard signature.
 * It will be fixed in this PR https://github.com/DefinitelyTyped/DefinitelyTyped/pull/60401
 *
 * @summary Returns true if the value is empty: length === 0, null or undefined, else false.
 *
 * @param value The string to inspect
 * @return {boolean} Returns true if the string is empty, else false.
 *
 * @example isEmptyString('') returns true
 * @example isEmptyString(' ') returns false
 * @example isEmptyString(null) returns true
 * @example isEmptyString(undefined) returns true
 */
export function isEmptyString(value: string | null | undefined): value is '' | null | undefined {
  return isEmpty(value)
}
