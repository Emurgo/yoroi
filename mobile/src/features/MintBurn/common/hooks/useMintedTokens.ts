import {YoroiWallet} from '@yoroi/cardano-wallet/types'
import {Wallet} from '@yoroi/types'

import * as React from 'react'

import {logger} from '~/kernel/logger/logger'

import {getStoredPolicyIds} from '../storage/mintPolicyStorage'
import type {MintedTokenInfo} from '../types'
import {createNativeScriptFromWallet} from '../utils/createNativeScript'

export const useMintedTokens = ({
  wallet,
  addressMode,
}: {
  wallet: YoroiWallet
  addressMode: Wallet.AddressMode
}) => {
  const balances = wallet.balances()
  const [mintedTokens, setMintedTokens] = React.useState<MintedTokenInfo[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const loadMintedTokens = async () => {
      setIsLoading(true)
      try {
        // Get stored policy IDs
        const storedPolicyIds = await getStoredPolicyIds(wallet.id)

        // Get wallet's derived policy ID
        const {policyId: walletPolicyId} = await createNativeScriptFromWallet(
          wallet,
          addressMode,
        )

        // Combine stored and wallet-derived policy IDs
        const allPolicyIds = new Set([...storedPolicyIds, walletPolicyId])

        // Find tokens from balances that match our policy IDs
        const minted: MintedTokenInfo[] = []

        for (const tokenAmount of balances.records.values()) {
          const tokenId = tokenAmount.info.id
          const [policyId, assetNameHex] = tokenId.split('.')
          if (!policyId || !assetNameHex) continue

          // Check if this policy ID matches any of our known policies
          if (allPolicyIds.has(policyId)) {
            minted.push({
              tokenId,
              policyId,
              assetNameHex,
              assetName: tokenAmount.info.name,
              quantity: tokenAmount.quantity.toString(),
              tokenType: tokenAmount.info.type === 'ft' ? 'ft' : 'nft',
              isMintedByMe:
                storedPolicyIds.includes(policyId) ||
                policyId === walletPolicyId,
            })
          }
        }

        setMintedTokens(minted)
      } catch (error) {
        logger.error('Failed to load minted tokens', {error})
      } finally {
        setIsLoading(false)
      }
    }

    loadMintedTokens()
  }, [balances, wallet, addressMode])

  return {
    mintedTokens,
    isLoading,
  }
}
