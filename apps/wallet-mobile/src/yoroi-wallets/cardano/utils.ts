/* eslint-disable no-empty */
import {SendToken} from '@emurgo/yoroi-lib'
import {isKeyOf} from '@yoroi/common'
import {Balance} from '@yoroi/types'
import {BigNumber} from 'bignumber.js'
import {Buffer} from 'buffer'

import {YoroiEntry} from '../types'
import {
  Addressing,
  BaseAsset,
  DERIVATION_TYPES,
  NetworkId,
  RawUtxo,
  WALLET_IMPLEMENTATION_REGISTRY,
  WalletImplementationId,
} from '../types/other'
import {DefaultAsset, Token} from '../types/tokens'
import {Amounts} from '../utils'
import {CardanoMobile} from '../wallets'
import {toAssetNameHex, toPolicyId} from './api/utils'
import {
  NETWORK_ID as mainnetId,
  WALLET_CONFIG as HASKELL_SHELLEY,
  WALLET_CONFIG_24 as HASKELL_SHELLEY_24,
} from './constants/mainnet/constants'
import {withMinAmounts} from './getMinAmounts'
import {MultiToken} from './MultiToken'
import {CardanoHaskellShelleyNetwork} from './networks'
import {NUMBERS} from './numbers'
import {CardanoTypes, WalletImplementation} from './types'

export const normalizeToAddress = async (addr: string) => {
  // in Shelley, addresses can be base16, bech32 or base58
  // in this function, we try parsing in all encodings possible
  // 1) Try converting from base58
  try {
    if (await CardanoMobile.ByronAddress.isValid(addr)) {
      return await (await CardanoMobile.ByronAddress.fromBase58(addr)).toAddress()
    }
  } catch (_e) {}

  // 2) If already base16, simply return
  try {
    return await CardanoMobile.Address.fromBytes(Buffer.from(addr, 'hex'))
  } catch (_e) {}

  // 3) Try converting from bech32
  try {
    return await CardanoMobile.Address.fromBech32(addr)
  } catch (_e) {}

  return undefined
}

// need to format shelley addresses as base16 but only legacy addresses as base58

export const verifyFromBip44Root = (request: Addressing['addressing']) => {
  const accountPosition = request.startLevel

  if (accountPosition !== NUMBERS.BIP44_DERIVATION_LEVELS.PURPOSE) {
    throw new Error('verifyFromBip44Root: addressing does not start from root')
  }

  const lastLevelSpecified = request.startLevel + request.path.length - 1

  if (lastLevelSpecified !== NUMBERS.BIP44_DERIVATION_LEVELS.ADDRESS) {
    throw new Error('verifyFromBip44Root: incorrect addressing size')
  }
}

export const deriveRewardAddressHex = async (accountPubKeyHex: string, networkId: NetworkId): Promise<string> => {
  const accountPubKeyPtr = await CardanoMobile.Bip32PublicKey.fromBytes(Buffer.from(accountPubKeyHex, 'hex'))
  const stakingKey = await (
    await (await accountPubKeyPtr.derive(NUMBERS.CHAIN_DERIVATIONS.CHIMERIC_ACCOUNT)).derive(NUMBERS.STAKING_KEY_INDEX)
  ).toRawKey()
  const credential = await CardanoMobile.Credential.fromKeyhash(await stakingKey.hash())
  const chainNetworkId = toCardanoNetworkId(networkId)
  const rewardAddr = await CardanoMobile.RewardAddress.new(chainNetworkId, credential)
  const rewardAddrAsAddr = await rewardAddr.toAddress()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = Buffer.from((await rewardAddrAsAddr.toBytes()) as any, 'hex').toString('hex')
  return result
}

/**
 * Multi-asset related
 */
const identifierToCardanoAsset = async (
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

export const cardanoValueFromMultiToken = async (tokens: MultiToken) => {
  const value = await CardanoMobile.Value.new(
    await CardanoMobile.BigNum.fromStr(tokens.getDefaultEntry().amount.toString()),
  )
  // recall: primary asset counts towards size
  if (tokens.size() === 1) return value
  const assets = await CardanoMobile.MultiAsset.new()

  for (const entry of tokens.nonDefaultEntries()) {
    const {policyId, name} = await identifierToCardanoAsset(entry.identifier)
    const asset = await assets.get(policyId)
    const policyContent = asset?.hasValue() ? asset : await CardanoMobile.Assets.new()

    await policyContent.insert(name, await CardanoMobile.BigNum.fromStr(entry.amount.toString()))
    // recall: we always have to insert since WASM returns copies of objects
    await assets.insert(policyId, policyContent)
  }

  if ((await assets.len()) > 0) {
    await value.setMultiasset(assets)
  }

  return value
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

/**
 * Wrapper function to lodash.isEmpty that
 * returns true if the string is empty.
 * The lodash.isEmpty function doesn't have the typescript's safeguard signature.
 * It will be fixed in this PR https://github.com/DefinitelyTyped/DefinitelyTyped/pull/60401
 *
 * @summary Returns true if the value is empty: length === 0, null or undefined, else false.
 *
 * @param value The string to inspect
 * @return {boolean} Returns true if the string is empty, else false.
 *
 * @example isEmptyString('') returns true
 * @example isEmptyString(' ') returns false
 * @example isEmptyString(null) returns true
 * @example isEmptyString(undefined) returns true
 */

export const isByron = (id: WalletImplementationId): boolean => id === WALLET_IMPLEMENTATION_REGISTRY.HASKELL_BYRON

export const isHaskellShelley = (id: WalletImplementationId): boolean =>
  id === HASKELL_SHELLEY.WALLET_IMPLEMENTATION_ID || id === HASKELL_SHELLEY_24.WALLET_IMPLEMENTATION_ID

export const isJormun = (id: WalletImplementationId): boolean => id === WALLET_IMPLEMENTATION_REGISTRY.JORMUNGANDR_ITN

export const getWalletConfigById = (id: WalletImplementationId): WalletImplementation => {
  const idx = Object.values(WALLET_IMPLEMENTATION_REGISTRY).indexOf(id)
  const walletKey = Object.keys(WALLET_IMPLEMENTATION_REGISTRY)[idx]
  if (walletKey != null && walletKey !== 'UNDEFINED' && isKeyOf(walletKey, WALLETS) && WALLETS[walletKey] != null) {
    return WALLETS[walletKey]
  }
  throw new Error('invalid walletImplementationId')
}

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

const _DEFAULT_DISCOVERY_SETTINGS = {
  DISCOVERY_GAP_SIZE: 20,
  DISCOVERY_BLOCK_SIZE: 50, // should be less than API limitations
  MAX_GENERATED_UNUSED: 20, // must be <= gap size
}

export const WALLETS = {
  HASKELL_BYRON: {
    WALLET_IMPLEMENTATION_ID: WALLET_IMPLEMENTATION_REGISTRY.HASKELL_BYRON,
    TYPE: DERIVATION_TYPES.BIP44,
    MNEMONIC_LEN: 15,
    ..._DEFAULT_DISCOVERY_SETTINGS,
  },
  HASKELL_SHELLEY,
  HASKELL_SHELLEY_24,
  JORMUNGANDR_ITN: {
    WALLET_IMPLEMENTATION_ID: WALLET_IMPLEMENTATION_REGISTRY.JORMUNGANDR_ITN,
    TYPE: DERIVATION_TYPES.CIP1852,
    MNEMONIC_LEN: 15,
    ..._DEFAULT_DISCOVERY_SETTINGS,
  },
} as const

export const CATALYST = {
  MIN_ADA: NUMBERS.LOVELACES_PER_ADA.times(450),
  DISPLAYED_MIN_ADA: NUMBERS.LOVELACES_PER_ADA.times(500),
  VOTING_ROUNDS: [
    {
      ROUND: 4,
      START_DATE: '2021-06-03T19:00:00Z',
      END_DATE: '2021-06-10T19:00:00Z',
    },
  ],
}

export const toCardanoNetworkId = (networkId: number) => {
  if (networkId === mainnetId) return 1

  return 0
}

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

export const selectFtOrThrow = (token: Balance.TokenInfo): Balance.TokenInfo => {
  if (token.kind === 'ft') {
    return token
  }
  throw new Error(`Token type "${token.kind}" is not a fungible token`)
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
