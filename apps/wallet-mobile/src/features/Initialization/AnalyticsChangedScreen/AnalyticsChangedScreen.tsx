import * as React from 'react'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Analytics} from '../../../components'

export const AnalyticsChangedScreen = () => {
  const onReadMore = () => {
    // TODO: Add agreement link
  }

  return (
    <SafeAreaView style={styles.container}>
      <Analytics type="notice" onReadMore={onReadMore} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
})
