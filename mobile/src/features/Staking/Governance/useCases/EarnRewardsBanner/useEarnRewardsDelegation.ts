import {GOVERNANCE_YOROI_DREP_ID_HEX, useGovernance} from '@yoroi/staking'
import {Balance, Wallet} from '@yoroi/types'

import BigNumber from 'bignumber.js'
import * as React from 'react'

import {YoroiWallet} from '~/wallets/cardano/types'
import {YoroiUnsignedTx} from '~/wallets/types/yoroi'
import {Quantities} from '~/wallets/utils/utils'

/**
 * Creates delegation transactions to earn rewards:
 * 1. Registers stake key if needed
 * 2. Delegates to Yoroi DRep (governance rewards)
 * 3. Delegates to stake pool (staking rewards)
 
 */
export const useEarnRewardsDelegation = (wallet: YoroiWallet) => {
  const {manager} = useGovernance()

  const createTransaction = React.useCallback(
    async (
      addressMode: Wallet.AddressMode,
      poolId?: string,
    ): Promise<YoroiUnsignedTx> => {
      const stakingInfo = await wallet.getStakingInfo()
      const needsRegistration = stakingInfo.status === 'not-registered'
      const stakingKey = wallet.getStakingKey()

      // If pool ID is provided, create pool delegation tx
      if (poolId) {
        const accountStates = await wallet.fetchAccountState()
        const accountState = accountStates[wallet.rewardAddressHex]
        if (!accountState) throw new Error('Account state not found')

        const stakingUtxos = await wallet.getAllUtxosForKey()
        const amountToDelegate = Quantities.sum([
          ...stakingUtxos.map((utxo) => utxo.amount as Balance.Quantity),
          accountState.remainingAmount as Balance.Quantity,
        ])

        return wallet.createDelegationTx({
          poolId,
          delegatedAmount: new BigNumber(amountToDelegate),
          addressMode,
        })
      }

      // Otherwise, create DRep delegation tx
      const delegationCert = manager.createDelegationCertificate(
        GOVERNANCE_YOROI_DREP_ID_HEX,
        'key',
        stakingKey,
      )

      const registrationCert = needsRegistration
        ? manager.createStakeRegistrationCertificate(stakingKey)
        : null

      const certificates =
        registrationCert != null
          ? [registrationCert, delegationCert]
          : [delegationCert]

      const unsignedTx = await wallet.createUnsignedGovernanceTx({
        votingCertificates: certificates,
        addressMode,
      })

      return unsignedTx
    },
    [manager, wallet],
  )

  return {
    createEarnRewardsTx: createTransaction,
  }
}
