import {useTheme} from '@yoroi/theme'
import React from 'react'
import {Linking, StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {Spacer} from '../../../../components'

export const LiquidityPool = ({
  liquidityPoolIcon,
  liquidityPoolName,
  poolUrl,
}: {
  liquidityPoolIcon: React.ReactNode
  liquidityPoolName: string
  poolUrl: string
}) => {
  const styles = useStyles()

  return (
    <View style={styles.liquidityPool}>
      {liquidityPoolIcon}

      <Spacer width={4} />

      <TouchableOpacity onPress={() => Linking.openURL(poolUrl)} style={styles.liquidityPoolLink}>
        <Text style={styles.liquidityPoolText}>{liquidityPoolName}</Text>
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
      color: color.primary_500,
      ...atoms.body_1_lg_medium,
    },
    liquidityPool: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  })

  return styles
}
