/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import produce from 'immer'
import {get, set} from 'lodash'

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
  path && path.length
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

import {
  Address,
  AssetName,
  Assets,
  BaseAddress, // TODO(v-almonacid): these bindings are not yet implemented
  // PointerAddress,
  // EnterpriseAddress,
  BigNum,
  Bip32PrivateKey,
  Bip32PublicKey,
  ByronAddress,
  Ed25519KeyHash,
  MultiAsset,
  RewardAddress,
  ScriptHash,
  StakeCredential,
  Value,
} from '@emurgo/react-native-haskell-shelley'
import {BigNumber} from 'bignumber.js'

// $FlowExpectedError
import {DefaultTokenEntry, MultiToken} from '../yoroi-wallets'
import {CONFIG} from './config'
import type {BaseAsset} from './HistoryTransaction'
import {getNetworkConfigById} from './networks'
import type {NetworkId} from './types'
import type {RawUtxo} from './types'
import type {Addressing} from './types'
const PRIMARY_ASSET_CONSTANTS = CONFIG.PRIMARY_ASSET_CONSTANTS
export const getCardanoAddrKeyHash = async (
  addr: Address,
): // null -> legacy address (no key hash)
// undefined -> script hash instead of key hash
Promise<Ed25519KeyHash | null | void> => {
  {
    const byronAddr = await ByronAddress.from_address(addr)
    if (byronAddr) return null
  }
  {
    const baseAddr = await BaseAddress.from_address(addr)
    if (baseAddr) return await (await baseAddr.payment_cred()).to_keyhash()
  }
  // {
  //   const ptrAddr = await PointerAddress.from_address(addr)
  //   if (ptrAddr) return ptrAddr.payment_cred().to_keyhash()
  // }
  // {
  //   const enterpriseAddr = await EnterpriseAddress.from_address(addr)
  //   if (enterpriseAddr) return enterpriseAddr.payment_cred().to_keyhash()
  // }
  {
    const rewardAddr = await RewardAddress.from_address(addr)
    if (rewardAddr) return await (await rewardAddr.payment_cred()).to_keyhash()
  }
  throw new Error('getCardanoAddrKeyHash:: unknown address type')
}
export const normalizeToAddress = async (addr: string) => {
  // in Shelley, addresses can be base16, bech32 or base58
  // in this function, we try parsing in all encodings possible
  // 1) Try converting from base58
  try {
    if (await ByronAddress.is_valid(addr)) {
      return await (await ByronAddress.from_base58(addr)).to_address()
    }
  } catch (_e) {}

  // eslint-disable-line no-empty
  // 2) If already base16, simply return
  try {
    return await Address.from_bytes(Buffer.from(addr, 'hex'))
  } catch (_e) {}

  // eslint-disable-line no-empty
  // 3) Try converting from bech32
  try {
    return await Address.from_bech32(addr)
  } catch (_e) {}

  // eslint-disable-line no-empty
  return undefined
}
export const byronAddrToHex = async (base58Addr: string): Promise<string> => {
  return Buffer.from(await ((await ByronAddress.from_base58(base58Addr)) as any).to_bytes()).toString('hex')
}
// need to format shelley addresses as base16 but only legacy addresses as base58
export const toHexOrBase58 = async (address: Address): Promise<string> => {
  const asByron = await ByronAddress.from_address(address)

  if (asByron == null) {
    return Buffer.from(await address.to_bytes()).toString('hex')
  }

  return await asByron.to_base58()
}
export const derivePublicByAddressing = async (request: {
  addressing: Addressing['addressing']
  startingFrom: {
    key: Bip32PublicKey
    level: number
  }
}): Promise<Bip32PublicKey> => {
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
    key: Bip32PrivateKey
    level: number
  }
}): Promise<Bip32PrivateKey> => {
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
export const verifyFromBip44Root = (request: Addressing['addressing']): void => {
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
  const accountPubKeyPtr = await Bip32PublicKey.from_bytes(Buffer.from(accountPubKeyHex, 'hex'))
  const stakingKey = await (
    await (
      await accountPubKeyPtr.derive(CONFIG.NUMBERS.CHAIN_DERIVATIONS.CHIMERIC_ACCOUNT)
    ).derive(CONFIG.NUMBERS.STAKING_KEY_INDEX)
  ).to_raw_key()
  const credential = await StakeCredential.from_keyhash(await stakingKey.hash())
  let chainNetworkId = CONFIG.NETWORKS.HASKELL_SHELLEY.CHAIN_NETWORK_ID
  const config: any = getNetworkConfigById(networkId)

  if (config.CHAIN_NETWORK_ID != null) {
    chainNetworkId = config.CHAIN_NETWORK_ID
  }

  const rewardAddr = await RewardAddress.new(parseInt(chainNetworkId, 10), credential)
  const rewardAddrAsAddr = await rewardAddr.to_address()
  return Buffer.from((await rewardAddrAsAddr.to_bytes()) as any, 'hex').toString('hex')
}

/**
 * Multi-asset related
 */
export const cardanoAssetToIdentifier = async (policyId: ScriptHash, name: AssetName): Promise<string> => {
  // note: possible for name to be empty causing a trailing hyphen
  return `${Buffer.from(await policyId.to_bytes()).toString('hex')}.${Buffer.from(await name.name()).toString('hex')}`
}
export const identifierToCardanoAsset = async (
  identifier: string,
): Promise<{
  policyId: ScriptHash
  name: AssetName
}> => {
  // recall: 'a.'.split() gives ['a', ''] as desired
  const parts = identifier.split('.')
  return {
    policyId: await ScriptHash.from_bytes(Buffer.from(parts[0], 'hex')),
    name: await AssetName.new(Buffer.from(parts[1], 'hex')),
  }
}
export const parseTokenList = async (
  assets: void | MultiAsset,
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
        amount: await amount.to_str(),
        assetId: await cardanoAssetToIdentifier(policyId, assetName),
        policyId: Buffer.from(await policyId.to_bytes()).toString('hex'),
        name: Buffer.from(await assetName.name()).toString('hex'),
      })
    }
  }

  return result
}
export const cardanoValueFromMultiToken = async (tokens: MultiToken): Promise<Value> => {
  const value = await Value.new(await BigNum.from_str(tokens.getDefaultEntry().amount.toString()))
  // recall: primary asset counts towards size
  if (tokens.size() === 1) return value
  const assets = await MultiAsset.new()

  for (const entry of tokens.nonDefaultEntries()) {
    const {policyId, name} = await identifierToCardanoAsset(entry.identifier)
    const policyContent = (await assets.get(policyId)) ?? (await Assets.new())
    await policyContent.insert(name, await BigNum.from_str(entry.amount.toString()))
    // recall: we always have to insert since WASM returns copies of objects
    await assets.insert(policyId, policyContent)
  }

  if ((await assets.len()) > 0) {
    await value.set_multiasset(assets)
  }

  return value
}
export const multiTokenFromCardanoValue = async (value: Value, defaults: DefaultTokenEntry): Promise<MultiToken> => {
  const multiToken = new MultiToken([], defaults)
  multiToken.add({
    amount: new BigNumber(await (await value.coin()).to_str()),
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
export const cardanoValueFromRemoteFormat = async (utxo: RawUtxo): Promise<Value> => {
  const value = await Value.new(await BigNum.from_str(utxo.amount))
  if (utxo.assets.length === 0) return value
  const assets = await MultiAsset.new()

  for (const entry of utxo.assets) {
    const {policyId, name} = await identifierToCardanoAsset(entry.assetId)
    const policyContent = (await assets.get(policyId)) ?? (await Assets.new())
    await policyContent.insert(name, await BigNum.from_str(entry.amount))
    // recall: we always have to insert since WASM returns copies of objects
    await assets.insert(policyId, policyContent)
  }

  if ((await assets.len()) > 0) {
    await value.set_multiasset(assets)
  }

  return value
}
// matches RawUtxo and a tx input/output
type RemoteValue = {
  readonly amount: string
  readonly assets?: ReadonlyArray<BaseAsset>
}
export const multiTokenFromRemote = (remoteValue: RemoteValue, networkId: number): MultiToken => {
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

import {delay} from '../../legacy/utils/promise'

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
    // $FlowFixMe
    fn(arg)(...rest)

// Turns handler working like this: handler = (props, ...args) => result
// Into  handler working like this: handler = (props) => (...args) => result
const uncurry =
  (fn) =>
  (arg) =>
  (...rest) =>
    // $FlowFixMe
    fn(arg, ...rest)

// For use in withHandlers.
// Warning: This keeps one concurrent instance
// *per component declaration* (e.g. multiple
// component instances share the limit)
export const ignoreConcurrentAsyncHandler = <Props, T, R>(
  handler: (props: Props) => (t: T) => Promise<R>,
  additionalDelay?: number,
): ((props: Props) => (t: T) => Promise<R | void>) => {
  // $FlowFixMe
  return uncurry(ignoreConcurrentAsync(curry(handler), additionalDelay))
}
