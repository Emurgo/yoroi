import {getYoroiDrepIdHex} from '@yoroi/staking'
import {Wallet} from '@yoroi/types'

import * as React from 'react'

import {createCombinedDelegationTxFromWallet} from '~/wallets/cardano/transaction-recipes/wallet-helpers'
import {YoroiWallet} from '~/wallets/cardano/types'

/**
 * Creates combined delegation transactions to earn rewards:
 * 1. Registers stake key if needed
 * 2. Delegates to Yoroi DRep (governance rewards)
 * 3. Delegates to stake pool (staking rewards) - if poolId provided
 *
 * Uses the multi-operation transaction recipe to combine both delegations
 * in a single transaction when poolId is provided.
 */
export const useEarnRewardsDelegation = (wallet: YoroiWallet) => {
  const createTransaction = React.useCallback(
    async (
      addressMode: Wallet.AddressMode,
      poolId?: string,
    ): Promise<{cbor: string}> => {
      // Create DRep value for Yoroi DRep (network-aware)
      const yoroiDrepIdHex = getYoroiDrepIdHex(wallet.networkManager.network)
      const drepValue: {KeyHash: string} = {
        KeyHash: yoroiDrepIdHex,
      }

      // Use combined delegation recipe to create transaction with both:
      // - Stake pool delegation (if poolId provided)
      // - DRep vote delegation (always)
      return createCombinedDelegationTxFromWallet(wallet, {
        poolId,
        drepValue,
        addressMode,
      })
    },
    [wallet],
  )

  return {
    createEarnRewardsTx: createTransaction,
  }
}
