import {RawUtxo} from '@yoroi/api'
import {getTransactionSigners} from '@yoroi/cardano-wallet'
import {createRawTxSigningKey} from '@yoroi/cardano-wallet'
import {CardanoMobileWrapped} from '@yoroi/cardano-wallet'
import type {SelectionStrategy} from '@yoroi/tx'
import {rawUtxoToModernUtxo, selectUtxos, signRawTransaction} from '@yoroi/tx'
import {Balance} from '@yoroi/types'
import {useWalletManager} from '@yoroi/wallet-manager'

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

      // Get UTXOs for funding - need enough ADA to cover transaction fees
      // Similar to swap, we request UTXOs that can cover ~5 ADA for fees
      const primaryTokenId = wallet.portfolioPrimaryTokenInfo.id
      const feeAmount: Balance.Amounts = {
        [primaryTokenId]: '5000000' as Balance.Quantity, // 5 ADA in lovelace
      }

      logger.debug('useRedeemThaw: Starting UTXO selection', {
        destAddress,
        walletId: wallet.id,
        feeAmount: feeAmount[primaryTokenId],
        primaryTokenId,
      })

      const fundingUtxosHex = await CardanoMobileWrapped.cslScope(
        async (csl) => {
          // Convert RawUtxo[] to ModernUtxo[] using current pattern
          const rawUtxos = wallet.utxos()
          logger.debug('useRedeemThaw: Converting UTXOs', {
            rawUtxosCount: rawUtxos.length,
          })

          const modernUtxos = rawUtxos.map((rawUtxo: RawUtxo) => {
            const addressing = wallet.getAddressing(rawUtxo.receiver)
            return rawUtxoToModernUtxo(
              rawUtxo as Parameters<typeof rawUtxoToModernUtxo>[0],
              addressing,
              undefined, // derivationPath
              primaryTokenId,
            )
          })

          logger.debug('useRedeemThaw: Selecting UTXOs', {
            modernUtxosCount: modernUtxos.length,
            selectionStrategy: 'keepRelevant',
          })

          // Select UTXOs using keepRelevant strategy (same as swap)
          const selection = selectUtxos(
            feeAmount,
            modernUtxos,
            'keepRelevant' as SelectionStrategy,
            primaryTokenId,
          )

          logger.debug('useRedeemThaw: UTXO selection result', {
            selectedCount: selection.selected.length,
            missingAmounts:
              Object.keys(selection.missingAmounts).length > 0
                ? selection.missingAmounts
                : null,
            selectedUtxos: selection.selected.map((utxo, idx) => ({
              index: idx,
              address: utxo.receiver,
              amounts: Object.keys(utxo.balance),
            })),
          })

          if (
            selection.selected.length === 0 ||
            Object.keys(selection.missingAmounts).length > 0
          ) {
            logger.error('useRedeemThaw: Insufficient UTXOs', {
              selectedCount: selection.selected.length,
              missingAmounts: selection.missingAmounts,
            })
            throw new Error('No UTXOs available with sufficient funds')
          }

          // Convert ModernUtxo to hex strings using toTransactionUnspentOutput
          logger.debug('useRedeemThaw: Converting selected UTXOs to hex', {
            selectedCount: selection.selected.length,
          })

          const utxoHexStrings = await Promise.all(
            selection.selected.map(async (utxo) => {
              const cslUtxo = utxo.toTransactionUnspentOutput(csl)
              return Buffer.from(cslUtxo.toBytes()).toString('hex')
            }),
          )

          logger.debug('useRedeemThaw: UTXO conversion complete', {
            utxoHexStringsCount: utxoHexStrings.length,
            utxoPreviews: utxoHexStrings.map(
              (hex) => `${hex.substring(0, 16)}...`,
            ),
          })

          return utxoHexStrings
        },
      )

      // Get change address
      const changeAddress = wallet.getChangeAddress('multiple')
      logger.debug('useRedeemThaw: Got change address', {
        changeAddress,
      })

      // Build transaction request
      const buildRequest: BuildTransactionRequest = {
        change_address: changeAddress,
        funding_utxos: fundingUtxosHex,
        collateral_utxos: [],
      }

      logger.debug('useRedeemThaw: Building transaction request', {
        destAddress,
        changeAddress,
        fundingUtxosCount: buildRequest.funding_utxos.length,
        collateralUtxosCount: buildRequest.collateral_utxos.length,
      })

      // Build transaction
      const buildResponse = await redemptionApi.buildTransaction(
        destAddress,
        buildRequest,
      )

      logger.debug('useRedeemThaw: Transaction built successfully', {
        transactionId: buildResponse.transaction_id,
        redeemedAmount: buildResponse.redeemed_amount,
        requireThawingExtraSignature:
          buildResponse.require_thawing_extra_signature,
        transactionLength: buildResponse.transaction.length,
      })

      // Sign the transaction
      const unsignedTxHex = buildResponse.transaction
      logger.debug('useRedeemThaw: Signing transaction', {
        unsignedTxLength: unsignedTxHex.length,
      })

      const signedTxBytes = await CardanoMobileWrapped.cslScope(async (csl) => {
        // Get required signers for this transaction
        const signers = await getTransactionSigners(unsignedTxHex, wallet, meta)
        logger.debug('useRedeemThaw: Got transaction signers', {
          signersCount: signers.length,
          signers: signers.map((s) => s.join('/')),
        })

        // Create private keys for each signer
        const keys = signers.map((signer: number[]) =>
          createRawTxSigningKey(rootKey, signer, csl),
        )

        logger.debug('useRedeemThaw: Created signing keys', {
          keysCount: keys.length,
        })

        // Sign the transaction using tx package
        const signed = await signRawTransaction(unsignedTxHex, keys)
        logger.debug('useRedeemThaw: Transaction signed', {
          signedTxLength: signed.length,
        })
        return signed
      })

      const signedTxHex = Buffer.from(signedTxBytes).toString('hex')
      logger.debug('useRedeemThaw: Signed transaction converted to hex', {
        signedTxHexLength: signedTxHex.length,
      })

      // Extract witness set from signed transaction
      const witnessSetHex = CardanoMobileWrapped.cslScope((csl) => {
        const signedTx = csl.Transaction.fromBytes(signedTxBytes)
        const witnessSet = signedTx.witnessSet()
        const witnessSetBytes = witnessSet.toBytes()
        logger.debug('useRedeemThaw: Extracted witness set', {
          witnessSetLength: witnessSetBytes.length,
        })
        return Buffer.from(witnessSetBytes).toString('hex')
      })

      logger.debug('useRedeemThaw: Submitting transaction', {
        destAddress,
        transactionLength: signedTxHex.length,
        witnessSetLength: witnessSetHex.length,
      })

      // Submit transaction
      const submitResponse = await redemptionApi.submitTransaction(
        destAddress,
        {
          transaction: signedTxHex,
          transaction_witness_set: witnessSetHex,
        },
      )

      logger.info('useRedeemThaw: Transaction submitted successfully', {
        destAddress,
        transactionId: submitResponse.transaction_id,
        estimatedSubmissionTime: submitResponse.estimated_submission_time,
      })

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
