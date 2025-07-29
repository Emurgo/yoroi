import {CardanoAddressedUtxo} from '@emurgo/yoroi-lib'
import {normalizeToAddress} from '@emurgo/yoroi-lib/dist/internals/utils/addresses'
import {sortBy} from 'lodash'

import {StakingStatus} from '@yoroi/types'
import {CardanoMobile} from '../wallets'
import type {TimestampedCertMeta} from './transactionManager/transactionManager'
import {CardanoTypes} from './types'
import {wrappedCsl} from './wrappedCsl'

const addrContainsAccountKey = (
  address: string,
  targetAccountKey: CardanoTypes.StakeCredential,
  acceptTypeMismatch: boolean,
) => {
  const wasmAddr = normalizeToAddress(CardanoMobile, address)

  if (wasmAddr == null) {
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

export const filterAddressesByStakingKey = (
  stakingKey: CardanoTypes.StakeCredential,
  utxos: ReadonlyArray<CardanoAddressedUtxo>,
  acceptTypeMismatch: boolean,
) => {
  const result: Array<CardanoAddressedUtxo> = []

  for (const utxo of utxos) {
    if (addrContainsAccountKey(utxo.receiver, stakingKey, acceptTypeMismatch)) {
      result.push(utxo)
    }
  }

  return result
}

export const getDelegationStatus = (
  rewardAddress: string,
  txCertificatesForKey: Record<string, TimestampedCertMeta>,
): StakingStatus => {
  const sortedCerts: any = sortBy(
    txCertificatesForKey,
    (txCerts) => txCerts.submittedAt,
  )
  let status: StakingStatus = {isRegistered: false}

  for (const certData of Object.values(sortedCerts)) {
    const certificates = (certData as any).certificates

    for (const cert of certificates) {
      if (cert.rewardAddress !== rewardAddress) continue

      if (cert.kind === 'StakeDelegation') {
        status = {
          poolKeyHash: cert.poolKeyHash,
          isRegistered: true,
        }
      } else if (
        cert.kind === 'StakeRegistration' ||
        cert.kind === 'MoveInstantaneousRewardsCert'
      ) {
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
  const {csl, release} = wrappedCsl()
  try {
    const hash = csl.Ed25519KeyHash.fromBech32(poolId)
    return hash.toHex()
  } finally {
    release()
  }
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
  const {csl, release} = wrappedCsl()
  try {
    const keyHash = csl.Ed25519KeyHash.fromHex(poolId)
    return keyHash.toBech32('pool')
  } finally {
    release()
  }
}

const isValidPoolHash = (poolHash: string): boolean => {
  if (poolHash.length === 0) return false

  const {csl, release} = wrappedCsl()
  try {
    csl.Ed25519KeyHash.fromBytes(Buffer.from(poolHash, 'hex'))
    return true
  } catch (e) {
    return false
  } finally {
    release()
  }
}
