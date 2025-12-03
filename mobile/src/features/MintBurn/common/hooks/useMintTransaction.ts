import {
  type TransactionMetadata,
  addInputs,
  addMetadata,
  addMint,
  buildTransaction,
  createCardanoHaskellConfig,
  createMintAction,
  createTransactionBuilder,
  selectUtxosForAmounts,
  setChangeAddress,
  setTTLWithBuffer,
} from '@yoroi/tx'
import {Balance, Wallet} from '@yoroi/types'

import {BigNumber} from 'bignumber.js'
import * as React from 'react'

import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {convertRawUtxosToModernUtxos} from '@yoroi/cardano-wallet/transaction-recipes/helpers'
import {YoroiWallet} from '@yoroi/cardano-wallet/types'

import {storePolicyScript} from '../storage/mintPolicyStorage'
import type {MintFormData} from '../types'
import {createNativeScriptFromWallet} from '../utils/createNativeScript'
import {validateBase64Image} from '../utils/imageUtils'
import {validateImageUrl} from '../utils/imageUtils'
import {
  assetNameToHex,
  createFTMetadata,
  createNFTMetadata,
} from '../utils/metadataUtils'

export const useMintTransaction = ({
  wallet,
  addressMode,
}: {
  wallet: YoroiWallet
  addressMode: Wallet.AddressMode
}) => {
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)
  const navigateToTxReview = useWalletNavigation().navigateToTxReview

  const mint = React.useCallback(
    async (formData: MintFormData) => {
      setIsLoading(true)
      setError(null)

      try {
        // Validate form data
        if (formData.tokenType === 'ft') {
          if (!formData.tokenName || !formData.quantity || !formData.decimals) {
            throw new Error('Missing required FT fields')
          }
          if (formData.imageBase64) {
            const imageValidation = validateBase64Image(formData.imageBase64)
            if (!imageValidation.valid) {
              throw new Error(imageValidation.error || 'Invalid image')
            }
          }
        } else {
          if (!formData.assetName || !formData.imageUrl || !formData.name) {
            throw new Error('Missing required NFT fields')
          }
          const imageValidation = validateImageUrl(formData.imageUrl)
          if (!imageValidation.valid) {
            throw new Error(imageValidation.error || 'Invalid image URL')
          }
        }

        // Create native script from wallet
        const {script, policyId} = await createNativeScriptFromWallet(
          wallet,
          addressMode,
        )

        // Store policy script for future burns
        await storePolicyScript(wallet.id, policyId, script)

        // Create asset name hex
        const assetNameHex =
          formData.tokenType === 'ft'
            ? assetNameToHex(formData.tokenName!)
            : assetNameToHex(formData.assetName!)

        // Create metadata
        let metadata: Record<string, unknown>
        if (formData.tokenType === 'ft') {
          metadata = createFTMetadata(
            policyId,
            assetNameHex,
            formData.tokenName!,
            parseInt(formData.decimals!, 10),
            formData.imageBase64!,
            formData.description,
          )
        } else {
          metadata = createNFTMetadata(
            policyId,
            assetNameHex,
            formData.name!,
            formData.imageUrl!,
            formData.description,
          )
        }

        // Create mint action
        const mintAction = createMintAction(
          policyId,
          assetNameHex,
          formData.tokenType === 'ft' ? formData.quantity! : '1',
          script,
        )

        // Get change address and UTXOs
        const changeAddress = wallet.getChangeAddress(addressMode)
        if (!changeAddress) {
          throw new Error('Wallet has no change address')
        }

        const primaryTokenId = wallet.portfolioPrimaryTokenInfo.id

        // Convert raw UTXOs to ModernUtxo format
        const modernUtxos = convertRawUtxosToModernUtxos(
          wallet.utxos(),
          (address) => wallet.getAddressing(address),
          primaryTokenId,
        )

        // Select UTXOs for fees (estimate ~200000 lovelace for minting transaction)
        const estimatedFee = '200000'
        const selectedUtxos = selectUtxosForAmounts(
          modernUtxos,
          {} as Balance.Amounts,
          primaryTokenId,
          estimatedFee,
        )

        if (selectedUtxos.length === 0) {
          throw new Error('Insufficient funds to pay for transaction fees')
        }

        // Get absolute slot number for TTL
        const time = await wallet
          .checkServerStatus()
          .then(({serverTime}) => serverTime || Date.now())
          .catch(() => Date.now())
        const absSlotNumber = new BigNumber(
          wallet.networkManager.epoch.progress(new Date(time)).absoluteSlot,
        )

        // Build transaction
        let builderState = createTransactionBuilder()

        // Add inputs
        builderState = addInputs(builderState, selectedUtxos)

        // Add mint action
        builderState = addMint(builderState, mintAction)

        // Set change address (minted tokens will go here)
        builderState = setChangeAddress(builderState, changeAddress)

        // Set TTL with buffer
        builderState = setTTLWithBuffer(builderState, absSlotNumber.toNumber())

        // Add metadata
        builderState = addMetadata(
          builderState,
          formData.tokenType === 'ft' ? '20' : '721',
          metadata as TransactionMetadata['data'],
        )

        // Build unsigned transaction
        const protocolConfig = createCardanoHaskellConfig(
          wallet.protocolParams,
          wallet.networkManager.chainId,
        )
        const unsignedTx = await buildTransaction(builderState, protocolConfig)

        // Navigate to review screen
        navigateToTxReview({
          cbor: unsignedTx.cbor,
          onSuccess: () => {
            setIsLoading(false)
          },
          onError: (err) => {
            setError(err instanceof Error ? err : new Error(String(err)))
            setIsLoading(false)
          },
          context: 'send',
        })
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        setError(error)
        setIsLoading(false)
      }
    },
    [wallet, addressMode, navigateToTxReview],
  )

  return {
    mint,
    isLoading,
    error,
  }
}
