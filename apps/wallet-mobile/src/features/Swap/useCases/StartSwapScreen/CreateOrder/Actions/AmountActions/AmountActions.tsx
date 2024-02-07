import React from 'react'
import {StyleSheet, View} from 'react-native'

import {ClearQuantities} from './ClearQuantities'
import {SwitchTokens} from './SwitchTokens'

export const AmountActions = () => {
  return (
    <View style={styles.container}>
      <SwitchTokens />

      <ClearQuantities />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
})
