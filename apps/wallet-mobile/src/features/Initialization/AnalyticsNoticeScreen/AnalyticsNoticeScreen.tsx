import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Linking, StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Analytics} from '../../../components'
import {useAgreeWithLegal, useNavigateTo} from '../common'

export const AnalyticsNoticeScreen = () => {
  const navigateTo = useNavigateTo()
  const styles = useStyles()
  const {agree} = useAgreeWithLegal()

  const onClose = () => {
    agree()
    navigateTo.enableLogingWithPin()
  }

  const onReadMore = () => {
    Linking.openURL('https://emurgohelpdesk.zendesk.com/hc/en-us/articles/7594394140303-What-s-user-insights-')
  }

  return (
    <SafeAreaView style={styles.container}>
      <Analytics type="notice" onClose={onClose} onReadMore={onReadMore} />
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {color} = useTheme()

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: color.gray_cmin,
    },
  })

  return styles
}
