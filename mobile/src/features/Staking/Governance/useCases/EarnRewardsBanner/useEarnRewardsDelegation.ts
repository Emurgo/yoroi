import {GOVERNANCE_YOROI_DREP_ID_HEX, useGovernance} from '@yoroi/staking'
import {Wallet} from '@yoroi/types'

import * as React from 'react'

import {YoroiWallet} from '~/wallets/cardano/types'
import {YoroiUnsignedTx} from '~/wallets/types/yoroi'

/**
 * Creates a governance delegation transaction that:
 * 1. Registers stake key if needed
 * 2. Delegates to Yoroi DRep
 *
 * NOTE: Current wallet APIs do not support combining pool delegation and
 * governance delegation in a single transaction, so this focuses on
 * governance (DRep) delegation only.
 */
export const useEarnRewardsDelegation = (wallet: YoroiWallet) => {
  const {manager} = useGovernance()

  const createTransaction = React.useCallback(
    async (addressMode: Wallet.AddressMode): Promise<YoroiUnsignedTx> => {
      const stakingInfo = await wallet.getStakingInfo()
      const needsRegistration = stakingInfo.status === 'not-registered'

      const stakingKey = wallet.getStakingKey()

      // 1. Governance delegation certificate (Yoroi DRep)
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
