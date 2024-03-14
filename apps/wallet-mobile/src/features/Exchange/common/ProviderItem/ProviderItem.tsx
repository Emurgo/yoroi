import {useTheme} from '@yoroi/theme'
import {Exchange} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {Space} from '../../../../components/Space/Space'
import {ProviderLabel, ProviderLogo} from '../constants'
import {useStrings} from '../useStrings'

type Props = {
  provider: Exchange.Provider
  fee: number
  icon: React.ReactNode
  onPress: () => void
  disabled?: boolean
}

export const ProviderItem = ({provider, onPress, fee, icon, disabled = false}: Props) => {
  const styles = useStyles()
  const strings = useStrings()
  const Logo = ProviderLogo[provider]
  const providerSelected = ProviderLabel[provider]

  return (
    <TouchableOpacity onPress={onPress} style={styles.item} disabled={disabled}>
      <Logo size={40} />

      <Space width="m" />

      <View style={styles.labels}>
        <Text style={styles.provider}>{providerSelected}</Text>

        <Text style={styles.fee}>{`${fee}% ${strings.fee}`}</Text>
      </View>

      {disabled ? null : icon}
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
    provider: {
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
