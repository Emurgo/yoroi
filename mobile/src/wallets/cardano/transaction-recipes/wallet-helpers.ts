import {getLogger} from '@yoroi/common'
import {TransactionOutput} from '@yoroi/tx'
import {Network, Wallet} from '@yoroi/types'

import {BigNumber} from 'bignumber.js'

import * as legacyApi from '~/wallets/cardano/api/api'
import {CardanoTypes, YoroiWallet} from '~/wallets/cardano/types'

import {
  convertRawUtxosToModernUtxos,
  createDelegationTx,
  createSendTx,
  createUnsignedGovernanceTx,
  createUtxoConsolidationTx,
  createVotingRegTx,
  createWithdrawalTx,
} from './index'

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
    wallet.utxos, // Use wallet.utxos instead of allUtxos to exclude collateral
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

  return createUtxoConsolidationTx({
    utxos: modernUtxos,
    externalAddresses: wallet.externalAddresses,
    primaryTokenId: wallet.portfolioPrimaryTokenInfo.id,
    protocolParams: wallet.protocolParams,
    networkId: wallet.networkManager.chainId,
    getAbsoluteSlotNumber: () => getAbsoluteSlotNumberFromWallet(wallet),
    getChangeAddress: (mode) => wallet.getChangeAddress(mode),
    addressMode: params.addressMode,
  })
}

/**
 * Create delegation transaction from wallet
 */
export async function createDelegationTxFromWallet(
  wallet: YoroiWallet,
  params: {
    poolId: string | undefined
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
  const logger = getLogger()

  logger.info(
    'createWithdrawalTxFromWallet: Starting withdrawal transaction creation',
    {
      shouldDeregister: params.shouldDeregister,
      addressMode: params.addressMode,
      rewardAddressHex: wallet.rewardAddressHex,
      networkId: wallet.networkManager.chainId,
    },
  )

  const modernUtxos = getModernUtxosFromWallet(wallet)
  logger.info('createWithdrawalTxFromWallet: Got modern UTXOs', {
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
      getAccountState: (addresses) =>
        legacyApi.getAccountState(
          {addresses},
          params.networkManager.legacyApiBaseUrl,
        ),
      shouldDeregister: params.shouldDeregister,
      addressMode: params.addressMode,
    })

    logger.info(
      'createWithdrawalTxFromWallet: Transaction created successfully',
      {
        cborLength: result.cbor.length,
      },
    )

    return result
  } catch (error) {
    logger.error(
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

/**
 * Create voting registration transaction from wallet
 */
export async function createVotingRegTxFromWallet(
  wallet: YoroiWallet,
  params: {
    catalystKeyHex: string
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
    votingCertificates: Array<import('@emurgo/cross-csl-core').Certificate>
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
