import * as React from 'react'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Analytics, StatusBar} from '../../../components'
import {useAgreeWithLegal} from '../common'

export const AnalyticsChangedScreen = () => {
  const {agree} = useAgreeWithLegal()
  const onReadMore = () => {
    // TODO: Add agreement link
  }

  const handleClose = () => {
    agree()
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar type="dark" />

      <Analytics type="notice" onClose={handleClose} onReadMore={onReadMore} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
})
