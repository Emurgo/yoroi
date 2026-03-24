import {RawUtxo} from '@yoroi/api'
import {
  CardanoMobileWrapped,
  collateralConfig,
  utxosMaker,
} from '@yoroi/cardano-wallet'
import type {SelectionStrategy} from '@yoroi/tx'
import {
  createCardanoHaskellConfig,
  rawUtxoToModernUtxo,
  selectUtxos,
} from '@yoroi/tx'
import {Balance} from '@yoroi/types'
import {useWalletManager} from '@yoroi/wallet-manager'

import type {Transaction, WasmModuleProxy} from '@emurgo/cross-csl-core'
import {useMutation, useQueryClient} from '@tanstack/react-query'
import {Buffer} from 'buffer'

import {persistPrefixKeyword} from '~/kernel/connection/ConnectionProvider'
import {logger} from '~/kernel/logger/logger'

import {deriveEscrowAddress} from './addressDerivation'
import {buildEscrowRedeemTx} from './buildRedeemTx'
import {SHELLEY_SLOT_CONFIG} from './constants'
import {fetchPlutusV3CostModel} from './costModels'
import {discoverEscrowUtxo} from './discovery'

function currentSlotFromTime(): number {
  const nowSeconds = Math.floor(Date.now() / 1000)
  return (
    nowSeconds - SHELLEY_SLOT_CONFIG.zeroTime + SHELLEY_SLOT_CONFIG.zeroSlot
  )
}

/**
 * Hook for client-side escrow redeem transactions (thaw #2+).
 * Bypasses the Midnight API entirely — builds and submits directly to the Cardano network.
 */
export const useEscrowRedeem = () => {
  const walletManager = useWalletManager()
  const queryClient = useQueryClient()
  const wallet = walletManager.selected.wallet
  const meta = walletManager.selected.meta

  const buildTransactionMutation = useMutation({
    mutationFn: async (destAddress: string): Promise<string> => {
      if (!wallet || !meta) {
        throw new Error('Wallet not available')
      }

      if (meta.isReadOnly) {
        throw new Error('Cannot redeem tokens from a readonly wallet')
      }

      const primaryTokenId = wallet.portfolioPrimaryTokenInfo.id
      const networkId = wallet.isMainnet ? 1 : 0

      // Derive escrow address from eligible address
      const escrowAddress = await deriveEscrowAddress(destAddress, networkId)
      logger.info('useEscrowRedeem: Derived escrow address', {
        destAddress,
        escrowAddress,
      })

      // Discover escrow UTxO
      const apiBaseUrl = wallet.networkManager.legacyApiBaseUrl
      const escrowUtxo = await discoverEscrowUtxo(escrowAddress, apiBaseUrl)
      logger.info('useEscrowRedeem: Found escrow UTxO', {
        txHash: escrowUtxo.txHash,
        txIndex: escrowUtxo.txIndex,
        nightAmount: escrowUtxo.nightAmount,
        thawsRemaining: escrowUtxo.datum.thawsRemaining.toString(),
        nextThawTime: escrowUtxo.datum.nextThawTime.toString(),
      })

      // Verify thaw is claimable (next thaw time has passed)
      const nowMs = BigInt(Date.now())
      if (escrowUtxo.datum.nextThawTime > nowMs) {
        const nextDate = new Date(Number(escrowUtxo.datum.nextThawTime))
        throw new Error(
          `Thaw not yet available. Next thaw date: ${nextDate.toISOString()}`,
        )
      }

      // Select funding UTxOs and collateral (same pattern as useRedeemThaw)
      const {fundingModernUtxos, collateralModernUtxo, currentSlot} =
        await CardanoMobileWrapped.cslScope(async (_csl) => {
          const rawUtxos = wallet.utxos()
          const modernUtxos = rawUtxos.map((rawUtxo: RawUtxo) => {
            const addressing = wallet.getAddressing(rawUtxo.receiver)
            return rawUtxoToModernUtxo(
              rawUtxo as Parameters<typeof rawUtxoToModernUtxo>[0],
              addressing,
              undefined,
              primaryTokenId,
            )
          })

          // Need ADA for fee + min UTXO for NIGHT output
          const feeAmount: Balance.Amounts = {
            [primaryTokenId]: '5000000' as Balance.Quantity, // 5 ADA
          }

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

          // Track selected funding UTxO IDs
          const selectedFundingUtxoIds = new Set<string>()
          selection.selected.forEach((modernUtxo) => {
            const matchingRawUtxo = rawUtxos.find(
              (rawUtxo) =>
                rawUtxo.tx_hash === modernUtxo.txHash &&
                rawUtxo.tx_index === modernUtxo.txIndex,
            )
            if (matchingRawUtxo) {
              selectedFundingUtxoIds.add(matchingRawUtxo.utxo_id)
            }
          })

          // Find collateral: prefer dedicated pure-ADA UTxOs, fall back to a funding UTxO
          const utxosList = utxosMaker(rawUtxos, collateralConfig)
          const collateralCandidates = utxosList.findCollateralCandidates()
          const availableCollateral = collateralCandidates.filter(
            (utxo: RawUtxo) => !selectedFundingUtxoIds.has(utxo.utxo_id),
          )

          let collateralModern: (typeof modernUtxos)[number] | undefined
          if (availableCollateral.length > 0) {
            const collateralRaw = availableCollateral[0]!
            collateralModern = modernUtxos.find(
              (utxo) =>
                utxo.txHash === collateralRaw.tx_hash &&
                utxo.txIndex === collateralRaw.tx_index,
            )
          }

          // Fall back to using the first funding UTxO as collateral
          if (!collateralModern) {
            logger.info(
              'useEscrowRedeem: No dedicated collateral, using funding UTxO',
            )
            collateralModern = selection.selected[0]
          }

          if (!collateralModern) {
            throw new Error('No collateral UTxO available')
          }

          return {
            fundingModernUtxos: selection.selected,
            collateralModernUtxo: collateralModern,
            currentSlot: currentSlotFromTime(),
          }
        })

      // Get protocol params and cost models for Plutus script
      const plutusV3CostModel = await fetchPlutusV3CostModel()
      const cardanoHaskellConfig = {
        ...createCardanoHaskellConfig(wallet.protocolParams, networkId),
        plutusV3CostModel,
      }

      const changeAddress = wallet.getChangeAddress(meta.addressMode)

      // Build the transaction
      const cbor = await buildEscrowRedeemTx({
        escrowUtxo,
        eligibleAddress: destAddress,
        fundingUtxos: fundingModernUtxos,
        collateralUtxo: collateralModernUtxo,
        changeAddress,
        protocolParams: cardanoHaskellConfig,
        primaryTokenId,
        currentSlot,
      })

      return cbor
    },
    onError: (error) => {
      logger.error('useEscrowRedeem: Failed to build transaction', {error})
    },
  })

  const submitTransactionMutation = useMutation({
    mutationFn: async ({
      signedTx,
    }: {
      signedTx: Transaction | ((csl: WasmModuleProxy) => Transaction)
    }): Promise<void> => {
      if (!wallet) {
        throw new Error('Wallet not available')
      }

      // Submit directly to Cardano network (NOT via Midnight API)
      const txBytes = await CardanoMobileWrapped.cslScope((csl) => {
        const tx = typeof signedTx === 'function' ? signedTx(csl) : signedTx
        return tx.toBytes()
      })

      const base64 = Buffer.from(txBytes).toString('base64')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await wallet.submitTransaction(base64 as any)

      logger.info('useEscrowRedeem: Transaction submitted to Cardano network')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [persistPrefixKeyword, 'airdropEligibility', wallet?.id],
      })
    },
    onError: (error) => {
      logger.error('useEscrowRedeem: Failed to submit transaction', {error})
    },
  })

  return {
    buildEscrowTransaction: buildTransactionMutation.mutateAsync,
    buildEscrowTransactionIsLoading: buildTransactionMutation.isPending,
    buildEscrowTransactionError: buildTransactionMutation.error,
    submitEscrowTransaction: submitTransactionMutation.mutateAsync,
    submitEscrowTransactionIsLoading: submitTransactionMutation.isPending,
    submitEscrowTransactionError: submitTransactionMutation.error,
    isEscrowSuccess: submitTransactionMutation.isSuccess,
  }
}
