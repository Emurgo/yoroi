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
  return (
    <View style={styles.liquidityPool}>
      {liquidityPoolIcon}

      <Spacer width={8} />

      <TouchableOpacity onPress={() => Linking.openURL(poolUrl)} style={styles.liquidityPoolLink}>
        <Text style={styles.liquidityPoolText}>{liquidityPoolName}</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  liquidityPoolLink: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  liquidityPoolText: {
    color: '#4B6DDE',
    fontFamily: 'Rubik',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
  liquidityPool: {
    flexDirection: 'row',
    alignItems: 'center',
  },
})
