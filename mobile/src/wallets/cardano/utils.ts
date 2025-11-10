import {invalid} from '@yoroi/common'
import {SendToken, TransactionOutput, normalizeToAddress} from '@yoroi/tx'
import {Balance, Chain, Portfolio, Wallet} from '@yoroi/types'

import {WasmModuleProxy} from '@emurgo/cross-csl-core'
import {BigNumber} from 'bignumber.js'
import {Buffer} from 'buffer'

import {BaseAsset, RawUtxo} from '../types/other'
import {Amounts} from '../utils/utils'
import {MultiToken} from './MultiToken'
import {identifierToCardanoAsset} from './assetHelpers'
import {withMinAmounts} from './getMinAmounts'
import {CardanoTypes, YoroiWallet} from './types'
import {CardanoMobileWrapped} from './wrappedCsl'

export const deriveRewardAddressHex = (
  accountPubKeyHex: string,
  chainId: number,
  role: number,
  index: number,
): string => {
  return CardanoMobileWrapped.cslScope((csl) => {
    const accountPubKeyPtr = csl.Bip32PublicKey.fromBytes(
      Buffer.from(accountPubKeyHex, 'hex'),
    )
    const stakingKey = accountPubKeyPtr.derive(role).derive(index).toRawKey()
    const credential = csl.Credential.fromKeyhash(stakingKey.hash())
    const rewardAddr = csl.RewardAddress.new(chainId, credential)
    const rewardAddrAsAddr = rewardAddr.toAddress()

    const result = Buffer.from(rewardAddrAsAddr.toBytes()).toString('hex')
    return result
  })
}

export const deriveRewardAddressFromAddress = (
  address: string,
  chainId: number,
): string => {
  return CardanoMobileWrapped.cslScope((csl) => {
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
  })
}

/**
 * Multi-asset related
 */

export const cardanoValueFromRemoteFormat = (
  utxo: RawUtxo,
  csl: WasmModuleProxy,
) => {
  const value = csl.Value.new(csl.BigNum.fromStr(utxo.amount))
  if (utxo.assets.length === 0) return value
  const assets = csl.MultiAsset.new()

  for (const remoteAsset of utxo.assets) {
    const {policyId, name} = identifierToCardanoAsset(remoteAsset.assetId)
    let policyContent = assets.get(policyId)
    policyContent = policyContent?.hasValue() ? policyContent : csl.Assets.new()
    policyContent.insert(name, csl.BigNum.fromStr(remoteAsset.amount))
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
  entries: TransactionOutput[],
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
  token: Balance.TokenInfo | Portfolio.Token.Info,
): token is Balance.TokenInfo => {
  return !!(token as Balance.TokenInfo).kind
}

export const generateCIP30UtxoCbor = (utxo: RawUtxo) => {
  return CardanoMobileWrapped.cslScope((csl) => {
    const txHash = csl.TransactionHash.fromBytes(
      Buffer.from(utxo.tx_hash, 'hex'),
    )
    if (!txHash) throw new Error('Invalid tx hash')

    const index = utxo.tx_index
    const input = csl.TransactionInput.new(txHash, index)
    const address = csl.Address.fromBech32(utxo.receiver)
    if (!address) throw new Error('Invalid address')

    const amount = csl.BigNum.fromStr(utxo.amount)
    if (!amount) throw new Error('Invalid amount')

    const collateral = csl.Value.new(amount)
    const output = csl.TransactionOutput.new(address, collateral)
    const transactionUnspentOutput = csl.TransactionUnspentOutput.new(
      input,
      output,
    )

    return transactionUnspentOutput.toHex()
  })
}

export const createRawTxSigningKey = (
  rootKey: string,
  derivationPath: number[],
  csl: WasmModuleProxy,
) => {
  if (derivationPath.length !== 5) throw new Error('Invalid derivation path')
  const masterKey = csl.Bip32PrivateKey.fromBytes(Buffer.from(rootKey, 'hex'))
  const accountPrivateKey = masterKey
    .derive(derivationPath[0]!)
    .derive(derivationPath[1]!)
    .derive(derivationPath[2]!)
    .derive(derivationPath[3]!)
    .derive(derivationPath[4]!)

  const rawKey = accountPrivateKey.toRawKey()
  const bech32 = rawKey.toBech32()

  const pkey = csl.PrivateKey.fromBech32(bech32)
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

export const getHexAddressingMap = async (
  wallet: YoroiWallet,
) => {
  const addressedUtxos = await Promise.all(
    wallet.utxos.map(async (utxo: RawUtxo) => {
      const addressing = wallet.getAddressing(utxo.receiver)
      const normalizedAddress = await normalizeToAddress(utxo.receiver)
      const hexAddress = normalizedAddress?.toHex()

      return {addressing, hexAddress}
    }),
  )

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

export const getPublicKeyHex = (wallet: YoroiWallet) => {
  const pkBytes = wallet.getStakingKey().hash().toBytes()
  return Buffer.from(pkBytes).toString('hex')
}
