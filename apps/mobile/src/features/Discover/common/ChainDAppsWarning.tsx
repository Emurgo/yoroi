import {useQuery} from '@tanstack/react-query'
import {useAsyncStorage, useMutationWithInvalidations} from '@yoroi/common'
import {Chain} from '@yoroi/types'
import * as React from 'react'
import {Text, View} from 'react-native'

import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'

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
    <View
      style={{
        padding: 16,
        backgroundColor: '#fff3cd',
        borderColor: '#ffeaa7',
        borderWidth: 1,
        borderRadius: 8,
      }}
    >
      <Text style={{fontWeight: 'bold', marginBottom: 8}}>
        {strings.testnetWarningTitle}
      </Text>
      <Text style={{marginBottom: 8}}>{strings.testnetWarningDescription}</Text>
      <Button title="Close" onPress={handleOnClose} />
    </View>
  )
}

const useDAppsWarning = () => {
  const storage = useAsyncStorage()
  const {wallet} = useSelectedWallet()
  const walletStorage = storage.join(`wallet/${wallet.id}/dAppsWarning/`)
  const queryKey = [wallet.id, 'dAppsWarning']
  return useQuery({
    queryKey,
    queryFn: async () =>
      (await walletStorage.getItem<boolean | null>('accepted')) ?? false,
  })
}

const useAcceptedDAppsWarning = () => {
  const storage = useAsyncStorage()
  const {wallet} = useSelectedWallet()
  const walletStorage = storage.join(`wallet/${wallet.id}/dAppsWarning/`)
  const queryKey = [wallet.id, 'dAppsWarning']
  const mutation = useMutationWithInvalidations({
    mutationFn: (accepted: boolean) =>
      walletStorage.setItem('accepted', accepted),
    invalidateQueries: [queryKey],
  })
  return {...mutation, accept: mutation.mutate}
}
