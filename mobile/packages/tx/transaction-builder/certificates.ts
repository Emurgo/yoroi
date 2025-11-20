// Certificate creation utilities
import type {Certificate, WasmModuleProxy} from '@emurgo/cross-csl-core'
import {Buffer} from 'buffer'

import {DRepValue, TransactionCertificate} from './types'

/**
 * Create CSL DRep from DRepValue
 */
function createDRepFromValue(csl: WasmModuleProxy, drepValue: DRepValue): any {
  if (drepValue === 'AlwaysAbstain') {
    return csl.DRep.newAlwaysAbstain()
  }
  if (drepValue === 'AlwaysNoConfidence') {
    return csl.DRep.newAlwaysNoConfidence()
  }
  if ('KeyHash' in drepValue) {
    const drepKeyHashBytes = Buffer.from(drepValue.KeyHash, 'hex')
    const drepKeyHash = csl.Ed25519KeyHash.fromBytes(
      new Uint8Array(drepKeyHashBytes),
    )
    return csl.DRep.newKeyHash(drepKeyHash)
  }
  if ('ScriptHash' in drepValue) {
    const drepScriptHashBytes = Buffer.from(drepValue.ScriptHash, 'hex')
    const drepScriptHash = csl.ScriptHash.fromBytes(
      new Uint8Array(drepScriptHashBytes),
    )
    return csl.DRep.newScriptHash(drepScriptHash)
  }
  throw new Error(`Invalid DRep value: ${JSON.stringify(drepValue)}`)
}

/**
 * Create CSL Certificate from certificate data
 * NOTE: This function expects to be called within a cslScope.
 * All CSL objects are created within the provided csl instance to avoid mixing.
 */
export function createCertificateFromData(
  csl: WasmModuleProxy,
  certData: TransactionCertificate,
  stakeCred?: any,
): Certificate {
  // Extract stake credential key hash if not provided
  let stakeCredential: any = stakeCred
  if (!stakeCredential) {
    const stakeCredentialKeyHashHex =
      'stakeCredentialKeyHashHex' in certData
        ? certData.stakeCredentialKeyHashHex
        : undefined
    if (stakeCredentialKeyHashHex) {
      const keyHashBytes = Buffer.from(stakeCredentialKeyHashHex, 'hex')
      const keyHash = csl.Ed25519KeyHash.fromBytes(new Uint8Array(keyHashBytes))
      stakeCredential = csl.Credential.fromKeyhash(keyHash)
    }
  }

  const certKind = 'kind' in certData ? certData.kind : 'unknown'

  switch (certKind) {
    case 'StakeRegistration': {
      if (!stakeCredential)
        throw new Error('StakeRegistration requires stakeCredentialKeyHashHex')
      const stakeReg = csl.StakeRegistration.new(stakeCredential)
      return csl.Certificate.newStakeRegistration(stakeReg)
    }
    case 'StakeDeregistration': {
      if (!stakeCredential)
        throw new Error(
          'StakeDeregistration requires stakeCredentialKeyHashHex',
        )
      const stakeDereg = csl.StakeDeregistration.new(stakeCredential)
      return csl.Certificate.newStakeDeregistration(stakeDereg)
    }
    case 'StakeDelegation': {
      if (!stakeCredential)
        throw new Error('StakeDelegation requires stakeCredentialKeyHashHex')
      const certWithPool = certData as Extract<
        TransactionCertificate,
        {kind: 'StakeDelegation'}
      >
      const poolKeyHashBytes = Buffer.from(certWithPool.poolKeyHash, 'hex')
      const poolKeyHash = csl.Ed25519KeyHash.fromBytes(
        new Uint8Array(poolKeyHashBytes),
      )
      const stakeDeleg = csl.StakeDelegation.new(stakeCredential, poolKeyHash)
      return csl.Certificate.newStakeDelegation(stakeDeleg)
    }
    case 'VoteDelegation': {
      if (!stakeCredential)
        throw new Error('VoteDelegation requires stakeCredentialKeyHashHex')
      const certWithDrep = certData as Extract<
        TransactionCertificate,
        {kind: 'VoteDelegation'}
      >
      // Create DRep from drep value
      const drep = createDRepFromValue(csl, certWithDrep.drep)
      const voteDeleg = csl.VoteDelegation.new(stakeCredential, drep)
      return csl.Certificate.newVoteDelegation(voteDeleg)
    }
    default:
      throw new Error(`Certificate kind '${certKind}' not yet implemented`)
  }
}
