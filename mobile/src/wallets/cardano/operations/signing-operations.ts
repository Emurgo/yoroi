import {cardanoConfig, derivationConfig} from '@yoroi/blockchains'
import {isNonNullable} from '@yoroi/common'
import type {Datum, UnsignedTransaction} from '@yoroi/tx'
import {signTransaction} from '@yoroi/tx'
import {Wallet} from '@yoroi/types'

import * as CSL from '@emurgo/cross-csl-core'
import {Buffer} from 'buffer'

import {CardanoMobile} from '../../wallets'
import {CardanoMobileWrapped} from '../wrappedCsl'

/**
 * Sign a transaction with a decrypted master key
 */
export const signWalletTransaction = (
  unsignedTx: UnsignedTransaction,
  decryptedMasterKey: string,
  accountVisual: number,
  implementation: Wallet.Implementation,
): CSL.Transaction => {
  if (!unsignedTx.cbor) {
    throw new Error('UnsignedTransaction must have CBOR to sign')
  }

  const implementationConfig =
    cardanoConfig.implementations[
      implementation as keyof typeof cardanoConfig.implementations
    ]

  const masterKey = CardanoMobile.Bip32PrivateKey.fromBytes(
    new Uint8Array(Buffer.from(decryptedMasterKey, 'hex')),
  )
  const accountPrivateKey = masterKey
    .derive(implementationConfig.derivations.base.harden.purpose)
    .derive(implementationConfig.derivations.base.harden.coinType)
    .derive(accountVisual + derivationConfig.hardStart)

  const accountPrivateKeyHex = Buffer.from(
    accountPrivateKey.asBytes(),
  ).toString('hex')

  let stakingPrivateKey: CSL.PrivateKey | undefined
  if (implementationConfig.features.staking) {
    const derivation = implementationConfig.features.staking.derivation
    stakingPrivateKey = accountPrivateKey
      .derive(derivation.role)
      .derive(derivation.index)
      .toRawKey()
  }

  // Derive staking key requirements from certificates and withdrawals
  let needsStakingKey = false
  if (unsignedTx.certificates.length > 0 || unsignedTx.withdrawals.length > 0) {
    needsStakingKey = true
  }

  // Check for governance-related certificates (vote delegation, etc.)
  for (const certData of unsignedTx.certificates) {
    const certKind = 'kind' in certData ? certData.kind : 'unknown'
    if (
      certKind === 'VoteDelegation' ||
      certKind === 'StakeAndVoteDelegation' ||
      certKind === 'StakeVoteRegistrationAndDelegation' ||
      certKind === 'VoteRegistrationAndDelegation'
    ) {
      needsStakingKey = true
      break
    }
  }

  if (needsStakingKey && !stakingPrivateKey) {
    throw new Error(
      'signWalletTransaction: required staking key but not supported',
    )
  }

  const stakingKeysForSigning =
    needsStakingKey && stakingPrivateKey
      ? [
          {
            keyHex: Buffer.from(stakingPrivateKey.asBytes()).toString('hex'),
          },
        ]
      : undefined

  // Extract datum data from outputs
  const datumDatas = unsignedTx.outputs
    .map((output) => output.datum)
    .filter(isNonNullable)
    .filter(
      (datum: Datum): datum is Exclude<Datum, {hash: string}> =>
        'data' in datum,
    )

  // Sign the transaction using the new signing function
  return CardanoMobileWrapped.cslScope((csl) => {
    const signedTx = signTransaction(
      csl,
      unsignedTx,
      accountPrivateKeyHex,
      stakingKeysForSigning,
      datumDatas.length > 0
        ? datumDatas.map((d) => ({data: d.data}))
        : undefined,
    )

    return signedTx
  })
}
