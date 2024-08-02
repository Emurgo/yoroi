import {useExchange} from '@yoroi/exchange'
import {useTheme} from '@yoroi/theme'
import {Chain} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {Space} from '../../../../components/Space/Space'
import {useWalletManager} from '../../../WalletManager/context/WalletManagerProvider'
import {useStrings} from '../useStrings'

type Props = {
  fee: number
  label: string
  rightAdornment: React.ReactNode
  leftAdornment: React.ReactNode
  onPress: () => void
  disabled?: boolean
}

export const ProviderItem = ({onPress, fee, rightAdornment, leftAdornment, disabled, label}: Props) => {
  const styles = useStyles()
  const strings = useStrings()
  const {
    selected: {network},
  } = useWalletManager()
  const {orderType} = useExchange()

  const isPreprod = network === Chain.Network.Preprod
  const isSancho = network === Chain.Network.Sancho
  const isMainnet = network === Chain.Network.Mainnet

  if ((isPreprod || isSancho) && orderType === 'buy') return null

  return (
    <>
      <Space height={isMainnet ? '_2xs' : 'lg'} />

      <TouchableOpacity onPress={onPress} style={styles.item} disabled={disabled}>
        {leftAdornment}

        <Space width="md" />

        <View style={styles.labels}>
          <Text style={styles.label}>{label}</Text>

          <Text style={styles.fee}>{`${fee}% ${strings.fee}`}</Text>
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
      color: color.gray_c900,
    },
    fee: {
      ...atoms.body_3_sm_regular,
      color: color.gray_c600,
    },
  })

  return styles
}
