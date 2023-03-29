import {ACCOUNT_INDEX, COIN_TYPE, HARD_DERIVATION_START, PURPOSE} from '../constants/common'
import {generateWalletRootKey} from '../mnemonic'

export const makeKeys = async ({mnemonic}: {mnemonic: string}) => {
  const rootKeyPtr = await generateWalletRootKey(mnemonic)
  const rootKey: string = Buffer.from(await rootKeyPtr.asBytes()).toString('hex')

  const accountPubKeyHex = await rootKeyPtr
    .derive(PURPOSE)
    .then((key) => key.derive(COIN_TYPE))
    .then((key) => key.derive(ACCOUNT_INDEX + HARD_DERIVATION_START))
    .then((accountKey) => accountKey.toPublic())
    .then((accountPubKey) => accountPubKey.asBytes())
    .then((bytes) => Buffer.from(bytes).toString('hex'))

  return {
    rootKey,
    accountPubKeyHex,
  }
}
