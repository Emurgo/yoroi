/* eslint-disable @typescript-eslint/no-explicit-any */

import {sortBy} from 'lodash'

import assert from '../../../src/legacy/assert'
import {ObjectValues} from '../../../src/legacy/flow'
import {Logger} from '../../../src/legacy/logging'
import type {AddressedUtxo} from '../../../src/legacy/types'
import {normalizeToAddress} from '../../../src/legacy/utils'
import {StakingStatus} from '../../../src/types'
import {CardanoMobile, CardanoTypes} from '..'
import type {TimestampedCertMeta} from './transactionCache'

const addrContainsAccountKey = async (
  address: string,
  targetAccountKey: CardanoTypes.StakeCredential,
  acceptTypeMismatch: boolean,
) => {
  const wasmAddr = await normalizeToAddress(address)

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

  // TODO(v-almonacid): PointerAddress not yet implemented
  // const asPointer = await PointerAddress.fromAddress(wasmAddr);
  // if (asPointer != null) {
  //   // TODO
  // }
  return acceptTypeMismatch
}

export const filterAddressesByStakingKey = async (
  stakingKey: CardanoTypes.StakeCredential,
  utxos: ReadonlyArray<AddressedUtxo>,
  acceptTypeMismatch: boolean,
) => {
  const result: Array<AddressedUtxo> = []

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
  Logger.debug('txCertificatesForKey', sortedCerts)
  let status: StakingStatus = {isRegistered: false}

  for (const certData of ObjectValues(sortedCerts)) {
    const certificates = (certData as any).certificates

    for (const cert of certificates) {
      if (cert.rewardAddress !== rewardAddress) continue

      if (cert.kind === 'StakeDelegation') {
        assert.assert(cert.poolKeyHash != null, 'getDelegationStatus:: StakeDelegation certificate without poolKeyHash')
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
