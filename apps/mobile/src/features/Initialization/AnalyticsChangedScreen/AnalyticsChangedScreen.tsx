import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Linking, StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Analytics} from '../../../components/Analytics/Analytics'
import {useAgreeWithLegal} from '../common'

export const AnalyticsChangedScreen = () => {
  const {agree} = useAgreeWithLegal()
  const styles = useStyles()

  const onReadMore = () => {
    Linking.openURL('https://emurgohelpdesk.zendesk.com/hc/en-us/articles/7594394140303-What-s-user-insights-')
  }

  const handleClose = () => {
    agree()
  }

  return (
    <SafeAreaView style={styles.container}>
      <Analytics type="notice" onClose={handleClose} onReadMore={onReadMore} />
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {color} = useTheme()

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: color.bg_color_max,
    },
  })

  return styles
}
