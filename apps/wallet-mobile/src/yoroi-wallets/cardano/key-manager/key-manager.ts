import {WasmModuleProxy} from '@emurgo/cross-csl-core'
import {Wallet} from '@yoroi/types'
import {freeze} from 'immer'

import {cardanoConfig} from '../constants/cardano-config'
import {generateWalletRootKey} from '../mnemonic/mnemonic'

export const keyManager =
  (implementation: Wallet.Implementation) =>
  async ({mnemonic, csl, accountVisual = 0}: {mnemonic: string; csl: WasmModuleProxy; accountVisual?: number}) => {
    const config = cardanoConfig.implementations[implementation]

    const rootKeyPtr = await generateWalletRootKey(mnemonic, csl)
    const rootKey: string = Buffer.from(await rootKeyPtr.asBytes()).toString('hex')

    const accountPubKeyHex = await rootKeyPtr
      .derive(config.derivations.base.harden.purpose)
      .then((withPurpose) => withPurpose.derive(config.derivations.base.harden.coinType))
      .then((withCoinType) => withCoinType.derive(cardanoConfig.derivation.hardStart + accountVisual))
      .then((withAccount) => withAccount.toPublic())
      .then((accountPubRaw) => accountPubRaw.asBytes())
      .then((accountPubBytes) => Buffer.from(accountPubBytes).toString('hex'))

    return freeze({
      rootKey,
      accountPubKeyHex,
    })
  }
