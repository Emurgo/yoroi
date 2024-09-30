import {useAsyncStorage, useMutationWithInvalidations} from '@yoroi/common'
import {Chain} from '@yoroi/types'
import * as React from 'react'
import {useQuery} from '@tanstack/react-query'

import {GradientWarning} from '../../../components/ChainWarning/GradientWarning'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'
import {useWalletManager} from '../../WalletManager/context/WalletManagerProvider'
import {useStrings} from './useStrings'

export const ChainDAppsWarning = () => {
  const strings = useStrings()
  const {
    selected: {network},
  } = useWalletManager()
  const {data: hasAccepted = true} = useDAppsWarning()
  const {accept} = useAcceptedDAppsWarning()
  const isMainnet = network === Chain.Network.Mainnet

  const handleOnClose = () => {
    accept(true)
  }

  if (isMainnet || hasAccepted) return null
  return (
    <GradientWarning
      title={strings.testnetWarningTitle}
      onClose={handleOnClose}
      description={strings.testnetWarningDescription}
    />
  )
}

const useDAppsWarning = () => {
  const storage = useAsyncStorage()
  const {wallet} = useSelectedWallet()
  const walletStorage = storage.join(`wallet/${wallet.id}/dAppsWarning/`)
  const queryKey = [wallet.id, 'dAppsWarning']
  return useQuery(queryKey, async () => (await walletStorage.getItem<boolean | null>('accepted')) ?? false)
}

const useAcceptedDAppsWarning = () => {
  const storage = useAsyncStorage()
  const {wallet} = useSelectedWallet()
  const walletStorage = storage.join(`wallet/${wallet.id}/dAppsWarning/`)
  const queryKey = [wallet.id, 'dAppsWarning']
  const mutation = useMutationWithInvalidations({
    mutationFn: (accepted: boolean) => walletStorage.setItem('accepted', accepted),
    invalidateQueries: [queryKey],
  })
  return {...mutation, accept: mutation.mutate}
}
