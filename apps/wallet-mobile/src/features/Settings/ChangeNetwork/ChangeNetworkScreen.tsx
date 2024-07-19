import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Boundary} from '../../../components'
import {NetworkPickerList} from './NetworkPickerList'

export const ChangeNetworkScreen = () => {
  const styles = useStyles()

  return (
    <SafeAreaView edges={['bottom', 'right', 'left']} style={styles.safeAreaView}>
      <Boundary>
        <NetworkPickerList />
      </Boundary>
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {color} = useTheme()
  const styles = StyleSheet.create({
    safeAreaView: {
      flex: 1,
      backgroundColor: color.bg_color_high,
    },
  })

  return styles
}
