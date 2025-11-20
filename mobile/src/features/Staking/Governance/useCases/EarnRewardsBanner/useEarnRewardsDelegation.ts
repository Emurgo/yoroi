import {
  GOVERNANCE_YOROI_DREP_ID_HEX,
  YOROI_TOP_STAKE_POOL_ID,
  useGovernance,
} from '@yoroi/staking'
import {Wallet} from '@yoroi/types'

import {Certificate} from '@emurgo/cross-csl-core'
import * as React from 'react'

import {YoroiWallet} from '~/wallets/cardano/types'
import {YoroiUnsignedTx} from '~/wallets/types/yoroi'
import {CardanoMobile} from '~/wallets/wallets'

/**
 * Creates a combined transaction that:
 * 1. Registers stake key if needed
 * 2. Delegates to Yoroi top stake pool
 * 3. Delegates to Yoroi DRep
 *
 * All in a single transaction using the StakeAndVoteDelegation certificate type
 */
export const useEarnRewardsDelegation = (wallet: YoroiWallet) => {
  const {manager} = useGovernance()

  const createTransaction = React.useCallback(
    async (addressMode: Wallet.AddressMode): Promise<YoroiUnsignedTx> => {
      // Get staking info to check if stake key is registered
      const stakingInfo = await wallet.getStakingInfo()
      const needsRegistration = stakingInfo.status === 'not-registered'

      // Get the staking key
      const stakingKey = wallet.getStakingKey()

      // Create certificates array
      const certificates: Certificate[] = []

      // 1. Add stake registration certificate if needed
      if (needsRegistration) {
        const registrationCert =
          manager.createStakeRegistrationCertificate(stakingKey)
        certificates.push(registrationCert)
      }

      // 2. Create combined StakeAndVoteDelegation certificate
      // This combines both pool delegation and DRep delegation in one certificate
      const {
        Certificate,
        Ed25519KeyHash,
        Credential,
        StakeAndVoteDelegation,
        DRep,
      } = CardanoMobile

      const stakingCredential = Credential.fromKeyhash(stakingKey.hash())

      // Parse pool ID to get pool key hash
      const poolKeyHash = Ed25519KeyHash.fromBech32(YOROI_TOP_STAKE_POOL_ID)

      // Create DRep from Yoroi DRep ID
      const drepKeyHash = Ed25519KeyHash.fromBytes(
        Buffer.from(GOVERNANCE_YOROI_DREP_ID_HEX, 'hex'),
      )
      const drep = DRep.newKeyHash(drepKeyHash)

      // Create the combined certificate
      const stakeAndVoteDelegation = StakeAndVoteDelegation.new(
        stakingCredential,
        poolKeyHash,
        drep,
      )
      const combinedCert = Certificate.newStakeAndVoteDelegation(
        stakeAndVoteDelegation,
      )
      certificates.push(combinedCert)

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
