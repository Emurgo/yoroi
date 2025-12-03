import {
  addMint,
  buildTransaction,
  createBurnAction,
  createCardanoHaskellConfig,
  createTransactionBuilder,
} from '@yoroi/tx'
import {Wallet} from '@yoroi/types'

import * as React from 'react'

import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {YoroiWallet} from '@yoroi/cardano-wallet/types'

import {
  canRecreatePolicyFromWallet,
  getPolicyScript,
} from '../storage/mintPolicyStorage'
import type {MintedTokenInfo} from '../types'
import {createNativeScriptFromWallet} from '../utils/createNativeScript'

export const useBurnTransaction = ({
  wallet,
  addressMode,
}: {
  wallet: YoroiWallet
  addressMode: Wallet.AddressMode
}) => {
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)
  const navigateToTxReview = useWalletNavigation().navigateToTxReview

  const burn = React.useCallback(
    async (tokenInfo: MintedTokenInfo, quantity: string) => {
      setIsLoading(true)
      setError(null)

      try {
        // Try to get stored policy script
        let script = await getPolicyScript(wallet.id, tokenInfo.policyId)

        // If not stored, try to recreate from wallet (only works for basic scripts)
        if (!script) {
          const canRecreate = await canRecreatePolicyFromWallet(
            wallet,
            tokenInfo.policyId,
            addressMode,
          )
          if (canRecreate) {
            const result = await createNativeScriptFromWallet(
              wallet,
              addressMode,
            )
            script = result.script
          } else {
            throw new Error(
              'Policy script not found. Please provide recovery data.',
            )
          }
        }

        if (!script) {
          throw new Error('Cannot determine policy script')
        }

        // Create burn action
        const burnAction = createBurnAction(
          tokenInfo.policyId,
          tokenInfo.assetNameHex,
          quantity,
          script,
        )

        // Build transaction
        const builderState = createTransactionBuilder()
        const builderStateWithBurn = addMint(builderState, burnAction)

        // Build unsigned transaction
        const protocolConfig = createCardanoHaskellConfig(
          wallet.protocolParams,
          wallet.networkManager.chainId,
        )
        const unsignedTx = await buildTransaction(
          builderStateWithBurn,
          protocolConfig,
        )

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
    burn,
    isLoading,
    error,
  }
}
