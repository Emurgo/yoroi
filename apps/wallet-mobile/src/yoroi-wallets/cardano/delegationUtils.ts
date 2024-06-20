/* eslint-disable @typescript-eslint/no-explicit-any */

import {CardanoAddressedUtxo} from '@emurgo/yoroi-lib'
import {normalizeToAddress} from '@emurgo/yoroi-lib/dist/internals/utils/addresses'
import assert from 'assert'
import {sortBy} from 'lodash'

import {StakingStatus} from '../types'
import {CardanoMobile} from '../wallets'
import type {TimestampedCertMeta} from './transactionManager'
import {CardanoTypes} from './types'

const addrContainsAccountKey = async (
  address: string,
  targetAccountKey: CardanoTypes.StakeCredential,
  acceptTypeMismatch: boolean,
) => {
  const wasmAddr = await normalizeToAddress(CardanoMobile, address)

  if (wasmAddr == null) {
    throw new Error(`addrContainsAccountKey: invalid address ${address}`)
  }

  const accountKeyString = Buffer.from(await targetAccountKey.toBytes()).toString('hex')
  const asBase = await CardanoMobile.BaseAddress.fromAddress(wasmAddr)

  if (asBase != null) {
    if (Buffer.from(await (await asBase.stakeCred()).toBytes()).toString('hex') === accountKeyString) {
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
    if (await addrContainsAccountKey(utxo.receiver, stakingKey, acceptTypeMismatch)) {
      result.push(utxo)
    }
  }

  return result
}

export const getDelegationStatus = (
  rewardAddress: string,
  txCertificatesForKey: Record<string, TimestampedCertMeta>, // key is txId
): StakingStatus => {
  // start with older certificate
  const sortedCerts: any = sortBy(txCertificatesForKey, (txCerts) => txCerts.submittedAt)
  let status: StakingStatus = {isRegistered: false}

  for (const certData of Object.values(sortedCerts)) {
    const certificates = (certData as any).certificates

    for (const cert of certificates) {
      if (cert.rewardAddress !== rewardAddress) continue

      if (cert.kind === 'StakeDelegation') {
        assert(cert.poolKeyHash != null, 'getDelegationStatus:: StakeDelegation certificate without poolKeyHash')
        status = {
          poolKeyHash: cert.poolKeyHash,
          isRegistered: true,
        }
      } else if (cert.kind === 'StakeRegistration' || cert.kind === 'MoveInstantaneousRewardsCert') {
        status = {isRegistered: true}
      } else if (cert.kind === 'StakeDeregistration') {
        status = {isRegistered: false}
      }
    }
  }

  return status
}
