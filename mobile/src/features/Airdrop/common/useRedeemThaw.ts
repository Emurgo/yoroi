import {RawUtxo} from '@yoroi/api'
import {CardanoMobileWrapped} from '@yoroi/cardano-wallet'
import type {SelectionStrategy} from '@yoroi/tx'
import {rawUtxoToModernUtxo, selectUtxos} from '@yoroi/tx'
import {Balance} from '@yoroi/types'
import {useWalletManager} from '@yoroi/wallet-manager'

import type {Transaction, WasmModuleProxy} from '@emurgo/cross-csl-core'
import {useMutation, useQueryClient} from '@tanstack/react-query'
import {Buffer} from 'buffer'

import {persistPrefixKeyword} from '~/kernel/connection/ConnectionProvider'
import {logger} from '~/kernel/logger/logger'

import {redemptionApi} from '../api/redemptionApi'
import type {BuildTransactionRequest} from '../types'

/**
 * Hook for redeeming thawed NIGHT tokens
 *
 * The API builds the transaction, so we need to:
 * - Select UTXOs with enough ADA for fees
 * - Convert wallet UTXOs to the format expected by the API
 * - Build transaction via API (returns CBOR)
 * - Signing and submission handled by review transaction flow
 */
export const useRedeemThaw = () => {
  const walletManager = useWalletManager()
  const queryClient = useQueryClient()
  const wallet = walletManager.selected.wallet
  const meta = walletManager.selected.meta

  /**
   * Build a redemption transaction
   * Returns the unsigned transaction CBOR
   */
  const buildTransactionMutation = useMutation({
    mutationFn: async (destAddress: string): Promise<string> => {
      if (!wallet || !meta) {
        logger.error('useRedeemThaw: Wallet or meta not available', {
          hasWallet: !!wallet,
          hasMeta: !!meta,
          walletId: wallet?.id,
        })
        throw new Error('Wallet not available')
      }

      // Readonly wallets cannot sign transactions
      if (meta.isReadOnly) {
        throw new Error('Cannot redeem tokens from a readonly wallet')
      }

      // Get UTXOs for funding - need enough ADA to cover transaction fees
      // Similar to swap, we request UTXOs that can cover ~5 ADA for fees
      const primaryTokenId = wallet.portfolioPrimaryTokenInfo.id
      const feeAmount: Balance.Amounts = {
        [primaryTokenId]: '5000000' as Balance.Quantity, // 5 ADA in lovelace
      }

      const fundingUtxosHex = await CardanoMobileWrapped.cslScope(
        async (csl) => {
          // Convert RawUtxo[] to ModernUtxo[] using current pattern
          const rawUtxos = wallet.utxos()

          const modernUtxos = rawUtxos.map((rawUtxo: RawUtxo) => {
            const addressing = wallet.getAddressing(rawUtxo.receiver)
            return rawUtxoToModernUtxo(
              rawUtxo as Parameters<typeof rawUtxoToModernUtxo>[0],
              addressing,
              undefined, // derivationPath
              primaryTokenId,
            )
          })

          // Select UTXOs using keepRelevant strategy (same as swap)
          const selection = selectUtxos(
            feeAmount,
            modernUtxos,
            'keepRelevant' as SelectionStrategy,
            primaryTokenId,
          )

          if (
            selection.selected.length === 0 ||
            Object.keys(selection.missingAmounts).length > 0
          ) {
            logger.info('useRedeemThaw: Insufficient UTXOs', {
              selectedCount: selection.selected.length,
              missingAmounts: selection.missingAmounts,
            })
            throw new Error('No UTXOs available with sufficient funds')
          }

          // Convert ModernUtxo to hex strings using toTransactionUnspentOutput
          const utxoHexStrings = await Promise.all(
            selection.selected.map(async (utxo) => {
              const cslUtxo = utxo.toTransactionUnspentOutput(csl)
              return Buffer.from(cslUtxo.toBytes()).toString('hex')
            }),
          )

          return utxoHexStrings
        },
      )

      // Get change address
      const changeAddress = wallet.getChangeAddress('multiple')

      // Build transaction request
      const buildRequest: BuildTransactionRequest = {
        change_address: changeAddress,
        funding_utxos: fundingUtxosHex,
        collateral_utxos: [],
      }

      logger.info(
        'useRedeemThaw.buildTransaction: Requesting transaction build',
        {
          destAddress,
          changeAddress,
          fundingUtxosCount: fundingUtxosHex.length,
          collateralUtxosCount: buildRequest.collateral_utxos.length,
        },
      )

      // Build transaction
      const buildResponse = await redemptionApi.buildTransaction(
        destAddress,
        buildRequest,
      )

      logger.info(
        'useRedeemThaw.buildTransaction: Received transaction build response',
        {
          destAddress,
          redeemedAmount: buildResponse.redeemed_amount,
          requireThawingExtraSignature:
            buildResponse.require_thawing_extra_signature,
          transactionId: buildResponse.transaction_id,
          transactionCborLength: buildResponse.transaction.length,
          transactionCborPreview: `${buildResponse.transaction.substring(0, 64)}...`,
        },
      )

      return buildResponse.transaction
    },
    onError: (error) => {
      logger.info('Failed to build redemption transaction', {error})
    },
  })

  /**
   * Submit a signed redemption transaction to the redemption API
   * Takes signed transaction bytes and extracts witness set for submission
   */
  const submitTransactionMutation = useMutation({
    mutationFn: async ({
      destAddress,
      signedTx,
    }: {
      destAddress: string
      signedTx: Transaction | ((csl: WasmModuleProxy) => Transaction)
    }): Promise<string> => {
      if (!wallet) {
        logger.error('useRedeemThaw.submitTransaction: Wallet not available')
        throw new Error('Wallet not available')
      }

      // Get signed transaction bytes
      const signedTxBytes = await CardanoMobileWrapped.cslScope((csl) => {
        const tx = typeof signedTx === 'function' ? signedTx(csl) : signedTx
        return tx.toBytes()
      })

      const signedTxHex = Buffer.from(signedTxBytes).toString('hex')

      // Extract witness set from signed transaction
      const witnessSetHex = CardanoMobileWrapped.cslScope((csl) => {
        const tx = csl.Transaction.fromBytes(signedTxBytes)
        const witnessSet = tx.witnessSet()
        if (!witnessSet) {
          logger.error(
            'useRedeemThaw.submitTransaction: Failed to extract witness set',
            {
              destAddress,
            },
          )
          throw new Error(
            'Failed to extract witness set from signed transaction',
          )
        }
        const witnessSetBytes = witnessSet.toBytes()
        return Buffer.from(witnessSetBytes).toString('hex')
      })

      // Submit transaction to redemption API
      const submitResponse = await redemptionApi.submitTransaction(
        destAddress,
        {
          transaction: signedTxHex,
          transaction_witness_set: witnessSetHex,
        },
      )

      return submitResponse.transaction_id
    },
    onSuccess: () => {
      // Invalidate eligibility query to refresh allocations
      // Use the same query key structure as useAirdropEligibility
      queryClient.invalidateQueries({
        queryKey: [persistPrefixKeyword, 'airdropEligibility', wallet?.id],
      })
    },
    onError: (error) => {
      logger.error('Failed to submit redemption transaction', {error})
    },
  })

  return {
    buildTransaction: buildTransactionMutation.mutateAsync,
    buildTransactionIsLoading: buildTransactionMutation.isPending,
    buildTransactionError: buildTransactionMutation.error,
    submitTransaction: submitTransactionMutation.mutateAsync,
    submitTransactionIsLoading: submitTransactionMutation.isPending,
    submitTransactionError: submitTransactionMutation.error,
    isSuccess: submitTransactionMutation.isSuccess,
  }
}
