/* eslint-disable no-empty */
import {SendToken} from '@emurgo/yoroi-lib'
import {Balance, Wallet} from '@yoroi/types'
import {BigNumber} from 'bignumber.js'
import {Buffer} from 'buffer'

import {YoroiEntry} from '../types'
import {BaseAsset, RawUtxo} from '../types/other'
import {DefaultAsset, Token} from '../types/tokens'
import {Amounts} from '../utils'
import {CardanoMobile} from '../wallets'
import {toAssetNameHex, toPolicyId} from './api/utils'
import {withMinAmounts} from './getMinAmounts'
import {MultiToken} from './MultiToken'
import {CardanoHaskellShelleyNetwork} from './networks'
import {NUMBERS} from './numbers'
import {CardanoTypes} from './types'

export const deriveRewardAddressHex = async (accountPubKeyHex: string, chainId: number): Promise<string> => {
  const accountPubKeyPtr = await CardanoMobile.Bip32PublicKey.fromBytes(Buffer.from(accountPubKeyHex, 'hex'))
  const stakingKey = await (
    await (await accountPubKeyPtr.derive(NUMBERS.CHAIN_DERIVATIONS.CHIMERIC_ACCOUNT)).derive(NUMBERS.STAKING_KEY_INDEX)
  ).toRawKey()
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

export const multiTokenFromRemote = (remoteValue: RemoteValue, networkId: number) => {
  const result = new MultiToken([], {
    defaultNetworkId: networkId,
    defaultIdentifier: '',
  })
  result.add({
    identifier: '',
    amount: new BigNumber(remoteValue.amount),
    networkId,
  })

  if (remoteValue.assets != null) {
    for (const token of remoteValue.assets) {
      result.add({
        identifier: token.assetId,
        amount: new BigNumber(token.amount),
        networkId,
      })
    }
  }

  return result
}

export const isByron = (implementation: Wallet.Implementation) => implementation === 'cardano-bip44'

export const isShelley = (implementation: Wallet.Implementation) => implementation === 'cardano-cip1852'

// need to accomodate base config parameters as required by certain API shared
// by yoroi extension and yoroi mobile
export const getCardanoBaseConfig = (
  networkConfig: CardanoHaskellShelleyNetwork,
): Array<{
  StartAt?: number
  GenesisDate?: string
  SlotsPerEpoch?: number
  SlotDuration?: number
}> => [
  {
    StartAt: networkConfig.BASE_CONFIG[0].START_AT,
    GenesisDate: networkConfig.BASE_CONFIG[0].GENESIS_DATE,
    SlotsPerEpoch: networkConfig.BASE_CONFIG[0].SLOTS_PER_EPOCH,
    SlotDuration: networkConfig.BASE_CONFIG[0].SLOT_DURATION,
  },
  {
    StartAt: networkConfig.BASE_CONFIG[1].START_AT,
    SlotsPerEpoch: networkConfig.BASE_CONFIG[1].SLOTS_PER_EPOCH,
    SlotDuration: networkConfig.BASE_CONFIG[1].SLOT_DURATION,
  },
]

export const toSendTokenList = (amounts: Balance.Amounts, primaryToken: Token): Array<SendToken> => {
  return Amounts.toArray(amounts).map(toSendToken(primaryToken))
}

export const toRecipients = async (entries: YoroiEntry[], primaryToken: DefaultAsset) => {
  return Promise.all(
    entries.map(async (entry) => {
      const amounts = await withMinAmounts(entry.address, entry.amounts, primaryToken)
      return {
        receiver: entry.address,
        tokens: toSendTokenList(amounts, primaryToken),
        datum: entry.datum,
      }
    }),
  )
}

export const toSendToken =
  (primaryToken: Token) =>
  (amount: Balance.Amount): SendToken => {
    const {tokenId, quantity} = amount
    const isPrimary = tokenId === primaryToken.identifier

    return {
      token: {
        networkId: primaryToken.networkId,
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
