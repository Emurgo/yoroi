import {getProviderUrl} from '@yoroi/swap'
import {useTheme} from '@yoroi/theme'
import {Swap} from '@yoroi/types'
import React from 'react'
import {Linking, StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {Spacer} from '../../../../components/Spacer/Spacer'
import {ProviderIcon} from './ProviderIcon'

export const Provider = ({provider}: {provider: Swap.Provider}) => {
  const styles = useStyles()

  return (
    <View style={styles.liquidityPool}>
      <ProviderIcon provider={provider} size={18} />

      <Spacer width={4} />

      <TouchableOpacity onPress={() => Linking.openURL(getProviderUrl(provider))} style={styles.liquidityPoolLink}>
        <Text style={styles.liquidityPoolText}>{`${provider.charAt(0).toUpperCase()}${provider
          .slice(1)
          .replace(/-.*/, '')}`}</Text>
      </TouchableOpacity>
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    liquidityPoolLink: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    liquidityPoolText: {
      color: color.text_primary_medium,
      ...atoms.body_1_lg_medium,
    },
    liquidityPool: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  })

  return styles
}
