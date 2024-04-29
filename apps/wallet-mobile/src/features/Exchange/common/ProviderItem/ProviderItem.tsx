import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {Space} from '../../../../components/Space/Space'
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

  return (
    <TouchableOpacity onPress={onPress} style={styles.item} disabled={disabled}>
      {leftAdornment}

      <Space width="m" />

      <View style={styles.labels}>
        <Text style={styles.label}>{label}</Text>

        <Text style={styles.fee}>{`${fee}% ${strings.fee}`}</Text>
      </View>

      {!disabled && rightAdornment}
    </TouchableOpacity>
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
