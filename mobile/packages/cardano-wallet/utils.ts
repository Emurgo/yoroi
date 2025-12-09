import {RawUtxo} from '@yoroi/api'
import {getLogger, isHex} from '@yoroi/common'
import {primaryTokenId as defaultPrimaryTokenId} from '@yoroi/portfolio'
import {
  SendToken,
  TransactionOutput,
  normalizeToAddress,
  validateAndExtractAddressInfo,
} from '@yoroi/tx'
import {Balance, BaseAsset, Chain, Portfolio, Wallet} from '@yoroi/types'

import {WasmModuleProxy} from '@emurgo/cross-csl-core'
import {BigNumber} from 'bignumber.js'
import {Buffer} from 'buffer'

import {identifierToCardanoAsset} from './assetHelpers'
import {withMinAmounts} from './getMinAmounts'
import {CardanoTypes, YoroiWallet} from './types'
import {Amounts} from './utils/utils'
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
    // Handle Byron addresses (base58) - they don't have stake credentials
    if (csl.ByronAddress.isValid(address)) {
      throw new Error(
        `deriveRewardAddressFromAddress: Byron addresses do not support staking/reward addresses: ${address}`,
      )
    }

    // Parse address - supports hex or bech32
    const isHexAddr = isHex(address)
    const wasmAddress = isHexAddr
      ? csl.Address.fromHex(address)
      : csl.Address.fromBech32(address)

    if (!wasmAddress || wasmAddress.isMalformed()) {
      throw new Error(
        `deriveRewardAddressFromAddress: Invalid address format: ${address}`,
      )
    }

    const baseAddress = csl.BaseAddress.fromAddress(wasmAddress)
    if (!baseAddress) {
      throw new Error(
        `deriveRewardAddressFromAddress: Address is not a base address: ${address}`,
      )
    }

    const stakeCred = baseAddress.stakeCred()
    if (!stakeCred) {
      throw new Error(
        `deriveRewardAddressFromAddress: Failed to get stake credential from address: ${address}`,
      )
    }

    const rewardAddress = csl.RewardAddress.new(chainId, stakeCred)
    if (!rewardAddress) {
      throw new Error(
        `deriveRewardAddressFromAddress: Failed to create reward address`,
      )
    }

    const rewardAddressObj = rewardAddress.toAddress()
    if (!rewardAddressObj) {
      throw new Error(
        `deriveRewardAddressFromAddress: Failed to convert reward address to Address`,
      )
    }

    const result = rewardAddressObj.toBech32(undefined)
    if (typeof result !== 'string') {
      throw new Error('Its not possible to derive reward address')
    }
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
  // Validate amount
  if (
    !utxo.amount ||
    typeof utxo.amount !== 'string' ||
    utxo.amount.trim() === ''
  ) {
    throw new Error(
      `cardanoValueFromRemoteFormat: Invalid amount for UTXO. Expected non-empty string, got: ${utxo.amount}`,
    )
  }

  const amountBigNum = csl.BigNum.fromStr(utxo.amount)
  if (!amountBigNum) {
    throw new Error(
      `cardanoValueFromRemoteFormat: Failed to create BigNum from amount: ${utxo.amount}`,
    )
  }

  const value = csl.Value.new(amountBigNum)
  if (!value) {
    throw new Error(
      `cardanoValueFromRemoteFormat: Failed to create Value from amount: ${utxo.amount}`,
    )
  }

  if (utxo.assets.length === 0) return value
  const assets = csl.MultiAsset.new()

  for (const remoteAsset of utxo.assets) {
    // Validate asset data
    if (!remoteAsset.tokenId || !remoteAsset.amount) {
      getLogger().warn('cardanoValueFromRemoteFormat: Skipping invalid asset', {
        tokenId: remoteAsset.tokenId,
        amount: remoteAsset.amount,
      })
      continue
    }

    try {
      const {policyId, name} = identifierToCardanoAsset(
        csl,
        remoteAsset.tokenId,
      )
      if (!policyId || !name) {
        getLogger().warn(
          'cardanoValueFromRemoteFormat: Invalid asset identifier',
          {
            tokenId: remoteAsset.tokenId,
          },
        )
        continue
      }

      let policyContent = assets.get(policyId)
      policyContent = policyContent?.hasValue()
        ? policyContent
        : csl.Assets.new()

      // Validate asset amount
      if (!remoteAsset.amount || typeof remoteAsset.amount !== 'string') {
        getLogger().warn('cardanoValueFromRemoteFormat: Invalid asset amount', {
          tokenId: remoteAsset.tokenId,
          amount: remoteAsset.amount,
        })
        continue
      }

      const assetAmountBigNum = csl.BigNum.fromStr(remoteAsset.amount)
      if (!assetAmountBigNum) {
        getLogger().warn(
          'cardanoValueFromRemoteFormat: Failed to create BigNum for asset amount',
          {
            tokenId: remoteAsset.tokenId,
            amount: remoteAsset.amount,
          },
        )
        continue
      }

      policyContent.insert(name, assetAmountBigNum)
      assets.insert(policyId, policyContent)
    } catch (error) {
      getLogger().warn('cardanoValueFromRemoteFormat: Error processing asset', {
        tokenId: remoteAsset.tokenId,
        error: error instanceof Error ? error.message : String(error),
      })
      // Continue processing other assets
    }
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

export const amountsFromRemote = (
  remoteValue: RemoteValue,
): Balance.Amounts => {
  const amounts: Balance.Amounts = {} as Balance.Amounts

  // Add primary token (ADA)
  // remoteValue.amount is a string, Balance.Quantity is a branded string type
  amounts[defaultPrimaryTokenId] = remoteValue.amount as Balance.Quantity

  // Add other assets
  if (remoteValue.assets != null) {
    for (const token of remoteValue.assets) {
      // token.amount is now BalanceQuantity (String<'BalanceQuantity'>)
      amounts[token.tokenId as Portfolio.Token.Id] = token.amount
    }
  }

  return amounts
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
        identifier: tokenId as Portfolio.Token.Id,
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
    // Use normalizeToAddress to handle Byron (base58), Shelley (bech32), and hex addresses
    const address = normalizeToAddress(csl, utxo.receiver)
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

export const getHexAddressingMap = async (wallet: YoroiWallet) => {
  const addressedUtxos = await Promise.all(
    wallet.utxos().map(async (utxo: RawUtxo) => {
      const addressing = wallet.getAddressing(utxo.receiver)
      // Use validateAndExtractAddressInfo to safely extract hex without WASM pointer issues
      const addressInfo = await validateAndExtractAddressInfo(utxo.receiver)
      const hexAddress = addressInfo?.hex

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
  // Use wallet.utxos to exclude collateral UTXO from transaction operations
  // Collateral should not be used in regular transactions
  const primaryTokenId = wallet.portfolioPrimaryTokenInfo.id
  return wallet
    .utxos()
    .map((utxo: RawUtxo): CardanoTypes.CardanoAddressedUtxo => {
      const addressing = wallet.getAddressing(utxo.receiver)

      // Convert to modern Balance.Amounts format
      const balance: Balance.Amounts = {
        [primaryTokenId]: utxo.amount as Balance.Quantity,
      }
      for (const asset of utxo.assets) {
        balance[asset.tokenId] = asset.amount as Balance.Quantity
      }

      return {
        addressing,
        txIndex: utxo.tx_index,
        txHash: utxo.tx_hash,
        receiver: utxo.receiver,
        utxoId: utxo.utxo_id,
        balance,
      }
    })
}

export const getPublicKeyHex = (wallet: YoroiWallet) => {
  const pkBytes = wallet.getStakingKey().hash().toBytes()
  return Buffer.from(pkBytes).toString('hex')
}
