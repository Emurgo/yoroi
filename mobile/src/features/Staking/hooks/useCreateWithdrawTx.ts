import * as React from 'react'

import {getLogger} from '@yoroi/common'
import {useSelectedNetwork} from '~/features/WalletManager/hooks/useSelectedNetwork'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {UsePromiseOptionsWithoutPromise, usePromise} from '~/hooks/usePromise'
import {createWithdrawalTxFromWallet} from '~/wallets/cardano/transaction-recipes'
import {Quantities} from '~/wallets/utils/utils'

import {useStakingInfo} from './useStakingInfo'

export const useCreateWithdrawTx = (
  options?: UsePromiseOptionsWithoutPromise<
    {cbor: string},
    [{shouldDeregister: boolean}]
  >,
) => {
  const {wallet, meta} = useSelectedWallet()
  const {networkManager} = useSelectedNetwork()
  const {stakingInfo} = useStakingInfo(wallet)

  const hasRewards =
    stakingInfo?.status === 'staked' &&
    Quantities.isGreaterThan(stakingInfo.rewards, Quantities.zero)

  const createWithdrawalTxPromise = React.useCallback(
    async ({shouldDeregister}: {shouldDeregister: boolean}) => {
      const logger = getLogger()
      
      logger.info('useCreateWithdrawTx: Creating withdrawal transaction', {
        shouldDeregister,
        addressMode: meta.addressMode,
        rewardAddressHex: wallet.rewardAddressHex,
        hasRewards,
        stakingInfoStatus: stakingInfo?.status,
        stakingInfoRewards: stakingInfo?.rewards,
      })
      
      try {
        const result = await createWithdrawalTxFromWallet(wallet, {
          shouldDeregister,
          addressMode: meta.addressMode,
          networkManager,
        })
        
        logger.info('useCreateWithdrawTx: Withdrawal transaction created successfully', {
          cborLength: result.cbor.length,
        })
        
        return result
      } catch (error) {
        logger.error('useCreateWithdrawTx: Failed to create withdrawal transaction', {
          error: error instanceof Error ? error.message : String(error),
          errorStack: error instanceof Error ? error.stack : undefined,
          shouldDeregister,
        })
        throw error
      }
    },
    [wallet, meta.addressMode, networkManager, hasRewards, stakingInfo],
  )

  const withdrawalTxPromise = usePromise({
    promise: createWithdrawalTxPromise,
    ...options,
  })

  return {
    hasRewards,
    ...withdrawalTxPromise,
  }
}
