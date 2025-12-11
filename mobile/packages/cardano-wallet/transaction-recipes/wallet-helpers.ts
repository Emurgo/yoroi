import {getLogger} from '@yoroi/logger'
import {TransactionOutput} from '@yoroi/tx'
import type {DRepValue} from '@yoroi/tx'
import {Branded, KeyHash, Network, PublicKeyHex, Wallet} from '@yoroi/types'

import type {Certificate} from '@emurgo/cross-csl-core'
import {BigNumber} from 'bignumber.js'

import * as legacyApi from '../api/api'
import type {CardanoTypes} from '../types'
import type {YoroiWallet} from '../types'
import {createCombinedDelegationTx} from './createCombinedDelegationTx'
import {createDelegationTx} from './createDelegationTx'
import {createSendTx} from './createSendTx'
import {createUnsignedGovernanceTx} from './createUnsignedGovernanceTx'
import {createUtxoConsolidationTx} from './createUtxoConsolidationTx'
import {createVotingRegTx} from './createVotingRegTx'
import {createWithdrawalTx} from './createWithdrawalTx'
import {createWithdrawalWithGovernanceTx} from './createWithdrawalWithGovernanceTx'
import {convertRawUtxosToModernUtxos} from './helpers'

/**
 * Helper to get absolute slot number from wallet
 */
async function getAbsoluteSlotNumberFromWallet(
  wallet: YoroiWallet,
): Promise<BigNumber> {
  const time = await wallet
    .checkServerStatus()
    .then(({serverTime}) => serverTime || Date.now())
    .catch(() => Date.now())
  return new BigNumber(
    wallet.networkManager.epoch.progress(new Date(time)).absoluteSlot,
  )
}

/**
 * Helper to get modern UTXOs from wallet
 * Excludes collateral UTXO to prevent it from being used in regular transactions
 */
function getModernUtxosFromWallet(wallet: YoroiWallet) {
  return convertRawUtxosToModernUtxos(
    wallet.utxos(), // Use wallet.utxos instead of allUtxos to exclude collateral
    (address) => wallet.getAddressing(address),
    wallet.portfolioPrimaryTokenInfo.id,
  )
}

/**
 * Create UTXO consolidation transaction from wallet
 */
export async function createUtxoConsolidationTxFromWallet(
  wallet: YoroiWallet,
  params: {addressMode: Wallet.AddressMode},
): Promise<{cbor: string}> {
  const modernUtxos = getModernUtxosFromWallet(wallet)
  const externalAddresses = wallet
    .externalAddresses()
    .map((addr) => Branded.asAddress(addr))

  try {
    const result = await createUtxoConsolidationTx({
      utxos: modernUtxos,
      externalAddresses,
      primaryTokenId: wallet.portfolioPrimaryTokenInfo.id,
      protocolParams: wallet.protocolParams,
      networkId: wallet.networkManager.chainId,
      getAbsoluteSlotNumber: () => getAbsoluteSlotNumberFromWallet(wallet),
      getChangeAddress: (mode) => wallet.getChangeAddress(mode),
      addressMode: params.addressMode,
    })

    return result
  } catch (error) {
    getLogger().error(
      'createUtxoConsolidationTxFromWallet: Failed to create consolidation transaction',
      {
        error: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        utxosCount: modernUtxos.length,
      },
    )
    throw error
  }
}

/**
 * Create delegation transaction from wallet
 */
export async function createDelegationTxFromWallet(
  wallet: YoroiWallet,
  params: {
    poolId: KeyHash | string | undefined
    addressMode: Wallet.AddressMode
  },
): Promise<{cbor: string}> {
  const modernUtxos = getModernUtxosFromWallet(wallet)

  return createDelegationTx({
    utxos: modernUtxos,
    primaryTokenId: wallet.portfolioPrimaryTokenInfo.id,
    protocolParams: wallet.protocolParams,
    networkId: wallet.networkManager.chainId,
    getAbsoluteSlotNumber: () => getAbsoluteSlotNumberFromWallet(wallet),
    getChangeAddress: (mode) => wallet.getChangeAddress(mode),
    getStakingKey: () => wallet.getStakingKey(),
    getDelegationStatus: () => wallet.getDelegationStatus(),
    poolId: params.poolId,
    addressMode: params.addressMode,
  })
}

/**
 * Create combined delegation transaction from wallet (stake pool + DRep vote)
 */
export async function createCombinedDelegationTxFromWallet(
  wallet: YoroiWallet,
  params: {
    poolId?: KeyHash | string
    drepValue?: DRepValue
    addressMode: Wallet.AddressMode
  },
): Promise<{cbor: string}> {
  const modernUtxos = getModernUtxosFromWallet(wallet)

  return createCombinedDelegationTx({
    utxos: modernUtxos,
    primaryTokenId: wallet.portfolioPrimaryTokenInfo.id,
    protocolParams: wallet.protocolParams,
    networkId: wallet.networkManager.chainId,
    getAbsoluteSlotNumber: () => getAbsoluteSlotNumberFromWallet(wallet),
    getChangeAddress: (mode) => wallet.getChangeAddress(mode),
    getStakingKey: () => wallet.getStakingKey(),
    getDelegationStatus: () => wallet.getDelegationStatus(),
    poolId: params.poolId,
    drepValue: params.drepValue,
    addressMode: params.addressMode,
  })
}

/**
 * Create withdrawal transaction from wallet
 */
export async function createWithdrawalTxFromWallet(
  wallet: YoroiWallet,
  params: {
    shouldDeregister: boolean
    addressMode: Wallet.AddressMode
    networkManager: Network.Manager
  },
): Promise<{cbor: string}> {
  getLogger().info(
    'createWithdrawalTxFromWallet: Starting withdrawal transaction creation',
    {
      shouldDeregister: params.shouldDeregister,
      addressMode: params.addressMode,
      rewardAddressHex: wallet.rewardAddressHex,
      networkId: wallet.networkManager.chainId,
    },
  )

  const modernUtxos = getModernUtxosFromWallet(wallet)
  getLogger().info('createWithdrawalTxFromWallet: Got modern UTXOs', {
    utxosCount: modernUtxos.length,
  })

  try {
    const result = await createWithdrawalTx({
      utxos: modernUtxos,
      rewardAddressHex: wallet.rewardAddressHex,
      primaryTokenId: wallet.portfolioPrimaryTokenInfo.id,
      protocolParams: wallet.protocolParams,
      networkId: wallet.networkManager.chainId,
      getAbsoluteSlotNumber: () => getAbsoluteSlotNumberFromWallet(wallet),
      getChangeAddress: (mode) => wallet.getChangeAddress(mode),
      getStakingKey: () => wallet.getStakingKey(),
      getAccountState: (addresses) => {
        // Get wallet context for backend-zero registration
        const walletContextRaw = wallet.getWalletContext?.()
        const walletContext = walletContextRaw
          ? {
              ...walletContextRaw,
              publicKeyHex: walletContextRaw.publicKeyHex
                ? Branded.asPublicKeyHex(walletContextRaw.publicKeyHex)
                : undefined,
              accountPubKeyHex: walletContextRaw.accountPubKeyHex
                ? Branded.asPublicKeyHex(walletContextRaw.accountPubKeyHex)
                : undefined,
              paymentKeyHashes: walletContextRaw.paymentKeyHashes.map((hash) =>
                Branded.asKeyHash(hash),
              ),
              rewardAddresses: walletContextRaw.rewardAddresses.map((addr) =>
                Branded.asAddress(addr),
              ),
            }
          : undefined
        return legacyApi.getAccountState(
          {addresses},
          params.networkManager.legacyApiBaseUrl,
          walletContext,
        )
      },
      shouldDeregister: params.shouldDeregister,
      addressMode: params.addressMode,
    })

    getLogger().info(
      'createWithdrawalTxFromWallet: Transaction created successfully',
      {
        cborLength: result.cbor.length,
      },
    )

    return result
  } catch (error) {
    getLogger().error(
      'createWithdrawalTxFromWallet: Failed to create withdrawal transaction',
      {
        error: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        rewardAddressHex: wallet.rewardAddressHex,
        shouldDeregister: params.shouldDeregister,
      },
    )
    throw error
  }
}

export async function createVotingRegTxFromWallet(
  wallet: YoroiWallet,
  params: {
    catalystKeyHex: PublicKeyHex | string
    supportsCIP36: boolean
    addressMode: Wallet.AddressMode
  },
): Promise<{votingRegTx: {cbor: string}}> {
  const modernUtxos = getModernUtxosFromWallet(wallet)

  return createVotingRegTx({
    utxos: modernUtxos,
    primaryTokenId: wallet.portfolioPrimaryTokenInfo.id,
    protocolParams: wallet.protocolParams,
    networkId: wallet.networkManager.chainId,
    getAbsoluteSlotNumber: () => getAbsoluteSlotNumberFromWallet(wallet),
    getChangeAddress: (mode) => wallet.getChangeAddress(mode),
    getStakingKey: () => wallet.getStakingKey(),
    getFirstPaymentAddress: () => wallet.getFirstPaymentAddress(),
    supportsCIP36: params.supportsCIP36,
    catalystKeyHex: params.catalystKeyHex,
    addressMode: params.addressMode,
  })
}

/**
 * Create unsigned governance transaction from wallet
 */
export async function createUnsignedGovernanceTxFromWallet(
  wallet: YoroiWallet,
  params: {
    votingCertificates: Array<Certificate>
    addressMode: Wallet.AddressMode
  },
): Promise<{cbor: string}> {
  const modernUtxos = getModernUtxosFromWallet(wallet)

  return createUnsignedGovernanceTx({
    utxos: modernUtxos,
    primaryTokenId: wallet.portfolioPrimaryTokenInfo.id,
    protocolParams: wallet.protocolParams,
    networkId: wallet.networkManager.chainId,
    getAbsoluteSlotNumber: () => getAbsoluteSlotNumberFromWallet(wallet),
    getChangeAddress: (mode) => wallet.getChangeAddress(mode),
    votingCertificates: params.votingCertificates as CardanoTypes.Certificate[],
    addressMode: params.addressMode,
  })
}

/**
 * Create send transaction from wallet
 */
export async function createSendTxFromWallet(
  wallet: YoroiWallet,
  params: {
    entries: TransactionOutput[]
    addressMode: Wallet.AddressMode
    metadata?: Array<CardanoTypes.TxMetadata>
    /**
     * If true, subtract transaction fee from the primary token amount in the first output.
     * This is useful when sending MAX amount - the output will be automatically adjusted
     * to account for fees, ensuring the transaction can be built successfully.
     */
    subtractFeeFromAmount?: boolean
  },
): Promise<{cbor: string}> {
  const modernUtxos = getModernUtxosFromWallet(wallet)

  return createSendTx({
    utxos: modernUtxos,
    entries: params.entries,
    primaryTokenId: wallet.portfolioPrimaryTokenInfo.id,
    protocolParams: wallet.protocolParams,
    networkId: wallet.networkManager.chainId,
    getAbsoluteSlotNumber: () => getAbsoluteSlotNumberFromWallet(wallet),
    getChangeAddress: (mode) => wallet.getChangeAddress(mode),
    addressMode: params.addressMode,
    metadata: params.metadata?.map((meta) => ({
      label: String(meta.label),
      data: meta.data,
    })),
    subtractFeeFromAmount: params.subtractFeeFromAmount,
  })
}

/**
 * Create withdrawal with governance transaction from wallet
 * Combines rewards withdrawal with DRep vote delegation in a single transaction
 */
export async function createWithdrawalWithGovernanceTxFromWallet(
  wallet: YoroiWallet,
  params: {
    shouldDeregister: boolean
    addressMode: Wallet.AddressMode
    networkManager: Network.Manager
    drepValue: DRepValue
  },
): Promise<{cbor: string}> {
  const modernUtxos = getModernUtxosFromWallet(wallet)

  getLogger().info(
    'createWithdrawalWithGovernanceTxFromWallet: Starting combined tx creation',
    {
      shouldDeregister: params.shouldDeregister,
      addressMode: params.addressMode,
      rewardAddressHex: wallet.rewardAddressHex,
      networkId: wallet.networkManager.chainId,
      drepValue: params.drepValue,
    },
  )

  try {
    const result = await createWithdrawalWithGovernanceTx({
      utxos: modernUtxos,
      rewardAddressHex: wallet.rewardAddressHex,
      primaryTokenId: wallet.portfolioPrimaryTokenInfo.id,
      protocolParams: wallet.protocolParams,
      networkId: wallet.networkManager.chainId,
      getAbsoluteSlotNumber: () => getAbsoluteSlotNumberFromWallet(wallet),
      getChangeAddress: (mode) => wallet.getChangeAddress(mode),
      getStakingKey: () => wallet.getStakingKey(),
      getAccountState: (addresses) => {
        const walletContextRaw = wallet.getWalletContext?.()
        const walletContext = walletContextRaw
          ? {
              ...walletContextRaw,
              publicKeyHex: walletContextRaw.publicKeyHex
                ? Branded.asPublicKeyHex(walletContextRaw.publicKeyHex)
                : undefined,
              accountPubKeyHex: walletContextRaw.accountPubKeyHex
                ? Branded.asPublicKeyHex(walletContextRaw.accountPubKeyHex)
                : undefined,
              paymentKeyHashes: walletContextRaw.paymentKeyHashes.map((hash) =>
                Branded.asKeyHash(hash),
              ),
              rewardAddresses: walletContextRaw.rewardAddresses.map((addr) =>
                Branded.asAddress(addr),
              ),
            }
          : undefined
        return legacyApi.getAccountState(
          {addresses},
          params.networkManager.legacyApiBaseUrl,
          walletContext,
        )
      },
      getDelegationStatus: () => wallet.getDelegationStatus(),
      shouldDeregister: params.shouldDeregister,
      addressMode: params.addressMode,
      drepValue: params.drepValue,
    })

    getLogger().info(
      'createWithdrawalWithGovernanceTxFromWallet: Transaction created successfully',
      {
        cborLength: result.cbor.length,
      },
    )

    return result
  } catch (error) {
    getLogger().error(
      'createWithdrawalWithGovernanceTxFromWallet: Failed to create transaction',
      {
        error: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        shouldDeregister: params.shouldDeregister,
      },
    )
    throw error
  }
}
