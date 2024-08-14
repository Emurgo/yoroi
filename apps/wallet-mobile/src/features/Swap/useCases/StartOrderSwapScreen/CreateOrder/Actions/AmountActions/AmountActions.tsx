import React from 'react'
import {StyleSheet, View} from 'react-native'

import {ResetQuantities} from './ResetQuantities'
import {SwitchTokens} from './SwitchTokens'

export const AmountActions = () => {
  return (
    <View style={styles.container}>
      <SwitchTokens />

      <ResetQuantities />
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
