import {cardanoConfig, derivationConfig} from '@yoroi/blockchains'
import {Wallet} from '@yoroi/types'
import {freeze} from 'immer'

import {generateWalletRootKey} from '../mnemonic/mnemonic'

export const keyManager =
  (implementation: Wallet.Implementation) =>
  ({
    mnemonic,
    accountVisual = 0,
  }: {
    mnemonic: string
    accountVisual?: number
  }) => {
    const config = cardanoConfig.implementations[implementation]

    const rootKeyPtr = generateWalletRootKey(mnemonic)

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
