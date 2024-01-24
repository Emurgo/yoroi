import {generateWalletRootKey} from '../mnemonic'
import {NUMBERS} from '../numbers'

export const makeKeys = async ({mnemonic}: {mnemonic: string}) => {
  const rootKeyPtr = await generateWalletRootKey(mnemonic)
  const rootKey: string = Buffer.from(await rootKeyPtr.asBytes()).toString('hex')

  const purpose = NUMBERS.WALLET_TYPE_PURPOSE.BIP44
  const accountPubKeyHex = await rootKeyPtr
    .derive(purpose)
    .then((key) => key.derive(NUMBERS.COIN_TYPES.CARDANO))
    .then((key) => key.derive(NUMBERS.ACCOUNT_INDEX + NUMBERS.HARD_DERIVATION_START))
    .then((accountKey) => accountKey.toPublic())
    .then((accountPubKey) => accountPubKey.asBytes())
    .then((bytes) => Buffer.from(bytes).toString('hex'))

  return {
    rootKey,
    accountPubKeyHex,
  }
}
