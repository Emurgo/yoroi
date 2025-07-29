import {useExchange} from '@yoroi/exchange'
import {useTheme} from '@yoroi/theme'
import {Chain} from '@yoroi/types'
import * as React from 'react'
import {Text, TouchableOpacity, View} from 'react-native'

import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {Space} from '~/ui/Space/Space'

type Props = {
  fee: string
  label: string
  rightAdornment: React.ReactNode
  leftAdornment: React.ReactNode
  onPress: () => void
  disabled?: boolean
}

export const ProviderItem = ({
  onPress,
  fee,
  rightAdornment,
  leftAdornment,
  disabled,
  label,
}: Props) => {
  const {atoms: a, palette: p} = useTheme()
  const {
    selected: {network},
  } = useWalletManager()
  const {orderType} = useExchange()

  const isPreprod = network === Chain.Network.Preprod
  const isMainnet = network === Chain.Network.Mainnet
  const isBuy = orderType === 'buy'

  if (isPreprod && isBuy) return null

  return (
    <>
      <Space.Height._2xs />

      <TouchableOpacity
        onPress={onPress}
        style={[a.flex_row, a.align_center]}
        disabled={disabled}
      >
        {leftAdornment}

        <Space.Width.md />

        <View style={[a.flex_1]}>
          <Text style={[a.body_1_lg_medium, {color: p.gray_900}]}>{label}</Text>

          <Text style={[a.body_3_sm_regular, {color: p.gray_600}]}>{fee}</Text>
        </View>

        {!disabled && rightAdornment}
      </TouchableOpacity>
    </>
  )
}
