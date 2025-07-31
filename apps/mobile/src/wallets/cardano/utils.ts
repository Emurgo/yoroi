import {WasmModuleProxy} from '@emurgo/cross-csl-core'
import {SendToken} from '@emurgo/yoroi-lib'
import {normalizeToAddress} from '@emurgo/yoroi-lib/dist/internals/utils/addresses'
import {invalid} from '@yoroi/common'
import {Balance, Chain, Portfolio, Wallet} from '@yoroi/types'
import {BigNumber} from 'bignumber.js'
import {Buffer} from 'buffer'

import {BaseAsset, RawUtxo} from '../types/other'
import {DefaultAsset} from '../types/tokens'
import {YoroiEntry} from '../types/yoroi'
import {Amounts} from '../utils/utils'
import {CardanoMobile} from '../wallets'
import {identifierToCardanoAsset} from './assetUtils'
import {withMinAmounts} from './getMinAmounts'
import {MultiToken} from './MultiToken'
import {CardanoTypes, YoroiWallet} from './types'
import {wrappedCsl} from './wrappedCsl'

export const deriveRewardAddressHex = (
  accountPubKeyHex: string,
  chainId: number,
  role: number,
  index: number,
): string => {
  const accountPubKeyPtr = CardanoMobile.Bip32PublicKey.fromBytes(
    Buffer.from(accountPubKeyHex, 'hex'),
  )
  const stakingKey = accountPubKeyPtr.derive(role).derive(index).toRawKey()
  const credential = CardanoMobile.Credential.fromKeyhash(stakingKey.hash())
  const rewardAddr = CardanoMobile.RewardAddress.new(chainId, credential)
  const rewardAddrAsAddr = rewardAddr.toAddress()

  const result = Buffer.from(rewardAddrAsAddr.toBytes() as any, 'hex').toString(
    'hex',
  )
  return result
}

export const deriveRewardAddressFromAddress = (
  address: string,
  chainId: number,
): string => {
  const {csl, release} = wrappedCsl()

  try {
    const result = csl.RewardAddress.new(
      chainId,
      csl.BaseAddress.fromAddress(
        csl.Address.fromBech32(address),
      )?.stakeCred() ?? invalid('invalid base address'),
    )
      .toAddress()
      .toBech32(undefined)

    if (typeof result !== 'string')
      throw new Error('Its not possible to derive reward address')
    return result
  } finally {
    release()
  }
}

/**
 * Multi-asset related
 */

export const cardanoValueFromRemoteFormat = (utxo: RawUtxo) => {
  const value = CardanoMobile.Value.new(
    CardanoMobile.BigNum.fromStr(utxo.amount),
  )
  if (utxo.assets.length === 0) return value
  const assets = CardanoMobile.MultiAsset.new()

  for (const remoteAsset of utxo.assets) {
    const {policyId, name} = identifierToCardanoAsset(remoteAsset.assetId)
    let policyContent = assets.get(policyId)
    policyContent = policyContent?.hasValue()
      ? policyContent
      : CardanoMobile.Assets.new()
    policyContent.insert(name, CardanoMobile.BigNum.fromStr(remoteAsset.amount))
    // recall: we always have to insert since WASM returns copies of objects
    assets.insert(policyId, policyContent)
  }

  if (assets.len() > 0) {
    value.setMultiasset(assets)
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

export const isByron = (implementation: Wallet.Implementation) =>
  implementation === 'cardano-bip44'

export const isShelley = (implementation: Wallet.Implementation) =>
  implementation === 'cardano-cip1852'

export const toSendTokenList = (
  amounts: Balance.Amounts,
  primaryTokenInfo: Portfolio.Token.Info,
): Array<SendToken> => {
  return Amounts.toArray(amounts).map(toSendToken(primaryTokenInfo))
}

export const toRecipients = async (
  entries: YoroiEntry[],
  primaryTokenInfo: Portfolio.Token.Info,
  protocolParams: Chain.Cardano.ProtocolParams,
) => {
  return Promise.all(
    entries.map(async (entry) => {
      const amounts = await withMinAmounts(
        entry.address,
        entry.amounts,
        primaryTokenInfo,
        protocolParams,
      )
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

export const isTokenInfo = (
  token: Balance.TokenInfo | DefaultAsset,
): token is Balance.TokenInfo => {
  return !!(token as Balance.TokenInfo).kind
}

export const generateCIP30UtxoCbor = (utxo: RawUtxo) => {
  const txHash = CardanoMobile.TransactionHash.fromBytes(
    Buffer.from(utxo.tx_hash, 'hex'),
  )
  if (!txHash) throw new Error('Invalid tx hash')

  const index = utxo.tx_index
  const input = CardanoMobile.TransactionInput.new(txHash, index)
  const address = CardanoMobile.Address.fromBech32(utxo.receiver)
  if (!address) throw new Error('Invalid address')

  const amount = CardanoMobile.BigNum.fromStr(utxo.amount)
  if (!amount) throw new Error('Invalid amount')

  const collateral = CardanoMobile.Value.new(amount)
  const output = CardanoMobile.TransactionOutput.new(address, collateral)
  const transactionUnspentOutput = CardanoMobile.TransactionUnspentOutput.new(
    input,
    output,
  )

  return transactionUnspentOutput.toHex()
}

export const createRawTxSigningKey = (
  rootKey: string,
  derivationPath: number[],
) => {
  if (derivationPath.length !== 5) throw new Error('Invalid derivation path')
  const masterKey = CardanoMobile.Bip32PrivateKey.fromBytes(
    Buffer.from(rootKey, 'hex'),
  )
  const accountPrivateKey = masterKey
    .derive(derivationPath[0])
    .derive(derivationPath[1])
    .derive(derivationPath[2])
    .derive(derivationPath[3])
    .derive(derivationPath[4])

  const rawKey = accountPrivateKey.toRawKey()
  const bech32 = rawKey.toBech32()

  const pkey = CardanoMobile.PrivateKey.fromBech32(bech32)
  if (!pkey) throw new Error('Invalid private key')
  return pkey
}

export const copyFromCSL = <T extends {toHex: () => string}>(
  creator: {fromHex: (hex: string) => T},
  value: T,
): T => {
  return creator.fromHex(value.toHex())
}

export const copyMultipleFromCSL = <T extends {toHex: () => string}>(
  items: T[],
  creator: {fromHex: (hex: string) => T},
) => {
  return items.map((item) => copyFromCSL(creator, item))
}

export const getTransactionUnspentOutput = ({
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
    const tx = csl.Transaction.fromBytes(bytes)
    const body = tx.body()
    const originalOutput = body.outputs().get(index)

    const txHash = txId.split(':')[index]
    const input = csl.TransactionInput.new(
      csl.TransactionHash.fromHex(txHash),
      0,
    )
    const value = originalOutput.amount()
    const receiver = originalOutput.address()
    const output = csl.TransactionOutput.new(receiver, value)
    return copyFromCSL(
      CardanoMobile.TransactionUnspentOutput,
      CardanoMobile.TransactionUnspentOutput.new(input, output),
    )
  } finally {
    release()
  }
}

export const getHexAddressingMap = (
  csl: WasmModuleProxy,
  wallet: YoroiWallet,
) => {
  const addressedUtxos = wallet.utxos.map((utxo: RawUtxo) => {
    const addressing = wallet.getAddressing(utxo.receiver)
    const hexAddress = normalizeToAddress(csl, utxo.receiver)?.toHex()

    return {addressing, hexAddress}
  })

  const addressing = addressedUtxos
  return addressing.reduce<{[addressHex: string]: Array<number>}>(
    (acc, curr) => {
      if (!curr.hexAddress) return acc
      acc[curr.hexAddress] = curr.addressing.path
      return acc
    },
    {},
  )
}

export const getAddressedUtxos = (wallet: YoroiWallet) => {
  return wallet.allUtxos.map(
    (utxo: RawUtxo): CardanoTypes.CardanoAddressedUtxo => {
      const addressing = wallet.getAddressing(utxo.receiver)

      return {
        addressing,
        txIndex: utxo.tx_index,
        txHash: utxo.tx_hash,
        amount: utxo.amount,
        receiver: utxo.receiver,
        utxoId: utxo.utxo_id,
        assets: utxo.assets,
      }
    },
  )
}
