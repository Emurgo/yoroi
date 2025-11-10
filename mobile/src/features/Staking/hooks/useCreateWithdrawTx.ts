import * as React from 'react'

import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {UsePromiseOptionsWithoutPromise, usePromise} from '~/hooks/usePromise'
import {Quantities} from '~/wallets/utils/utils'

import {useStakingInfo} from './useStakingInfo'

export const useCreateWithdrawTx = (
  options?: UsePromiseOptionsWithoutPromise<
    {cbor: string},
    [{shouldDeregister: boolean}]
  >,
) => {
  const {wallet, meta} = useSelectedWallet()
  const {stakingInfo} = useStakingInfo(wallet)

  const hasRewards =
    stakingInfo?.status === 'staked' &&
    Quantities.isGreaterThan(stakingInfo.rewards, Quantities.zero)

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
