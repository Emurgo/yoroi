import * as React from 'react'

import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {UsePromiseOptions, usePromise} from '~/hooks/usePromise'
import {YoroiUnsignedTx} from '~/wallets/types/yoroi'
import {Quantities} from '~/wallets/utils/utils'

import {useStakingInfo} from './useStakingInfo'

export const useCreateWithdrawTx = (
  options?: UsePromiseOptions<YoroiUnsignedTx, [{shouldDeregister: boolean}]>,
) => {
  const {wallet, meta} = useSelectedWallet()
  const {stakingInfo} = useStakingInfo(wallet)

  const hasRewards =
    stakingInfo?.status === 'staked' //
      ? Quantities.isGreaterThan(stakingInfo.rewards, '0')
      : false

  const createWithdrawalTxPromise = React.useCallback(
    async ({shouldDeregister}: {shouldDeregister: boolean}) => {
      return await wallet.createWithdrawalTx({
        shouldDeregister,
        addressMode: meta.addressMode,
      })
    },
    [wallet, meta.addressMode],
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
