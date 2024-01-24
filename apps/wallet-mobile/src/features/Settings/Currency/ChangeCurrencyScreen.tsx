import React from 'react'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Boundary, StatusBar} from '../../../components'
import {CurrencyPickerList} from './CurrencyPickerList'

export const ChangeCurrencyScreen = () => {
  return (
    <SafeAreaView edges={['bottom', 'right', 'left']} style={styles.safeAreaView}>
      <StatusBar type="dark" />

      <Boundary>
        <CurrencyPickerList />
      </Boundary>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: '#fff',
  },
})
