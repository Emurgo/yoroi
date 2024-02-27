import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Boundary, StatusBar} from '../../../components'
import {CurrencyPickerList} from './CurrencyPickerList'

export const ChangeCurrencyScreen = () => {
  const styles = useStyles()
  return (
    <SafeAreaView edges={['bottom', 'right', 'left']} style={styles.safeAreaView}>
      <StatusBar type="dark" />

      <Boundary>
        <CurrencyPickerList />
      </Boundary>
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color} = theme
  const styles = StyleSheet.create({
    safeAreaView: {
      flex: 1,
      backgroundColor: color.gray.min,
    },
  })

  return styles
}
