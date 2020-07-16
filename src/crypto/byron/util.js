// @flow

import {BigNumber} from 'bignumber.js'
import {mnemonicToEntropy, generateMnemonic} from 'bip39'
import {HdWallet, Wallet, PasswordProtect} from 'react-native-cardano'
import {
  encryptWithPassword as encryptWithPasswordJs,
  decryptWithPassword as decryptWithPasswordJs,
} from 'emip3js'
import {randomBytes} from 'react-native-randombytes'
import bs58 from 'bs58'
import cbor from 'cbor'
import cryptoRandomString from 'crypto-random-string'

import assert from '../../utils/assert'
import {CONFIG} from '../../config'
import {
  _rethrow,
  InsufficientFunds,
  WrongPassword,
  CardanoError,
} from '../errors'
import {ADDRESS_TYPE_TO_CHANGE} from '../commonUtils'

import type {
  TransactionInput,
  TransactionOutput,
  V1SignedTx,
} from '../../types/HistoryTransaction'
import type {AddressType} from '../commonUtils'

export type CryptoAccount = {
  derivation_scheme: string,
  root_cached_key: string,
}

export const KNOWN_ERROR_MSG = {
  DECRYPT_FAILED: 'Decryption failed. Check your password.',
  INSUFFICIENT_FUNDS_RE: /NotEnoughInput/,
  SIGN_TX_BUG: /TxBuildError\(CoinError\(Negative\)\)/,
  // over 45000000000000000
  AMOUNT_OVERFLOW1: /Coin of value [0-9]+ is out of bound./,
  // way over 45000000000000000
  AMOUNT_OVERFLOW2: /ParseIntError { kind: Overflow }"/,
  // output sum over 45000000000000000
  AMOUNT_SUM_OVERFLOW: /CoinError\(OutOfBound/,
}

export type EncryptionMethod = 'BIOMETRICS' | 'SYSTEM_PIN' | 'MASTER_PASSWORD'

export const getMasterKeyFromMnemonic = async (mnemonic: string) => {
  const entropy = mnemonicToEntropy(mnemonic)
  const masterKey = await _rethrow(HdWallet.fromEnhancedEntropy(entropy, ''))
  return masterKey
}

export const getAccountFromMasterKey = async (
  masterKey: Buffer,
  accountIndex?: number = CONFIG.NUMBERS.ACCOUNT_INDEX,
  protocolMagic?: number = CONFIG.CARDANO.PROTOCOL_MAGIC,
): Promise<CryptoAccount> => {
  const wallet = await _rethrow(Wallet.fromMasterKey(masterKey))
  wallet.config.protocol_magic = protocolMagic
  return _rethrow(Wallet.newAccount(wallet, accountIndex))
}

export const encryptData = async (
  plaintextHex: string,
  secretKey: string,
  useJs?: boolean = false,
): Promise<string> => {
  assert.assert(!!plaintextHex, 'encrypt:: !!plaintextHex')
  assert.assert(!!secretKey, 'encrypt:: !!secretKey')
  const secretKeyHex = Buffer.from(secretKey, 'utf8').toString('hex')
  const saltHex = cryptoRandomString(2 * 32)
  const nonceHex = cryptoRandomString(2 * 12)
  if (useJs) {
    return await encryptWithPasswordJs(
      secretKeyHex,
      saltHex,
      nonceHex,
      plaintextHex,
    )
  }
  return await PasswordProtect.encryptWithPassword(
    secretKeyHex,
    saltHex,
    nonceHex,
    plaintextHex,
  )
}

export const decryptData = async (
  ciphertext: string,
  secretKey: string,
  useJs?: boolean = false,
): Promise<string> => {
  assert.assert(!!ciphertext, 'decrypt:: !!cyphertext')
  assert.assert(!!secretKey, 'decrypt:: !!secretKey')
  const secretKeyHex = Buffer.from(secretKey, 'utf8').toString('hex')
  try {
    if (useJs) {
      return await decryptWithPasswordJs(secretKeyHex, ciphertext)
    }
    return await PasswordProtect.decryptWithPassword(secretKeyHex, ciphertext)
  } catch (e) {
    if (e.message === KNOWN_ERROR_MSG.DECRYPT_FAILED) {
      throw new WrongPassword()
    }
    throw new CardanoError(e.message)
  }
}

export const getAddresses = (
  account: CryptoAccount,
  type: AddressType,
  indexes: Array<number>,
  protocolMagic?: number = CONFIG.CARDANO.PROTOCOL_MAGIC,
): Promise<Array<string>> =>
  _rethrow(Wallet.generateAddresses(account, type, indexes, protocolMagic))

export const getAddressesFromMnemonics = async (
  mnemonic: string,
  type: AddressType,
  indexes: Array<number>,
  networkConfig?: Object = CONFIG.CARDANO,
): Promise<Array<string>> => {
  const masterKey = await getMasterKeyFromMnemonic(mnemonic)
  const account = await getAccountFromMasterKey(masterKey)
  return getAddresses(account, type, indexes)
}

export const getExternalAddresses = (
  account: CryptoAccount,
  indexes: Array<number>,
  protocolMagic?: number = CONFIG.CARDANO.PROTOCOL_MAGIC,
) => getAddresses(account, 'External', indexes, protocolMagic)

export const getInternalAddresses = (
  account: CryptoAccount,
  indexes: Array<number>,
  protocolMagic?: number = CONFIG.CARDANO.PROTOCOL_MAGIC,
) => getAddresses(account, 'Internal', indexes, protocolMagic)

export const getAddressInHex = (address: string): string => {
  try {
    return bs58.decode(address).toString('hex')
  } catch (err) {
    throw new CardanoError(err.message)
  }
}

export const isValidAddress = async (address: string): Promise<boolean> => {
  try {
    return await Wallet.checkAddress(address)
  } catch (e) {
    return false
  }
}

export const generateAdaMnemonic = () =>
  generateMnemonic(CONFIG.MNEMONIC_STRENGTH, randomBytes)

export const generateFakeWallet = async () => {
  const fakeMnemonic = generateAdaMnemonic()
  const fakeMasterKey = await getMasterKeyFromMnemonic(fakeMnemonic)
  const wallet = await _rethrow(Wallet.fromMasterKey(fakeMasterKey))
  return wallet
}

export const getWalletFromMasterKey = async (
  masterKeyHex: string,
  protocolMagic?: number = CONFIG.CARDANO.PROTOCOL_MAGIC,
) => {
  const wallet = await _rethrow(Wallet.fromMasterKey(masterKeyHex))
  wallet.config.protocol_magic = protocolMagic
  return wallet
}

export const signTransaction = async (
  wallet: any,
  inputs: Array<TransactionInput>,
  outputs: Array<TransactionOutput>,
  changeAddress: string,
): Promise<V1SignedTx> => {
  try {
    const result = await Wallet.spend(wallet, inputs, outputs, changeAddress)

    return {
      ...result,
      fee: new BigNumber(result.fee, 10),
    }
  } catch (e) {
    if (KNOWN_ERROR_MSG.INSUFFICIENT_FUNDS_RE.test(e.message)) {
      throw new InsufficientFunds()
    }
    if (KNOWN_ERROR_MSG.SIGN_TX_BUG.test(e.message)) {
      throw new InsufficientFunds()
    }
    // TODO(ppershing): these should be probably tested as a precondition
    // before calling Wallet.spend but I expect some additional corner cases
    if (
      KNOWN_ERROR_MSG.AMOUNT_OVERFLOW1.test(e.message) ||
      KNOWN_ERROR_MSG.AMOUNT_OVERFLOW2.test(e.message) ||
      KNOWN_ERROR_MSG.AMOUNT_SUM_OVERFLOW.test(e.message)
    ) {
      throw new InsufficientFunds()
    }
    throw new CardanoError(e.message)
  }
}

export const formatBIP44 = (
  account: number,
  type: AddressType,
  index: number,
) => {
  const PURPOSE = 44
  const COIN = 1815

  return `m/${PURPOSE}'/${COIN}'/${account}'/${
    ADDRESS_TYPE_TO_CHANGE[type]
  }/${index}`
}

export type TxWitness = {PkWitness: [string, string]}
export type CryptoTransaction = {
  tx: {
    tx: {
      inputs: Array<{id: string, index: number}>,
      outputs: Array<{address: string, value: number}>,
    },
    witnesses: Array<TxWitness>,
  },
}
export type RustRawTxBody = string

export const decodeRustTx = (rustTxBody: RustRawTxBody): CryptoTransaction => {
  if (rustTxBody == null) {
    throw new Error('Cannot decode inputs from undefined transaction!')
  }
  const [[[inputs, outputs], witnesses]] = cbor.decodeAllSync(
    Buffer.from(rustTxBody, 'hex'),
  )
  const decInputs: Array<{id: string, index: number}> = inputs.map((x) => {
    const [[buf, idx]] = cbor.decodeAllSync(x[1].value)
    return {
      id: buf.toString('hex'),
      index: idx,
    }
  })
  const decOutputs: Array<{address: string, value: number}> = outputs.map(
    (x) => {
      const [addr, val] = x
      return {
        address: bs58.encode(cbor.encode(addr)),
        value: val,
      }
    },
  )
  const decWitnesses: Array<TxWitness> = witnesses.map((w) => {
    if (w[0] === 0) {
      return {
        PkWitness: cbor
          .decodeAllSync(w[1].value)[0]
          .map((x) => x.toString('hex')),
      }
    }
    throw Error(`Unexpected witness type: ${w}`)
  })
  return {
    tx: {
      tx: {
        inputs: decInputs,
        outputs: decOutputs,
      },
      witnesses: decWitnesses,
    },
  }
}

export const encodeTxAsRust = (tx: CryptoTransaction): Buffer => {
  // normalize tx
  const inputs = tx.tx.tx.inputs.map((i) => {
    return [
      0,
      new cbor.Tagged(24, cbor.encode([Buffer.from(i.id, 'hex'), i.index])),
    ]
  })

  const outputs = tx.tx.tx.outputs.map((o) => {
    return [cbor.decodeAllSync(bs58.decode(o.address))[0], o.value]
  })

  const witnesses = tx.tx.witnesses.map((w) => {
    return [
      0,
      new cbor.Tagged(
        24,
        cbor.encode(w.PkWitness.map((x) => Buffer.from(x, 'hex'))),
      ),
    ]
  })
  const normTx = [[inputs, outputs, {}], witnesses]
  // next we change a few CBOR symbols in order to, hopefully, generate
  // exactly the same output that is generated through the rust libs

  let txHex = cbor
    .encode(normTx)
    .toString('hex')
    .toLowerCase()

  // eslint-disable-next-line max-len
  const CBOR_REGEX = /^(8283)(8\d)(8200d8185824[0-9A-Fa-f]{72})+(8\d)(8282d8185821[0-9A-Fa-f]{66}1(a|b)[0-9A-Fa-f]{6,}1(a|b)[0-9A-Fa-f]{6,})+(a08\d[0-9A-Fa-f]*$)/

  if (CBOR_REGEX.test(txHex)) {
    // replace opening array tag by indefinite-length tag (9f) for inputs array
    const inputsRegex = /^(8283)(8\d)(8200d8185824)/
    assert.assert(inputsRegex.test(txHex), 'can locate input array opening tag')
    txHex = txHex.replace(inputsRegex, '$19f$3')

    // add closing tag for inputs array (ff)
    const inputsClosingRegex = /([0-9A-Fa-f]{72})(8\d8282d8185821)/
    assert.assert(
      inputsClosingRegex.test(txHex),
      'can locate input array closing tag',
    )
    txHex = txHex.replace(inputsClosingRegex, '$1ff$2')

    // do the same for outputs array
    const outputsRegex = /([0-9A-Fa-f]{72}ff)(8\d)(8282d8185821)/
    assert.assert(
      outputsRegex.test(txHex),
      'can locate output array opening tag',
    )
    txHex = txHex.replace(outputsRegex, '$19f$3')

    const outputsClosingRegex = /(1(?:a|b)[0-9A-Fa-f]{6,})(a08\d[0-9A-Fa-f]*$)/
    assert.assert(
      outputsClosingRegex.test(txHex),
      'can locate output array closing tag',
    )
    txHex = txHex.replace(outputsClosingRegex, '$1ff$2')

    return Buffer.from(txHex, 'hex')
  }
  return cbor.encode(normTx)
}
