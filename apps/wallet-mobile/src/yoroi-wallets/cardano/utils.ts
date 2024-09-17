/* eslint-disable no-empty */
import {SendToken} from '@emurgo/yoroi-lib'
import {Balance, Chain, Portfolio, Wallet} from '@yoroi/types'
import {BigNumber} from 'bignumber.js'
import {Buffer} from 'buffer'

import {YoroiEntry} from '../types'
import {BaseAsset, RawUtxo} from '../types/other'
import {DefaultAsset} from '../types/tokens'
import {Amounts} from '../utils'
import {CardanoMobile} from '../wallets'
import {toAssetNameHex, toPolicyId} from './api/utils'
import {withMinAmounts} from './getMinAmounts'
import {MultiToken} from './MultiToken'
import {CardanoTypes} from './types'
import {wrappedCsl as getCSL} from './wrappedCsl'

export const deriveRewardAddressHex = async (
  accountPubKeyHex: string,
  chainId: number,
  role: number,
  index: number,
): Promise<string> => {
  const accountPubKeyPtr = await CardanoMobile.Bip32PublicKey.fromBytes(Buffer.from(accountPubKeyHex, 'hex'))
  const stakingKey = await (await (await accountPubKeyPtr.derive(role)).derive(index)).toRawKey()
  const credential = await CardanoMobile.Credential.fromKeyhash(await stakingKey.hash())
  const rewardAddr = await CardanoMobile.RewardAddress.new(chainId, credential)
  const rewardAddrAsAddr = await rewardAddr.toAddress()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = Buffer.from((await rewardAddrAsAddr.toBytes()) as any, 'hex').toString('hex')
  return result
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
  const policyId = toPolicyId(tokenId)
  const assetNameHex = toAssetNameHex(tokenId)

  return {
    policyId: await CardanoMobile.ScriptHash.fromBytes(Buffer.from(policyId, 'hex')),
    name: await CardanoMobile.AssetName.new(Buffer.from(assetNameHex, 'hex')),
  }
}

export const cardanoValueFromRemoteFormat = async (utxo: RawUtxo) => {
  const value = await CardanoMobile.Value.new(await CardanoMobile.BigNum.fromStr(utxo.amount))
  if (utxo.assets.length === 0) return value
  const assets = await CardanoMobile.MultiAsset.new()

  for (const remoteAsset of utxo.assets) {
    const {policyId, name} = await identifierToCardanoAsset(remoteAsset.assetId)
    let policyContent = await assets.get(policyId)
    policyContent = policyContent?.hasValue() ? policyContent : await CardanoMobile.Assets.new()
    await policyContent.insert(name, await CardanoMobile.BigNum.fromStr(remoteAsset.amount))
    // recall: we always have to insert since WASM returns copies of objects
    await assets.insert(policyId, policyContent)
  }

  if ((await assets.len()) > 0) {
    await value.setMultiasset(assets)
  }

  return value
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
  const txHash = await CardanoMobile.TransactionHash.fromBytes(Buffer.from(utxo.tx_hash, 'hex'))
  if (!txHash) throw new Error('Invalid tx hash')

  const index = utxo.tx_index
  const input = await CardanoMobile.TransactionInput.new(txHash, index)
  const address = await CardanoMobile.Address.fromBech32(utxo.receiver)
  if (!address) throw new Error('Invalid address')

  const amount = await CardanoMobile.BigNum.fromStr(utxo.amount)
  if (!amount) throw new Error('Invalid amount')

  const collateral = await CardanoMobile.Value.new(amount)
  const output = await CardanoMobile.TransactionOutput.new(address, collateral)
  const transactionUnspentOutput = await CardanoMobile.TransactionUnspentOutput.new(input, output)

  return transactionUnspentOutput.toHex()
}

export const createRawTxSigningKey = async (rootKey: string, derivationPath: number[]) => {
  if (derivationPath.length !== 5) throw new Error('Invalid derivation path')
  const masterKey = await CardanoMobile.Bip32PrivateKey.fromBytes(Buffer.from(rootKey, 'hex'))
  const accountPrivateKey = await masterKey
    .derive(derivationPath[0])
    .then((key) => key.derive(derivationPath[1]))
    .then((key) => key.derive(derivationPath[2]))
    .then((key) => key.derive(derivationPath[3]))
    .then((key) => key.derive(derivationPath[4]))

  const rawKey = await accountPrivateKey.toRawKey()
  const bech32 = await rawKey.toBech32()

  const pkey = await CardanoMobile.PrivateKey.fromBech32(bech32)
  if (!pkey) throw new Error('Invalid private key')
  return pkey
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
  const {csl, release} = getCSL()
  try {
    const tx = await csl.Transaction.fromBytes(bytes)
    const body = await tx.body()
    const originalOutput = await (await body.outputs()).get(index)

    const txHash = txId.split(':')[index]
    const input = await csl.TransactionInput.new(await csl.TransactionHash.fromHex(txHash), 0)
    const value = await originalOutput.amount()
    const receiver = await originalOutput.address()
    const output = await csl.TransactionOutput.new(receiver, value)
    return copyFromCSL(
      CardanoMobile.TransactionUnspentOutput,
      await CardanoMobile.TransactionUnspentOutput.new(input, output),
    )
  } finally {
    release()
  }
}
