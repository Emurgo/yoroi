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
  const {theme} = useTheme()
  const styles = StyleSheet.create({
    item: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    labels: {
      flex: 1,
    },
    label: {
      ...theme.typography['body-1-l-medium'],
      color: theme.color.gray[900],
    },
    fee: {
      ...theme.typography['body-3-s-regular'],
      color: theme.color.gray[600],
    },
  })

  return styles
}
