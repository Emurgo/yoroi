import * as React from 'react'

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
      return createWithdrawalTxFromWallet(wallet, {
        shouldDeregister,
        addressMode: meta.addressMode,
        networkManager,
      })
    },
    [wallet, meta.addressMode, networkManager],
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
