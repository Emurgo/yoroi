import {useExchange} from '@yoroi/exchange'
import {useTheme} from '@yoroi/theme'
import {Chain} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

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
  const styles = useStyles()
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
        style={styles.item}
        disabled={disabled}
      >
        {leftAdornment}

        <Space.Width.md />

        <View style={styles.labels}>
          <Text style={styles.label}>{label}</Text>

          <Text style={styles.fee}>{fee}</Text>
        </View>

        {!disabled && rightAdornment}
      </TouchableOpacity>
    </>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    item: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    labels: {
      flex: 1,
    },
    label: {
      ...atoms.body_1_lg_medium,
      color: color.gray_900,
    },
    fee: {
      ...atoms.body_3_sm_regular,
      color: color.gray_600,
    },
  })

  return styles
}
