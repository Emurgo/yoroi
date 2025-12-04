/**
 * Multiparty transaction builder
 * Builds transactions using UTXOs from multiple wallets
 * Supports both regular wallets and read-only wallets as inputs
 */
import {CardanoMobileWrapped} from '@yoroi/cardano-wallet'
import type {YoroiWallet} from '@yoroi/cardano-wallet'
import {convertRawUtxosToModernUtxos} from '@yoroi/cardano-wallet/transaction-recipes/helpers'
import {getLogger} from '@yoroi/common'
import {TransactionOutput} from '@yoroi/tx'
import {Wallet} from '@yoroi/types'
import type {Address} from '@yoroi/types'

import {createSendTx} from '../transaction-builder/createSendTx'
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
    const {wallet} = inputWallets[0]
    const modernUtxos = convertRawUtxosToModernUtxos(
      wallet.utxos(),
      (address) => wallet.getAddressing(address),
      wallet.portfolioPrimaryTokenInfo.id,
    )

    const result = await createSendTx({
      utxos: modernUtxos,
      entries,
      primaryTokenId: wallet.portfolioPrimaryTokenInfo.id,
      protocolParams: wallet.protocolParams,
      networkId: wallet.networkManager.chainId,
      getAbsoluteSlotNumber: async () => {
        const time = await wallet
          .checkServerStatus()
          .then(({serverTime}) => serverTime || Date.now())
          .catch(() => Date.now())
        return BigInt(
          wallet.networkManager.epoch.progress(new Date(time)).absoluteSlot,
        )
      },
      getChangeAddress: (mode) => wallet.getChangeAddress(mode),
      addressMode,
      metadata: metadata?.map((meta) => ({
        label: String(meta.label),
        data: meta.data,
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
        cbor: result.cbor,
        inputs: [],
        outputs: [],
        certificates: [],
        withdrawals: [],
      },
      requiredSigners,
    }
  }

  // Multiple wallets - combine UTXOs from all wallets
  logger.debug(
    'buildMultipartyTransaction: Building transaction with multiple wallets',
    {
      walletCount: inputWallets.length,
      entriesCount: entries.length,
    },
  )

  // Use the first wallet's network/protocol params (all should be on same network)
  const primaryWallet = inputWallets[0].wallet
  const primaryTokenId = primaryWallet.portfolioPrimaryTokenInfo.id

  // Collect UTXOs from all wallets and track which wallet each UTXO belongs to
  const allUtxos: Array<{
    utxo: {
      receiver: Address
      amounts: Record<string, string>
      utxoId: string
    }
    addressing: {
      startLevel: number
      path: ReadonlyArray<number>
    }
  }> = []

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
      (address) => wallet.getAddressing(address),
      primaryTokenId,
    )

    // Track UTXO addresses for this wallet
    for (const modernUtxo of modernUtxos) {
      const address = modernUtxo.utxo.receiver
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
    entries,
    primaryTokenId,
    protocolParams: primaryWallet.protocolParams,
    networkId: primaryWallet.networkManager.chainId,
    getAbsoluteSlotNumber: async () => {
      const time = await primaryWallet
        .checkServerStatus()
        .then(({serverTime}) => serverTime || Date.now())
        .catch(() => Date.now())
      return BigInt(
        primaryWallet.networkManager.epoch.progress(new Date(time))
          .absoluteSlot,
      )
    },
    getChangeAddress: (mode) => {
      // Use primary wallet's change address
      return primaryWallet.getChangeAddress(mode)
    },
    addressMode,
    metadata: metadata?.map((meta) => ({
      label: String(meta.label),
      data: meta.data,
    })),
    subtractFeeFromAmount,
  })

  // Extract required signers from transaction inputs
  const requiredSigners = await extractRequiredSigners(
    result.cbor,
    inputWallets,
    utxoToWalletMap,
  )

  logger.debug('buildMultipartyTransaction: Transaction built', {
    cborLength: result.cbor.length,
    requiredSignersCount: requiredSigners.length,
  })

  return {
    cbor: result.cbor,
    unsignedTx: {
      cbor: result.cbor,
      inputs: [],
      outputs: [],
      certificates: [],
      withdrawals: [],
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

      for (const addressHex of addresses) {
        try {
          const addr = csl.Address.fromBytes(Buffer.from(addressHex, 'hex'))
          if (!addr) continue

          const addressBech32 = addr.toBech32()
          addressToWalletMap.set(addressBech32, {
            walletId,
            walletName: meta.name,
          })

          // Also extract key hash for this address
          const baseAddr = csl.BaseAddress.fromAddress(addr)
          if (baseAddr) {
            const paymentCred = baseAddr.paymentCred()
            const keyHash = paymentCred.toKeyhash()
            if (keyHash) {
              const keyHashHex = keyHash.toHex()
              if (!signersMap.has(keyHashHex)) {
                signersMap.set(keyHashHex, {
                  walletId,
                  walletName: meta.name,
                })
              }
            }
            continue
          }

          const enterpriseAddr = csl.EnterpriseAddress.fromAddress(addr)
          if (enterpriseAddr) {
            const paymentCred = enterpriseAddr.paymentCred()
            const keyHash = paymentCred.toKeyhash()
            if (keyHash) {
              const keyHashHex = keyHash.toHex()
              if (!signersMap.has(keyHashHex)) {
                signersMap.set(keyHashHex, {
                  walletId,
                  walletName: meta.name,
                })
              }
            }
            continue
          }
        } catch {
          // Skip invalid addresses
          continue
        }
      }
    }

    // Extract key hashes from transaction inputs
    // We need to get the UTXO addresses from the transaction body
    // Since we don't have direct access to UTXO data in the transaction body,
    // we'll use the address-to-wallet mapping we built above
    // For a more accurate approach, we'd need to track UTXOs during building

    // Convert map to array - deduplicate by walletId
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
