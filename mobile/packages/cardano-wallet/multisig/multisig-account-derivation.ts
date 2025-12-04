/**
 * Multisig account derivation utilities
 * Derives MULTI_SIG purpose accounts from parent wallets (CIP-1854)
 */
import {cardanoConfig} from '@yoroi/blockchains'
import {derivationConfig} from '@yoroi/blockchains'
import {Wallet} from '@yoroi/types'
import {Bip32PublicKeyHex} from '@yoroi/types'

import type {WasmModuleProxy} from '@emurgo/cross-csl-core'
import {Buffer} from 'buffer'

import {CardanoMobileWrapped} from '../wrappedCsl'
import {MULTI_SIG_PURPOSE} from './script-derivation'

/**
 * Parameters for deriving a multisig account from a parent wallet
 */
type DeriveMultisigAccountParams = {
  rootKeyHex: string
  accountVisual: number
  implementation: Wallet.Implementation
}

/**
 * Result of deriving a multisig account
 */
type MultisigAccountDerivation = {
  readonly sharedWalletKey: Bip32PublicKeyHex
  readonly accountPubKeyHex: string
}

/**
 * Derive a MULTI_SIG purpose account from a parent wallet's root key
 * Path: m/1852'/1815'/account'/2'/0/0
 * Where 2' is the MULTI_SIG purpose
 */
export const deriveMultisigAccount = async ({
  rootKeyHex,
  accountVisual,
  implementation,
}: DeriveMultisigAccountParams): Promise<MultisigAccountDerivation> => {
  return CardanoMobileWrapped.cslScope((csl: WasmModuleProxy) => {
    const config = cardanoConfig.implementations[implementation]

    // Start from root key
    const rootKeyPtr = csl.Bip32PrivateKey.fromBytes(
      Buffer.from(rootKeyHex, 'hex'),
    )

    if (!rootKeyPtr) {
      throw new Error('Invalid root key')
    }

    // Derive: m/1852'/1815'/account'
    const withPurpose = rootKeyPtr.derive(
      config.derivations.base.harden.purpose,
    )
    const withCoinType = withPurpose.derive(
      config.derivations.base.harden.coinType,
    )
    const withAccount = withCoinType.derive(
      derivationConfig.hardStart + accountVisual,
    )

    // Derive MULTI_SIG purpose: m/1852'/1815'/account'/2'
    const withMultiSigPurpose = withAccount.derive(
      derivationConfig.hardStart + MULTI_SIG_PURPOSE,
    )

    // Derive to role 0, index 0: m/1852'/1815'/account'/2'/0/0
    // This gives us the shared wallet key
    const sharedWalletKeyPtr = withMultiSigPurpose.derive(0).derive(0)
    const sharedWalletKeyPublic = sharedWalletKeyPtr.toPublic()
    const sharedWalletKeyHex = Buffer.from(
      sharedWalletKeyPublic.asBytes(),
    ).toString('hex') as Bip32PublicKeyHex

    // Also get the account-level public key (for reference)
    const accountPubRaw = withAccount.toPublic()
    const accountPubKeyHex = Buffer.from(accountPubRaw.asBytes()).toString(
      'hex',
    )

    return {
      sharedWalletKey: sharedWalletKeyHex,
      accountPubKeyHex,
    }
  })
}

/**
 * Derive shared wallet key from account public key
 * This is used when we only have the account public key (e.g., from hardware wallet)
 */
export const deriveSharedWalletKeyFromAccountPubKey = async (
  accountPubKeyHex: string,
  implementation: Wallet.Implementation,
): Promise<Bip32PublicKeyHex> => {
  return CardanoMobileWrapped.cslScope((csl: WasmModuleProxy) => {
    const accountPubKeyPtr = csl.Bip32PublicKey.fromBytes(
      Buffer.from(accountPubKeyHex, 'hex'),
    )

    if (!accountPubKeyPtr) {
      throw new Error('Invalid account public key')
    }

    // Derive MULTI_SIG purpose: account'/2'
    const withMultiSigPurpose = accountPubKeyPtr.derive(
      derivationConfig.hardStart + MULTI_SIG_PURPOSE,
    )

    // Derive to role 0, index 0: account'/2'/0/0
    const sharedWalletKeyPtr = withMultiSigPurpose.derive(0).derive(0)
    const sharedWalletKeyHex = Buffer.from(
      sharedWalletKeyPtr.asBytes(),
    ).toString('hex') as Bip32PublicKeyHex

    return sharedWalletKeyHex
  })
}
