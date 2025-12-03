import {getTransactionSigners} from '@yoroi/cardano-wallet'
import {createRawTxSigningKey} from '@yoroi/cardano-wallet'
import {CardanoMobileWrapped} from '@yoroi/cardano-wallet'
import type {SelectionStrategy} from '@yoroi/tx'
import {rawUtxoToModernUtxo, selectUtxos, signRawTransaction} from '@yoroi/tx'
import {Balance} from '@yoroi/types'
import {useWalletManager} from '@yoroi/wallet-manager/context/WalletManagerProvider'

import {useMutation, useQueryClient} from '@tanstack/react-query'
import {Buffer} from 'buffer'

import {logger} from '~/kernel/logger/logger'

import {redemptionApi} from '../api/redemptionApi'
import type {BuildTransactionRequest} from '../types'

// Set to true to use mock data instead of API calls (for UI testing)
const USE_MOCK_DATA = true

/**
 * Hook for redeeming thawed NIGHT tokens
 *
 * The API builds the transaction, so we need to:
 * - Select UTXOs with enough ADA for fees
 * - Convert wallet UTXOs to the format expected by the API
 * - Sign the built transaction using wallet's private keys
 * - Extract witness set and submit
 */
export const useRedeemThaw = () => {
  const walletManager = useWalletManager()
  const queryClient = useQueryClient()
  const wallet = walletManager.selected.wallet
  const meta = walletManager.selected.meta

  const mutation = useMutation({
    mutationFn: async ({
      destAddress,
      rootKey,
    }: {
      destAddress: string
      rootKey: string
    }): Promise<string> => {
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

      // Wallet is considered ready if we can access its properties
      // The try-catch below will handle cases where wallet is not ready

      // Mock mode - return fake transaction ID
      if (USE_MOCK_DATA) {
        logger.debug('useRedeemThaw: Using mock redemption')
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))
        return `mock-tx-${Date.now()}`
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
          const modernUtxos = wallet.utxos().map((rawUtxo) => {
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

      // Build transaction
      const buildResponse = await redemptionApi.buildTransaction(
        destAddress,
        buildRequest,
      )

      // Sign the transaction
      const unsignedTxHex = buildResponse.transaction
      const signedTxBytes = await CardanoMobileWrapped.cslScope(async (csl) => {
        // Get required signers for this transaction
        const signers = await getTransactionSigners(unsignedTxHex, wallet, meta)

        // Create private keys for each signer
        const keys = signers.map((signer: number[]) =>
          createRawTxSigningKey(rootKey, signer, csl),
        )

        // Sign the transaction using tx package
        return signRawTransaction(unsignedTxHex, keys)
      })

      const signedTxHex = Buffer.from(signedTxBytes).toString('hex')

      // Extract witness set from signed transaction
      const witnessSetHex = CardanoMobileWrapped.cslScope((csl) => {
        const signedTx = csl.Transaction.fromBytes(signedTxBytes)
        const witnessSet = signedTx.witnessSet()
        return Buffer.from(witnessSet.toBytes()).toString('hex')
      })

      // Submit transaction
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
      queryClient.invalidateQueries({
        queryKey: ['airdropEligibility', wallet?.id],
      })
    },
    onError: (error) => {
      logger.error('Failed to redeem thaw', {error})
    },
  })

  return {
    redeem: mutation.mutate,
    redeemAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  }
}
