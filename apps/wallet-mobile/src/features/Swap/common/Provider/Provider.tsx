import {getProviderUrl} from '@yoroi/swap'
import {useTheme} from '@yoroi/theme'
import {Swap} from '@yoroi/types'
import React from 'react'
import {Linking, StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {Spacer} from '../../../../components/Spacer/Spacer'
import {ProviderIcon} from './ProviderIcon'

export const Provider = ({
  provider,
  append = '',
  noLink = false,
}: {
  provider: Swap.Provider
  append?: string
  noLink?: boolean
}) => {
  const styles = useStyles()

  return (
    <View style={styles.container}>
      <ProviderIcon provider={provider} size={18} />

      <Spacer width={4} />

      <TouchableOpacity
        onPress={() => Linking.openURL(getProviderUrl(provider))}
        style={styles.button}
        disabled={noLink}
      >
        <Text style={[styles.text, !noLink && styles.link]}>{`${provider.charAt(0).toUpperCase()}${provider
          .slice(1)
          .replace(/-/, ' ')}${append}`}</Text>
      </TouchableOpacity>
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    button: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      ...atoms.py_2xs,
      ...atoms.body_1_lg_medium,
      color: color.text_gray_medium,
    },
    link: {
      color: color.text_primary_medium,
    },
    container: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  })

  return styles
}
