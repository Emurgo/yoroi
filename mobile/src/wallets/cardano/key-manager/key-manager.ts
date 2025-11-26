import {cardanoConfig, derivationConfig} from '@yoroi/blockchains'
import {Wallet} from '@yoroi/types'

import {WasmModuleProxy} from '@emurgo/cross-csl-core'
import {freeze} from 'immer'

import {generateWalletRootKey} from '../mnemonic/mnemonic'

export const keyManager =
  (implementation: Wallet.Implementation) =>
  ({
    csl,
    mnemonic,
    accountVisual = 0,
  }: {
    csl: WasmModuleProxy
    mnemonic: string
    accountVisual?: number
  }) => {
    const config = cardanoConfig.implementations[implementation]

    const rootKeyPtr = generateWalletRootKey(mnemonic, csl)

    const rootKey: string = Buffer.from(rootKeyPtr.asBytes()).toString('hex')

    const withPurpose = rootKeyPtr.derive(
      config.derivations.base.harden.purpose,
    )

    const withCoinType = withPurpose.derive(
      config.derivations.base.harden.coinType,
    )

    const withAccount = withCoinType.derive(
      derivationConfig.hardStart + accountVisual,
    )

    const accountPubRaw = withAccount.toPublic()

    const accountPubBytes = accountPubRaw.asBytes()

    const accountPubKeyHex = Buffer.from(accountPubBytes).toString('hex')

    return freeze({
      rootKey,
      accountPubKeyHex,
    })
  }

/**
 * Derives accountPubKeyHex from root key for any accountVisual
 * This allows deriving multiple accounts from a single root key
 */
export const deriveAccountFromRootKey = (
  rootKeyHex: string,
  accountVisual: number,
  implementation: Wallet.Implementation,
  csl: WasmModuleProxy,
): string => {
  const config = cardanoConfig.implementations[implementation]
  const rootKeyPtr = csl.Bip32PrivateKey.fromBytes(
    Buffer.from(rootKeyHex, 'hex'),
  )

  const withPurpose = rootKeyPtr.derive(config.derivations.base.harden.purpose)
  const withCoinType = withPurpose.derive(
    config.derivations.base.harden.coinType,
  )
  const withAccount = withCoinType.derive(
    derivationConfig.hardStart + accountVisual,
  )

  const accountPubRaw = withAccount.toPublic()
  const accountPubKeyHex = Buffer.from(accountPubRaw.asBytes()).toString('hex')

  return accountPubKeyHex
}
