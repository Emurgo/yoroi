/**
 * Hook to check if all required signatures are collected for a transaction
 * Handles nested multisig wallets in multiparty transactions
 */
import {
  CardanoMobileWrapped,
  getMultisigMeta,
  isMultisigWallet,
} from '@yoroi/cardano-wallet'
import {getSignedCoSigners, isSignedByWallet} from '@yoroi/tx'
import {Wallet} from '@yoroi/types'
import {useWalletManager} from '@yoroi/wallet-manager'

import * as React from 'react'

import {logger} from '~/kernel/logger/logger'

export type SignatureStatus = {
  readonly isFullySigned: boolean
  readonly requiredSignatures: number
  readonly collectedSignatures: number
  readonly missingSignatures: number
  readonly signerDetails: ReadonlyArray<{
    readonly walletId: string
    readonly walletName: string
    readonly keyHash: string
    readonly isSigned: boolean
    readonly isMultisig: boolean
    readonly multisigStatus?: {
      readonly requiredCoSigners: number
      readonly signedCoSigners: number
      readonly meetsQuorum: boolean
    }
  }>
}

export const useCheckAllSignatures = () => {
  const {walletManager} = useWalletManager()

  const checkAllSignatures = React.useCallback(
    async (
      cbor: string,
      multiparty?: {
        requiredSigners: ReadonlyArray<{
          readonly walletId: string
          readonly keyHash: string
          readonly walletName: string
        }>
        inputWalletIds?: ReadonlyArray<string>
      },
      multisig?: {
        requiredCoSigners: number
        totalCoSigners: number
        signedCoSigners?: ReadonlyArray<string>
        missingCoSigners?: ReadonlyArray<string>
      },
    ): Promise<SignatureStatus> => {
      if (multisig) {
        // Pure multisig transaction
        const signedCount = multisig.signedCoSigners?.length ?? 0
        const requiredCount = multisig.requiredCoSigners
        const meetsQuorum = signedCount >= requiredCount

        return {
          isFullySigned: meetsQuorum,
          requiredSignatures: requiredCount,
          collectedSignatures: signedCount,
          missingSignatures: requiredCount - signedCount,
          signerDetails: [],
        }
      }

      if (multiparty) {
        // Multiparty transaction - check each signer, including nested multisig wallets
        const signerDetails: Array<SignatureStatus['signerDetails'][number]> =
          []

        for (const signer of multiparty.requiredSigners) {
          // Try to look up wallet name if walletId is available and wallet exists locally
          let resolvedWalletName = signer.walletName
          if (!resolvedWalletName && signer.walletId) {
            const walletMeta = walletManager?.getWalletMetaById(signer.walletId)
            if (walletMeta) {
              resolvedWalletName = walletMeta.name
            }
          }

          // Check if this signer wallet is a multisig wallet
          const wallet = walletManager?.getWalletById(signer.walletId)
          const isMultisig = wallet ? isMultisigWallet(wallet) : false

          if (isMultisig && wallet) {
            // This is a multisig wallet - check if it meets quorum
            const multisigMeta = getMultisigMeta(wallet)
            if (multisigMeta) {
              try {
                // Check if the transaction has signatures from this multisig wallet's co-signers
                const signedCoSigners = await CardanoMobileWrapped.cslScope(
                  async () => {
                    return await getSignedCoSigners(
                      cbor as Wallet.TransactionCbor,
                      multisigMeta.coSigners.map(
                        (c) => c.sharedWalletKey as Wallet.Bip32PublicKeyHex,
                      ),
                      multisigMeta.paymentScriptCbor as Wallet.ScriptCbor,
                      multisigMeta.stakingScriptCbor as Wallet.ScriptCbor,
                    )
                  },
                )

                // Determine required co-signers based on quorum rules
                let requiredCoSigners: number
                if (multisigMeta.quorumRules.kind === 'RequireNOf') {
                  requiredCoSigners =
                    multisigMeta.quorumRules.required ||
                    multisigMeta.coSigners.length
                } else if (multisigMeta.quorumRules.kind === 'RequireAllOf') {
                  requiredCoSigners = multisigMeta.coSigners.length
                } else {
                  requiredCoSigners = 1
                }

                const signedCount = signedCoSigners.length
                const meetsQuorum = signedCount >= requiredCoSigners

                signerDetails.push({
                  walletId: signer.walletId,
                  walletName: resolvedWalletName,
                  keyHash: signer.keyHash,
                  isSigned: meetsQuorum,
                  isMultisig: true,
                  multisigStatus: {
                    requiredCoSigners,
                    signedCoSigners: signedCount,
                    meetsQuorum,
                  },
                })
              } catch (error) {
                logger.error(
                  'useCheckAllSignatures: Failed to check multisig wallet signatures',
                  {
                    error:
                      error instanceof Error ? error.message : String(error),
                    walletId: signer.walletId,
                  },
                )
                // Fallback: treat as not signed
                signerDetails.push({
                  walletId: signer.walletId,
                  walletName: resolvedWalletName,
                  keyHash: signer.keyHash,
                  isSigned: false,
                  isMultisig: true,
                })
              }
            } else {
              // Multisig wallet but no metadata - treat as not signed
              signerDetails.push({
                walletId: signer.walletId,
                walletName: resolvedWalletName,
                keyHash: signer.keyHash,
                isSigned: false,
                isMultisig: true,
              })
            }
          } else {
            // Regular wallet - check if signed
            const isSigned = await isSignedByWallet(
              cbor,
              signer.walletId,
              signer.keyHash,
            )
            signerDetails.push({
              walletId: signer.walletId,
              walletName: resolvedWalletName,
              keyHash: signer.keyHash,
              isSigned,
              isMultisig: false,
            })
          }
        }

        const requiredSignatures = signerDetails.length
        const collectedSignatures = signerDetails.filter(
          (s) => s.isSigned,
        ).length
        const missingSignatures = requiredSignatures - collectedSignatures
        const isFullySignedResult = collectedSignatures === requiredSignatures

        return {
          isFullySigned: isFullySignedResult,
          requiredSignatures,
          collectedSignatures,
          missingSignatures,
          signerDetails: signerDetails as SignatureStatus['signerDetails'],
        }
      }

      // No multiparty/multisig info - assume fully signed
      return {
        isFullySigned: true,
        requiredSignatures: 0,
        collectedSignatures: 0,
        missingSignatures: 0,
        signerDetails: [],
      }
    },
    [walletManager],
  )

  return {checkAllSignatures}
}
