import {WasmContract} from '@emurgo/yoroi-lib-core'

import {Address, BaseAddress, RewardAddress} from '.'

export type CardanoKeyHashes = {
  spending: string | null
  staking: string | null
}

/**
 * @description Get the spending keyHash, resolves null for PointerAddress & EnterpriseAddress missing yoroi-lib impl
 *
 * @param {WasmContract.Address} address wasm address
 * @returns Promise<WasmContract.Ed25519KeyHash | undefined> null for legacy/other addresses and undefined for scriptHash
 */
async function getSpendingKeyHash(
  address: WasmContract.Address,
): Promise<WasmContract.Ed25519KeyHash | null | undefined> {
  const baseAddr = await BaseAddress.fromAddress(address)
  if (baseAddr.hasValue()) return baseAddr.paymentCred().then((paymentCred) => paymentCred.toKeyhash())

  const rewardAddr = await RewardAddress.fromAddress(address)
  if (rewardAddr.hasValue()) return rewardAddr.paymentCred().then((paymentCred) => paymentCred.toKeyhash())

  return null
}

/**
 * @description Get the staking keyHash of a BaseAddress
 *
 * @param {WasmContract.Address} address
 * @returns {Promise<WasmContract.Ed25519KeyHash | null | undefined>} null for legacy/other addresses and undefined for scriptHash
 */
async function getStakingKeyHash(
  address: WasmContract.Address,
): Promise<WasmContract.Ed25519KeyHash | null | undefined> {
  const baseAddr = await BaseAddress.fromAddress(address)
  if (baseAddr.hasValue()) return baseAddr.stakeCred().then((paymentCred) => paymentCred.toKeyhash())

  return null
}

async function toHexKeyHash(keyHash: WasmContract.Ed25519KeyHash | null | undefined): Promise<string> {
  if (!keyHash) return ''
  if (!keyHash.hasValue()) return ''

  return keyHash.toBytes().then((bytes) => Buffer.from(bytes ?? '').toString('hex'))
}

/**
 * @description Try to resolve the spending and staking key hashes for a bech32 address
 *
 * @param {string} address expects to be a bech32
 * @returns {Promise<CardanoKeyHashes>}
 */
export async function getKeyHashes(address: string): Promise<CardanoKeyHashes> {
  const wasmAddress = await toWasmAddress(address)

  if (wasmAddress?.hasValue()) {
    const spending = await getSpendingKeyHash(wasmAddress).then(toHexKeyHash)
    const staking = await getStakingKeyHash(wasmAddress).then(toHexKeyHash)

    return {
      spending,
      staking,
    }
  }

  return {
    spending: null,
    staking: null,
  }
}

/**
 * @description Try to resolve bech32 to the wasm Address, ignores other than bech32 addresses
 *
 * @param {string} address expects to be a bech32
 * @returns {Promise<WasmContract.Address | null>} null when byron/jorgamndur (deprecated)
 * @example toWasmAddress("addr1q9ndnrwz52yeex4j04kggp0ul5632qmxqx22ugtukkytjysw86pdygc6zarl2kks6fvg8um447uvv679sfdtzkwf2kuq673wke")
 * @example toWasmAddress("stake1u948jr02falxxqphnv3g3rkd3mdzqmtqq3x0tjl39m7dqngqg0fxp")
 */
export async function toWasmAddress(address: string): Promise<WasmContract.Address | null> {
  return Address.fromBech32(address)
    .then((wasmAddress) => wasmAddress)
    .catch(() => null)
}
