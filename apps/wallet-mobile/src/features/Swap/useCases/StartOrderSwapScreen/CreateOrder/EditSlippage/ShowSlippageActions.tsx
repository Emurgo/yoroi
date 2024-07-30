import React from 'react'
import {StyleSheet, View} from 'react-native'

import {EditSlippage} from './EditSlippage'
import {ShowSlippageInfo} from './ShowSlippageInfo'

export const ShowSlippageActions = () => {
  return (
    <View style={styles.container}>
      <ShowSlippageInfo />

      <EditSlippage />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
})
