/**
 * Multiparty transaction builder
 * Builds transactions using UTXOs from multiple wallets
 * Supports both regular wallets and read-only wallets as inputs
 */
import {
  CardanoMobileWrapped,
  type YoroiWallet,
  convertRawUtxosToModernUtxos,
  createSendTx,
} from '@yoroi/cardano-wallet'
import {getLogger} from '@yoroi/logger'
import {MetadataDataValue, ModernUtxo, TransactionOutput} from '@yoroi/tx'
import type {Address} from '@yoroi/types'
import {TransactionCborHex, Wallet} from '@yoroi/types'

import {BigNumber} from 'bignumber.js'

import type {UnsignedTransaction} from '../transaction-builder/types'

/**
 * Input wallet information for multiparty transactions
 */
export type MultipartyInputWallet = {
  readonly walletId: string
  readonly wallet: YoroiWallet
  readonly meta: Wallet.Meta
}

/**
 * Parameters for building a multiparty transaction
 */
type BuildMultipartyTransactionParams = {
  readonly inputWallets: ReadonlyArray<MultipartyInputWallet>
  readonly entries: ReadonlyArray<TransactionOutput>
  readonly addressMode: Wallet.AddressMode
  readonly metadata?: Array<{
    readonly label: string
    readonly data: unknown
  }>
  readonly subtractFeeFromAmount?: boolean
}

/**
 * Result of building a multiparty transaction
 */
export type MultipartyTransactionResult = {
  readonly cbor: string
  readonly unsignedTx: UnsignedTransaction
  readonly requiredSigners: ReadonlyArray<{
    readonly walletId: string
    readonly keyHash: string
    readonly walletName: string
  }>
}

/**
 * Build a multiparty transaction using UTXOs from multiple wallets
 *
 * @param params - Multiparty transaction parameters
 * @returns Transaction CBOR and required signers information
 */
export const buildMultipartyTransaction = async ({
  inputWallets,
  entries,
  addressMode,
  metadata,
  subtractFeeFromAmount,
}: BuildMultipartyTransactionParams): Promise<MultipartyTransactionResult> => {
  const logger = getLogger()

  if (inputWallets.length === 0) {
    throw new Error('At least one input wallet is required')
  }

  if (inputWallets.length === 1) {
    // Single wallet - use standard transaction builder
    const inputWallet = inputWallets[0]
    if (!inputWallet) {
      throw new Error('Input wallet is required')
    }
    const {wallet} = inputWallet
    const modernUtxos = convertRawUtxosToModernUtxos(
      wallet.utxos(),
      (address: Address) => wallet.getAddressing(address as string),
      wallet.portfolioPrimaryTokenInfo.id,
    )

    const result = await createSendTx({
      utxos: modernUtxos,
      entries: [...entries],
      primaryTokenId: wallet.portfolioPrimaryTokenInfo.id,
      protocolParams: wallet.protocolParams,
      networkId: wallet.networkManager.chainId,
      getAbsoluteSlotNumber: async () => {
        const time = await wallet
          .checkServerStatus()
          .then(
            ({serverTime}: {serverTime?: number}) => serverTime || Date.now(),
          )
          .catch(() => Date.now())
        return new BigNumber(
          wallet.networkManager.epoch.progress(new Date(time)).absoluteSlot,
        )
      },
      getChangeAddress: (mode: Wallet.AddressMode) =>
        wallet.getChangeAddress(mode),
      addressMode,
      metadata: metadata?.map((meta) => ({
        label: String(meta.label),
        data: meta.data as MetadataDataValue,
      })),
      subtractFeeFromAmount,
    })

    // Extract required signers (single wallet - all inputs belong to this wallet)
    const requiredSigners = await extractRequiredSigners(
      result.cbor,
      inputWallets,
      new Map(), // Empty map for single wallet case
    )

    return {
      cbor: result.cbor,
      unsignedTx: {
        cbor: result.cbor as TransactionCborHex,
        inputs: [],
        outputs: [],
        certificates: [],
        withdrawals: [],
        referenceInputs: [],
        collateralInputs: [],
        options: {},
      },
      requiredSigners,
    }
  }

  // Multiple wallets - combine UTXOs from all wallets

  // Use the first wallet's network/protocol params (all should be on same network)
  if (inputWallets.length === 0) {
    throw new Error('At least one input wallet is required')
  }
  const primaryWallet = inputWallets[0]!.wallet
  const primaryTokenId = primaryWallet.portfolioPrimaryTokenInfo.id

  // Collect UTXOs from all wallets and track which wallet each UTXO belongs to
  const allUtxos: ModernUtxo[] = []

  // Map UTXO addresses to wallet IDs for signer extraction
  const utxoToWalletMap = new Map<
    string,
    {
      walletId: string
      walletName: string
      keyHash: string
    }
  >()

  for (const {wallet, meta, walletId} of inputWallets) {
    const modernUtxos = convertRawUtxosToModernUtxos(
      wallet.utxos(),
      (address: Address) => wallet.getAddressing(address as string),
      primaryTokenId,
    )

    // Track UTXO addresses for this wallet
    for (const modernUtxo of modernUtxos) {
      const address = modernUtxo.receiver
      // Extract key hash from address for this wallet
      // We'll extract it properly in extractRequiredSigners, but store the mapping here
      utxoToWalletMap.set(address, {
        walletId,
        walletName: meta.name,
        keyHash: '', // Will be extracted from address
      })
    }

    allUtxos.push(...modernUtxos)
  }

  // Build transaction using combined UTXOs
  const result = await createSendTx({
    utxos: allUtxos,
    entries: [...entries],
    primaryTokenId,
    protocolParams: primaryWallet.protocolParams,
    networkId: primaryWallet.networkManager.chainId,
    getAbsoluteSlotNumber: async () => {
      const time = await primaryWallet
        .checkServerStatus()
        .then(({serverTime}: {serverTime?: number}) => serverTime || Date.now())
        .catch(() => Date.now())
      return new BigNumber(
        primaryWallet.networkManager.epoch.progress(
          new Date(time),
        ).absoluteSlot,
      )
    },
    getChangeAddress: (mode: Wallet.AddressMode) => {
      // Use primary wallet's change address
      return primaryWallet.getChangeAddress(mode)
    },
    addressMode,
    metadata: metadata?.map((meta) => ({
      label: String(meta.label),
      data: meta.data as MetadataDataValue,
    })),
    subtractFeeFromAmount,
  })

  // Extract required signers from transaction inputs
  let requiredSigners: ReadonlyArray<{
    readonly walletId: string
    readonly keyHash: string
    readonly walletName: string
  }> = []
  try {
    requiredSigners = await extractRequiredSigners(
      result.cbor,
      inputWallets,
      utxoToWalletMap,
    )
  } catch (error) {
    logger.error(
      'buildMultipartyTransaction: Failed to extract required signers',
      {
        error: error instanceof Error ? error.message : String(error),
        cborLength: result.cbor.length,
        inputWalletsCount: inputWallets.length,
      },
    )
    // Don't throw - return empty array, but log the error
  }

  logger.debug('buildMultipartyTransaction: Transaction built', {
    cborLength: result.cbor.length,
    requiredSignersCount: requiredSigners.length,
  })

  return {
    cbor: result.cbor,
    unsignedTx: {
      cbor: result.cbor as TransactionCborHex,
      inputs: [],
      outputs: [],
      certificates: [],
      withdrawals: [],
      referenceInputs: [],
      collateralInputs: [],
      options: {},
    },
    requiredSigners,
  }
}

/**
 * Extract required signers from transaction CBOR
 * Maps key hashes to wallet IDs by analyzing transaction inputs
 */
const extractRequiredSigners = async (
  cbor: string,
  inputWallets: ReadonlyArray<MultipartyInputWallet>,
  _utxoToWalletMap?: Map<
    string,
    {
      walletId: string
      walletName: string
      keyHash: string
    }
  >,
): Promise<
  ReadonlyArray<{
    readonly walletId: string
    readonly keyHash: string
    readonly walletName: string
  }>
> => {
  return CardanoMobileWrapped.cslScope(async (csl) => {
    const tx = csl.Transaction.fromHex(cbor)
    if (!tx) {
      throw new Error('Failed to parse transaction CBOR')
    }

    const txBody = tx.body()
    const inputs = txBody.inputs()
    if (!inputs) {
      return []
    }

    const signersMap = new Map<
      string,
      {
        walletId: string
        walletName: string
      }
    >()

    // Build address-to-wallet mapping from input wallets
    const addressToWalletMap = new Map<
      string,
      {
        walletId: string
        walletName: string
      }
    >()

    for (const {wallet, meta, walletId} of inputWallets) {
      const addresses = [
        ...wallet.externalAddresses(),
        ...wallet.internalAddresses(),
      ]

      for (const address of addresses) {
        try {
          // Addresses from wallets are already bech32 format (Address branded type)
          // We can use them directly with fromBech32 since Address extends string
          const addressStr = address as string
          const addr = csl.Address.fromBech32(addressStr)
          if (!addr) {
            continue
          }

          addressToWalletMap.set(addressStr, {
            walletId,
            walletName: meta.name,
          })

          // Extract key hash for this address - try different address types
          let keyHashHex: string | null = null

          const baseAddr = csl.BaseAddress.fromAddress(addr)
          if (baseAddr) {
            const paymentCred = baseAddr.paymentCred()
            const keyHash = paymentCred.toKeyhash()
            if (keyHash) {
              keyHashHex = keyHash.toHex()
            }
          } else {
            const enterpriseAddr = csl.EnterpriseAddress.fromAddress(addr)
            if (enterpriseAddr) {
              const paymentCred = enterpriseAddr.paymentCred()
              const keyHash = paymentCred.toKeyhash()
              if (keyHash) {
                keyHashHex = keyHash.toHex()
              }
            } else {
              const pointerAddr = csl.PointerAddress.fromAddress(addr)
              if (pointerAddr) {
                const paymentCred = pointerAddr.paymentCred()
                const keyHash = paymentCred.toKeyhash()
                if (keyHash) {
                  keyHashHex = keyHash.toHex()
                }
              }
            }
          }

          if (keyHashHex) {
            if (!signersMap.has(keyHashHex)) {
              signersMap.set(keyHashHex, {
                walletId,
                walletName: meta.name,
              })
            }
          }
        } catch {
          // Skip invalid addresses
          continue
        }
      }
    }

    // Convert map to array - deduplicate by walletId
    // Since multiple addresses from the same wallet can have the same key hash,
    // we want one signer per wallet
    const walletSignersMap = new Map<
      string,
      {
        walletId: string
        keyHash: string
        walletName: string
      }
    >()

    for (const [keyHash, info] of signersMap.entries()) {
      if (!walletSignersMap.has(info.walletId)) {
        walletSignersMap.set(info.walletId, {
          walletId: info.walletId,
          keyHash,
          walletName: info.walletName,
        })
      }
    }

    return Array.from(walletSignersMap.values())
  })
}
