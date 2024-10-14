/* eslint-disable no-empty */
import {SendToken} from '@emurgo/yoroi-lib'
import {invalid} from '@yoroi/common'
import {Balance, Chain, Portfolio, Wallet} from '@yoroi/types'
import {BigNumber} from 'bignumber.js'
import {Buffer} from 'buffer'

import {BaseAsset, RawUtxo} from '../types/other'
import {DefaultAsset} from '../types/tokens'
import {YoroiEntry} from '../types/yoroi'
import {Amounts} from '../utils/utils'
import {toAssetNameHex, toPolicyId} from './api/utils'
import {withMinAmounts} from './getMinAmounts'
import {MultiToken} from './MultiToken'
import {CardanoTypes} from './types'
import {wrappedCsl} from './wrappedCsl'

export const deriveRewardAddressHex = async (
  accountPubKeyHex: string,
  chainId: number,
  role: number,
  index: number,
): Promise<string> => {
  const {csl, release} = wrappedCsl()

  try {
    const accountPubKeyPtr = await csl.Bip32PublicKey.fromBytes(Buffer.from(accountPubKeyHex, 'hex'))
    const stakingKey = await (await (await accountPubKeyPtr.derive(role)).derive(index)).toRawKey()
    const credential = await csl.Credential.fromKeyhash(await stakingKey.hash())
    const rewardAddr = await csl.RewardAddress.new(chainId, credential)
    const rewardAddrAsAddr = await rewardAddr.toAddress()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = Buffer.from((await rewardAddrAsAddr.toBytes()) as any, 'hex').toString('hex')
    return result
  } finally {
    release()
  }
}

export const deriveRewardAddressFromAddress = async (address: string, chainId: number): Promise<string> => {
  const {csl, release} = wrappedCsl()

  try {
    const result = await csl.Address.fromBech32(address)
      .then((address) => csl.BaseAddress.fromAddress(address))
      .then((baseAddress) => baseAddress?.stakeCred() ?? invalid('invalid base address'))
      .then((stakeCredential) => csl.RewardAddress.new(chainId, stakeCredential))
      .then((rewardAddress) => rewardAddress.toAddress())
      .then((rewardAddrAsAddress) => rewardAddrAsAddress.toBech32(undefined))
      .catch((error) => error)

    if (typeof result !== 'string') throw new Error('Its not possible to derive reward address')
    return result
  } finally {
    release()
  }
}

/**
 * Multi-asset related
 */
export const identifierToCardanoAsset = async (
  tokenId: string,
): Promise<{
  policyId: CardanoTypes.ScriptHash
  name: CardanoTypes.AssetName
}> => {
  const {csl, release} = wrappedCsl()

  try {
    const policyId = toPolicyId(tokenId)
    const assetNameHex = toAssetNameHex(tokenId)

    return {
      policyId: await csl.ScriptHash.fromBytes(Buffer.from(policyId, 'hex')),
      name: await csl.AssetName.new(Buffer.from(assetNameHex, 'hex')),
    }
  } finally {
    release()
  }
}

export const cardanoValueFromRemoteFormat = async (utxo: RawUtxo) => {
  const {csl, release} = wrappedCsl()

  try {
    const value = await csl.Value.new(await csl.BigNum.fromStr(utxo.amount))
    if (utxo.assets.length === 0) return value
    const assets = await csl.MultiAsset.new()

    for (const remoteAsset of utxo.assets) {
      const {policyId, name} = await identifierToCardanoAsset(remoteAsset.assetId)
      let policyContent = await assets.get(policyId)
      policyContent = policyContent?.hasValue() ? policyContent : await csl.Assets.new()
      await policyContent.insert(name, await csl.BigNum.fromStr(remoteAsset.amount))
      // recall: we always have to insert since WASM returns copies of objects
      await assets.insert(policyId, policyContent)
    }

    if ((await assets.len()) > 0) {
      await value.setMultiasset(assets)
    }

    return value
  } finally {
    release()
  }
}
// matches RawUtxo and a tx input/output
type RemoteValue = {
  readonly amount: string
  readonly assets?: ReadonlyArray<BaseAsset>
}

export const multiTokenFromRemote = (remoteValue: RemoteValue) => {
  const result = new MultiToken([], {
    defaultIdentifier: '.',
  })
  result.add({
    identifier: '.',
    amount: new BigNumber(remoteValue.amount),
  })

  if (remoteValue.assets != null) {
    for (const token of remoteValue.assets) {
      result.add({
        identifier: token.assetId,
        amount: new BigNumber(token.amount),
      })
    }
  }

  return result
}

export const isByron = (implementation: Wallet.Implementation) => implementation === 'cardano-bip44'

export const isShelley = (implementation: Wallet.Implementation) => implementation === 'cardano-cip1852'

export const toSendTokenList = (amounts: Balance.Amounts, primaryTokenInfo: Portfolio.Token.Info): Array<SendToken> => {
  return Amounts.toArray(amounts).map(toSendToken(primaryTokenInfo))
}

export const toRecipients = async (
  entries: YoroiEntry[],
  primaryTokenInfo: Portfolio.Token.Info,
  protocolParams: Chain.Cardano.ProtocolParams,
) => {
  return Promise.all(
    entries.map(async (entry) => {
      const amounts = await withMinAmounts(entry.address, entry.amounts, primaryTokenInfo, protocolParams)
      return {
        receiver: entry.address,
        tokens: toSendTokenList(amounts, primaryTokenInfo),
        datum: entry.datum,
      }
    }),
  )
}

export const toSendToken =
  (primaryTokenInfo: Portfolio.Token.Info) =>
  (amount: Balance.Amount | Portfolio.Token.Amount): SendToken => {
    let tokenId = ''
    let quantity = ''
    if ('info' in amount) {
      tokenId = amount.info.id
      quantity = amount.quantity.toString()
    } else {
      tokenId = amount.tokenId
      quantity = amount.quantity
    }

    const isPrimary = tokenId === primaryTokenInfo.id

    return {
      token: {
        identifier: tokenId,
        isDefault: isPrimary,
      },
      amount: new BigNumber(quantity),
      shouldSendAll: false,
    }
  }

export const isTokenInfo = (token: Balance.TokenInfo | DefaultAsset): token is Balance.TokenInfo => {
  return !!(token as Balance.TokenInfo).kind
}

export const generateCIP30UtxoCbor = async (utxo: RawUtxo) => {
  const {csl, release} = wrappedCsl()

  try {
    const txHash = await csl.TransactionHash.fromBytes(Buffer.from(utxo.tx_hash, 'hex'))
    if (!txHash) throw new Error('Invalid tx hash')

    const index = utxo.tx_index
    const input = await csl.TransactionInput.new(txHash, index)
    const address = await csl.Address.fromBech32(utxo.receiver)
    if (!address) throw new Error('Invalid address')

    const amount = await csl.BigNum.fromStr(utxo.amount)
    if (!amount) throw new Error('Invalid amount')

    const collateral = await csl.Value.new(amount)
    const output = await csl.TransactionOutput.new(address, collateral)
    const transactionUnspentOutput = await csl.TransactionUnspentOutput.new(input, output)

    return transactionUnspentOutput.toHex()
  } finally {
    release()
  }
}

export const createRawTxSigningKey = async (rootKey: string, derivationPath: number[]) => {
  const {csl, release} = wrappedCsl()

  try {
    if (derivationPath.length !== 5) throw new Error('Invalid derivation path')
    const masterKey = await csl.Bip32PrivateKey.fromBytes(Buffer.from(rootKey, 'hex'))
    const accountPrivateKey = await masterKey
      .derive(derivationPath[0])
      .then((key) => key.derive(derivationPath[1]))
      .then((key) => key.derive(derivationPath[2]))
      .then((key) => key.derive(derivationPath[3]))
      .then((key) => key.derive(derivationPath[4]))

    const rawKey = await accountPrivateKey.toRawKey()
    const bech32 = await rawKey.toBech32()

    const pkey = await csl.PrivateKey.fromBech32(bech32)
    if (!pkey) throw new Error('Invalid private key')
    return pkey
  } finally {
    release()
  }
}

export const copyFromCSL = async <T extends {toHex: () => Promise<string>}>(
  creator: {fromHex: (hex: string) => Promise<T>},
  value: T,
): Promise<T> => {
  return creator.fromHex(await value.toHex())
}

export const copyMultipleFromCSL = async <T extends {toHex: () => Promise<string>}>(
  items: T[],
  creator: {fromHex: (hex: string) => Promise<T>},
) => {
  return Promise.all(items.map((item) => copyFromCSL(creator, item)))
}

export const getTransactionUnspentOutput = async ({
  txId,
  bytes,
  index,
}: {
  txId: string
  bytes: Uint8Array
  index: number
}) => {
  const {csl, release} = wrappedCsl()

  try {
    const tx = await csl.Transaction.fromBytes(bytes)
    const body = await tx.body()
    const originalOutput = await (await body.outputs()).get(index)

    const txHash = txId.split(':')[index]
    const input = await csl.TransactionInput.new(await csl.TransactionHash.fromHex(txHash), 0)
    const value = await originalOutput.amount()
    const receiver = await originalOutput.address()
    const output = await csl.TransactionOutput.new(receiver, value)
    return copyFromCSL(csl.TransactionUnspentOutput, await csl.TransactionUnspentOutput.new(input, output))
  } finally {
    release()
  }
}
