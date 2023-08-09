import {SafeAreaView} from 'react-native-safe-area-context'
import {Analytics} from '../../../components'
import {StyleSheet} from 'react-native'
import * as React from 'react'

export const AnalyticsChangedScreen = () => {
  const onClose = () => {}

  const onReadMore = () => {
    // TODO: Add agreement link
  }

  return (
    <SafeAreaView style={styles.container}>
      <Analytics type="notice" onClose={onClose} onReadMore={onReadMore} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
})
