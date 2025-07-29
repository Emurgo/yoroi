import {CardanoMobile} from '~/wallets/wallets'
import {CardanoTypes} from '../types'

/**
 * @description Get the spending keyHash, resolves null for PointerAddress & EnterpriseAddress missing yoroi-lib impl
 *
 * @param {Address} address wasm address
 * @returns Promise<CardanoTypes.Ed25519KeyHash | undefined> null for legacy/other addresses and undefined for scriptHash
 */
function getSpendingKeyHash(
  address: CardanoTypes.Address,
): CardanoTypes.Ed25519KeyHash | null | undefined {
  const baseAddr = CardanoMobile.BaseAddress.fromAddress(address)
  if (baseAddr?.hasValue()) return baseAddr.paymentCred().toKeyhash()

  const rewardAddr = CardanoMobile.RewardAddress.fromAddress(address)
  if (rewardAddr?.hasValue()) return rewardAddr.paymentCred().toKeyhash()

  return null
}

/**
 * @description Get the staking keyHash of a BaseAddress
 *
 * @param {Address} address
 * @returns {Promise<CardanoTypes.Ed25519KeyHash | null | undefined>} null for legacy/other addresses and undefined for scriptHash
 */
function getStakingKeyHash(
  address: CardanoTypes.Address,
): CardanoTypes.Ed25519KeyHash | null | undefined {
  const baseAddr = CardanoMobile.BaseAddress.fromAddress(address)
  if (baseAddr?.hasValue()) return baseAddr.stakeCred().toKeyhash()

  return null
}

function toHexKeyHash(
  keyHash: CardanoTypes.Ed25519KeyHash | null | undefined,
): string {
  if (!keyHash) return ''
  if (!keyHash.hasValue()) return ''

  return Buffer.from(keyHash.toBytes() ?? '').toString('hex')
}

/**
 * @description Try to resolve the spending key hashes for a bech32 address
 *
 * @param {string} address expects to be a bech32
 * @returns {Promise<string | null>} returns a hex string with the key hash or null if can't extract
 */
export function getStakingKey(address: string) {
  const wasmAddress = toWasmAddress(address)
  if (wasmAddress?.hasValue())
    return toHexKeyHash(getStakingKeyHash(wasmAddress))
  return null
}

/**
 * @description Try to resolve the staking key hashes for a bech32 address
 *
 * @param {string} address expects to be a bech32
 * @returns {Promise<string | null>} returns a hex string with the key hash or null if can't extract
 */
export function getSpendingKey(address: string) {
  const wasmAddress = toWasmAddress(address)
  if (wasmAddress?.hasValue())
    return toHexKeyHash(getSpendingKeyHash(wasmAddress))
  return null
}

/**
 * @description Try to resolve bech32 to the wasm Address, ignores other than bech32 addresses
 *
 * @param {string} address expects to be a bech32
 * @returns {Promise<CardanoTypes.Address | null>} null when byron/jorgamndur (deprecated)
 * @example toWasmAddress("addr1q9ndnrwz52yeex4j04kggp0ul5632qmxqx22ugtukkytjysw86pdygc6zarl2kks6fvg8um447uvv679sfdtzkwf2kuq673wke")
 * @example toWasmAddress("stake1u948jr02falxxqphnv3g3rkd3mdzqmtqq3x0tjl39m7dqngqg0fxp")
 */
export function toWasmAddress(address: string): CardanoTypes.Address | null {
  try {
    return CardanoMobile.Address.fromBech32(address)
  } catch (e) {
    return null
  }
}
