import {CardanoMobile} from '@yoroi/cardano-wallet'
import {isHex} from '@yoroi/common'
import {StakingStatus} from '@yoroi/staking'
import {CardanoAddressedUtxo} from '@yoroi/tx'

import {sortBy} from 'lodash'

import type {TimestampedCertMeta} from './transactionManager/transactionManager'
import {CardanoTypes} from './types'

const addrContainsAccountKey = async (
  address: string,
  targetAccountKey: CardanoTypes.StakeCredential,
  acceptTypeMismatch: boolean,
) => {
  type CslAddress = ReturnType<
    ReturnType<typeof CardanoMobile.ByronAddress.fromBase58>['toAddress']
  >
  let wasmAddr: CslAddress
  if (CardanoMobile.ByronAddress.isValid(address)) {
    const byronAddr = CardanoMobile.ByronAddress.fromBase58(address)
    wasmAddr = byronAddr.toAddress()
  } else {
    const isHexAddr = isHex(address)
    wasmAddr = isHexAddr
      ? CardanoMobile.Address.fromHex(address)
      : CardanoMobile.Address.fromBech32(address)
  }

  if (wasmAddr == null || wasmAddr.isMalformed()) {
    throw new Error(`addrContainsAccountKey: invalid address ${address}`)
  }

  const accountKeyString = Buffer.from(targetAccountKey.toBytes()).toString(
    'hex',
  )
  const asBase = CardanoMobile.BaseAddress.fromAddress(wasmAddr)

  if (asBase != null) {
    if (
      Buffer.from(asBase.stakeCred().toBytes()).toString('hex') ===
      accountKeyString
    ) {
      return true
    }
  }

  return acceptTypeMismatch
}

export const filterAddressesByStakingKey = async (
  stakingKey: CardanoTypes.StakeCredential,
  utxos: ReadonlyArray<CardanoAddressedUtxo>,
  acceptTypeMismatch: boolean,
) => {
  const result: Array<CardanoAddressedUtxo> = []

  for (const utxo of utxos) {
    if (
      await addrContainsAccountKey(
        utxo.receiver,
        stakingKey,
        acceptTypeMismatch,
      )
    ) {
      result.push(utxo)
    }
  }

  return result
}

export const getDelegationStatus = (
  rewardAddress: string,
  txCertificatesForKey: Record<string, TimestampedCertMeta> = {},
): StakingStatus => {
  const sortedCerts = sortBy(
    txCertificatesForKey,
    (txCerts) => txCerts.submittedAt,
  )
  let status: StakingStatus = {isRegistered: false}

  for (const certData of Object.values(sortedCerts)) {
    const certificates = certData.certificates

    for (const cert of certificates) {
      if (!('rewardAddress' in cert) || cert.rewardAddress !== rewardAddress)
        continue

      if (cert.kind === 'StakeDelegation') {
        status = {
          poolKeyHash: cert.poolKeyHash,
          isRegistered: true,
        }
      } else if (cert.kind === 'StakeRegistration') {
        status = {isRegistered: true}
      } else if (cert.kind === 'StakeDeregistration') {
        status = {isRegistered: false}
      }
    }
  }

  return status
}

export const isValidPoolIdOrHash = (poolIdOrHash: string): boolean => {
  const [validPoolId, validPoolHash] = [
    isValidPoolId(poolIdOrHash),
    isValidPoolHash(poolIdOrHash),
  ]
  return validPoolId || validPoolHash
}

export const normalizeToPoolHash = (poolIdOrHash: string): string => {
  if (isValidPoolHash(poolIdOrHash)) return poolIdOrHash
  if (isValidPoolId(poolIdOrHash)) return getPoolHash(poolIdOrHash)
  throw new Error('Invalid pool ID or hash')
}

const getPoolHash = (poolId: string): string => {
  const hash = CardanoMobile.Ed25519KeyHash.fromBech32(poolId)
  return hash.toHex()
}

const isValidPoolId = (poolId: string): boolean => {
  if (poolId.length === 0) return false
  try {
    getPoolHash(poolId)
    return true
  } catch (e) {
    return false
  }
}

export const getPoolBech32Id = (poolId: string) => {
  const keyHash = CardanoMobile.Ed25519KeyHash.fromHex(poolId)
  if (!keyHash) {
    throw new Error(
      `getPoolBech32Id: Failed to create key hash from poolId: ${poolId}`,
    )
  }
  const bech32 = keyHash.toBech32('pool')
  if (!bech32) {
    throw new Error(
      `getPoolBech32Id: Failed to convert key hash to bech32 for poolId: ${poolId}`,
    )
  }
  return bech32
}

const isValidPoolHash = (poolHash: string): boolean => {
  if (poolHash.length === 0) return false
  try {
    CardanoMobile.Ed25519KeyHash.fromBytes(Buffer.from(poolHash, 'hex'))
    return true
  } catch (e) {
    return false
  }
}
