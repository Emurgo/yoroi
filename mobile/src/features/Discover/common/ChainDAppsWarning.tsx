import {useAsyncStorage, useMutationWithInvalidations} from '@yoroi/common'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Chain} from '@yoroi/types'
import {useWalletManager} from '@yoroi/wallet-manager/context/WalletManagerProvider'
import {useSelectedWallet} from '@yoroi/wallet-manager/hooks/useSelectedWallet'

import {useQuery} from '@tanstack/react-query'
import {LinearGradient} from 'expo-linear-gradient'
import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Icon} from '~/ui/Icon'

export const ChainDAppsWarning = () => {
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()
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
    <View style={[a.relative]}>
      <LinearGradient
        style={[StyleSheet.absoluteFill, a.rounded_sm]}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        colors={p.bg_gradient_1}
      />

      <View style={[a.p_md, a.relative]}>
        <TouchableOpacity
          style={[a.absolute, a.p_sm, {top: 0, right: 0}]}
          onPress={handleOnClose}
        >
          <Icon.CrossCircle size={22} color={p.gray_900} />
        </TouchableOpacity>

        <Text style={[a.body_2_md_medium, a.pb_sm, ta.text_gray_max]}>
          {strings.discover.testnetWarningTitle}
        </Text>
        <Text style={[a.body_2_md_regular, ta.text_gray_max]}>
          {strings.discover.testnetWarningDescription}
        </Text>
      </View>
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
    mutationFn: async (accepted: boolean) => {
      await walletStorage.setItem('accepted', accepted)
    },
    invalidateQueries: [queryKey],
  })
  return {...mutation, accept: mutation.mutate}
}
