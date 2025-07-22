import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Boundary} from '../../../../../ui/Boundary/Boundary'
import {ThemePickerList} from './ThemePickerList'

export const ChangeThemeScreen = () => {
  const styles = useStyles()

  return (
    <SafeAreaView
      edges={['bottom', 'right', 'left']}
      style={styles.safeAreaView}
    >
      <Boundary>
        <ThemePickerList />
      </Boundary>
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {palette: p} = useTheme()
  const styles = StyleSheet.create({
    safeAreaView: {
      flex: 1,
      backgroundColor: p.bg_color_max,
    },
  })

  return styles
}
